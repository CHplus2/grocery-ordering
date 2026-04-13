from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum
from ..models import Product, OrderItem

num = 30

def get_user_top_categories(user, days=180, top_k=5):
    since = timezone.now() - timedelta(days=days)

    qs = (
        OrderItem.objects
        .filter(order__user=user, order__created_at__gte=since, product__isnull=False)
        .values("product__category_id", "product__category__name")
        .annotate(qty=Sum("quantity"))
        .order_by("-qty")[:top_k]
    )

    top_category_ids = set()
    top_category_names = []

    for row in qs:
        if row["product__category_id"] is not None:
            top_category_ids.add(row["product__category_id"])
            top_category_names.append(row["product__category__name"])

    return top_category_ids, top_category_names

def get_user_bought_product_ids(user, days=365):
    since = timezone.now() - timedelta(days=days)

    return set(
        OrderItem.objects
        .filter(order__user=user, order__created_at__gte=since, product__isnull=False)
        .values_list("product_id", flat=True)
        .distinct()
    )

def get_user_product_counts(user, days=365):
    since = timezone.now() - timedelta(days=days)

    qs = (
        OrderItem.objects
        .filter(order__user=user, order__created_at__gte=since, product__isnull=False)
        .values("product_id")
        .annotate(qty=Sum("quantity"))
        .order_by("-qty")
    )

    return {row["product_id"]: int(row["qty"] or 0) for row in qs}

def get_global_product_popularity(days=30, top_n=num):
    since = timezone.now() - timedelta(days=days)

    qs = (
        OrderItem.objects
        .filter(order__created_at__gte=since, product__isnull=False)
        .values("product_id")
        .annotate(qty=Sum("quantity"))
        .order_by("-qty")[:top_n]
    )

    return {row["product_id"]: row["qty"] or 0 for row in qs}

def get_score(p, top_category_ids=None, user_qty_by_product=None, global_qty=None):
    top_category_ids = top_category_ids or set()
    user_qty_by_product = user_qty_by_product or {}
    global_qty = global_qty or {}

    score = 0
    reasons = []

    if p.category_id in top_category_ids:
        score += 25
        reasons.append("You often buy items from this category")

    bought_qty = user_qty_by_product.get(p.id, 0)
    if bought_qty > 0:
        score += min(20, 5 * bought_qty)
        reasons.append(f"You bought this before (x{bought_qty})")

    pop = global_qty.get(p.id, 0)
    if pop > 0:
        score += min(15, int(pop ** 0.5))
        reasons.append("Popular recently")

    return score, reasons

def handle_recommendation(candidates, top_category_ids, user_qty_by_product, global_qty, excluded_ids, pre_limit=None):
    if excluded_ids:
        candidates = candidates.exclude(id__in=excluded_ids)

    if pre_limit is not None:
        candidates = candidates[:pre_limit]

    items = []
    for p in candidates:
        score, reasons = get_score(p, top_category_ids, user_qty_by_product, global_qty)

        if score > 0 :
            items.append({
                "product_id": p.id,
                "product_name": p.name,
                "product_img": p.image_url,
                "product_price": p.price,
                "score": score,
                "reasons": reasons
            })

    items.sort(key=lambda x: (x["score"], global_qty.get(x["product_id"], 0)), reverse=True)
    return items

def recommend_for_user(user, limit=20, exclude_bought=False):
    top_category_ids, _ = get_user_top_categories(user)
    user_qty_by_product = get_user_product_counts(user)
    global_qty = get_global_product_popularity()

    excluded_ids = get_user_bought_product_ids(user) if exclude_bought else set()
    global_ids = global_qty.keys()

    global_candidates = (
        Product.objects
        .filter(stock__gt=0, id__in=global_ids)
        .select_related("category")
    )

    if not top_category_ids and not user_qty_by_product:
        global_items = handle_recommendation(
            candidates=global_candidates, 
            top_category_ids=set(), 
            user_qty_by_product={}, 
            global_qty=global_qty, 
            excluded_ids=excluded_ids
        )
        return global_items[:limit]
    
    cat_limit = int(0.7 * limit)
    global_limit = limit - cat_limit

    recommended = []

    if top_category_ids and cat_limit > 0:
        cat_candidates = (
            Product.objects
            .filter(stock__gt=0,category_id__in=top_category_ids)
            .select_related("category")
        )

        cat_items = handle_recommendation(
            cat_candidates, top_category_ids, user_qty_by_product, global_qty, excluded_ids
        )[:cat_limit]

        recommended.extend(cat_items)
        excluded_ids.update([x["product_id"] for x in cat_items])
        
    if global_qty and global_limit > 0:
        global_items = handle_recommendation(
            global_candidates, set(), {}, global_qty, excluded_ids
        )[:global_limit]

        recommended.extend(global_items)

    return sorted(
        recommended, 
        key=lambda x: (x["score"], global_qty.get(x["product_id"], 0)), 
        reverse=True
    )[:limit]
