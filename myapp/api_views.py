from rest_framework import generics, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.db.models import Sum, F
from django.utils.decorators import method_decorator

import json

from .models import (
    Category, Product, CartItem, Order, OrderItem, Address
)
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    CartItemSerializer,
    OrderSerializer,
    OrderItemSerializer,
    AddressSerializer,
    UserSerializer
)
from django.contrib.auth.models import User
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Disable CSRF check


class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CartViewSet(viewsets.ViewSet):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        items = CartItem.objects.filter(user=request.user)
        return Response(CartItemSerializer(items, many=True).data)

    def create(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        if not product_id:
            return Response({"detail": "product_id required"}, status=400)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"}, status=404)

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            item.quantity += quantity
            item.save()

        return Response(CartItemSerializer(item).data, status=201)

    def partial_update(self, request, pk=None):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({"detail": "Cart item not found"}, status=404)

        quantity = request.data.get("quantity")
        if quantity is None:
            return Response({"detail": "Quantity required"}, status=400)

        quantity = int(quantity)
        if quantity <= 0:
            item.delete()
            return Response({"detail": "Item removed"})

        item.quantity = quantity
        item.save()
        return Response(CartItemSerializer(item).data)

    def destroy(self, request, pk=None):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({"detail": "Cart item not found"}, status=404)

        item.delete()
        return Response({"detail": "Item removed"})

class SPAAddressCreateView(generics.CreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")
    
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@authentication_classes([CsrfExemptSessionAuthentication])
def place_order(request):
    user = request.user
    address_id = request.data.get("address_id")
    payment = request.data.get("payment")

    if not address_id:
        return Response({"error": "address_id required"}, status=400)

    try:
        address = Address.objects.get(id=address_id, user=user)
    except Address.DoesNotExist:
        return Response({"error": "Invalid address"}, status=404)

    cart_items = CartItem.objects.filter(user=user)
    if not cart_items.exists():
        return Response({"error": "Cart empty"}, status=400)

    order = Order.objects.create(
        user=user,
        address=address,
        total_amount=0,
        status="pending",
        payment_status="paid" if payment == "paypal" else "unpaid",
    )

    total = 0
    for item in cart_items:
        subtotal = item.quantity * item.product.price
        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            unit_price=item.product.price,
            quantity=item.quantity,
            subtotal=subtotal,
        )
        total += subtotal

    order.total_amount = total
    order.save()
    cart_items.delete()

    return Response(
        {"message": "Order placed", "order_id": order.id},
        status=201
    )

@api_view(["GET"])
@permission_classes([IsAdminUser])
def spa_sales_report(request):
    report = (
        OrderItem.objects
        .values("product__id", "product_name")
        .annotate(
            total_quantity=Sum("quantity"),
            total_revenue=Sum(F("quantity") * F("unit_price")),
        )
        .order_by("-total_quantity")
    )

    return Response(report)

@csrf_exempt
@api_view(["POST"])
def spa_signup(request):
    data = json.loads(request.body.decode("utf-8"))
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not username or not password or password != confirm_password:
        return Response({"error": "Invalid input"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username taken"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    login(request, user)
    return Response({"message": "User created and logged in"}, status=201)

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([]) 
def spa_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({"message": "Logged in"})

    return Response({"error": "Invalid credentials"}, status=401)

@csrf_exempt
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
def spa_logout(request):
    logout(request)
    return Response({"message": "Logged out"})

@api_view(["GET"])
def spa_check_auth(request):
    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "username": request.user.username,
            "is_admin": request.user.is_staff,
        })
    return Response({"authenticated": False})

@api_view(["GET"])
@permission_classes([IsAdminUser])
def spa_admin_customers(request):
    users = User.objects.all().values(
        "id", "username", "is_active", "is_staff"
    )
    return Response(list(users))


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def spa_admin_customer_update(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    is_active = request.data.get("is_active")
    if is_active is not None:
        user.is_active = is_active
        user.save()

    return Response({
        "id": user.id,
        "is_active": user.is_active
    })

from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from .models import Order, Address, User, Product
from django.db.models import Sum, F

# Utility decorator: admin-only
def admin_required(view_func):
    decorated_view_func = user_passes_test(lambda u: u.is_staff)(view_func)
    return decorated_view_func

# ----------------------------
# ORDERS
# ----------------------------
@api_view(["PUT"])
@permission_classes([IsAdminUser])
@admin_required
def admin_orders_view(request, order_id=None):
    import json
    data = json.loads(request.body)
    order = get_object_or_404(Order, id=order_id)
    order.status = data.get("status", order.status)
    order.payment_status = data.get("payment_status", order.payment_status)
    order.save()
    return JsonResponse({"success": True})

# ----------------------------
# CUSTOMERS
# ----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_order_list(request):
    orders = Order.objects.all().order_by("-created_at")  # reverse order: latest first
    serializer = OrderSerializer(orders, many=True)
    return JsonResponse(serializer.data, safe=False)

@csrf_exempt
@require_http_methods(["GET", "PUT"])
@admin_required
def admin_customers_view(request, user_id=None):
    if request.method == "GET":
        users = list(User.objects.all().values("id", "username", "is_active", "is_staff"))
        return JsonResponse(users, safe=False)

    elif request.method == "PUT" and user_id:
        import json
        data = json.loads(request.body)
        user = get_object_or_404(User, id=user_id)
        user.is_active = data.get("is_active", user.is_active)
        user.save()
        return JsonResponse({"id": user.id, "is_active": user.is_active})

# ----------------------------
# REPORTS (Product Sales)
# ----------------------------
@csrf_exempt
@require_http_methods(["GET"])
@admin_required
def admin_reports_sales_view(request):
    reports = Product.objects.annotate(
        total_quantity=Sum("order_items__quantity"),
        total_revenue=Sum(F("order_items__quantity") * F("order_items__product__price"))
    ).values("id", "name", "total_quantity", "total_revenue")
    return JsonResponse(list(reports), safe=False)

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser] 