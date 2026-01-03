from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission, SAFE_METHODS
from .models import Product
from django.contrib.auth.models import User
from .serializers import ProductSerializer, UserSerializer
from django.db.models import Sum, F
from .models import Category, Product, CartItem, Order, OrderItem, Address
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    CartItemSerializer,
    OrderSerializer,
    AddressSerializer
)
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator

import json

# ------------------------------------------
# FRONTEND
# ------------------------------------------

def index(request):
    return render(request, "frontend.html")


# ------------------------------------------
# GET PERMISSION
# ------------------------------------------

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# ------------------------------------------
# CATEGORY CRUD
# ------------------------------------------

class CategoryListCreate(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


# ------------------------------------------
# PRODUCT CRUD
# ------------------------------------------

@method_decorator(csrf_protect, name="dispatch")
class ProductListCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]


# ------------------------------------------
# CART
# ------------------------------------------

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        items = CartItem.objects.filter(user=request.user)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

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
            return Response({"detail": "Item removed"}, status=200)

        item.quantity = quantity
        item.save()

        return Response(CartItemSerializer(item).data, status=200)

    def destroy(self, request, pk=None):
        try:
            item = CartItem.objects.get(pk=pk, user=request.user)
        except CartItem.DoesNotExist:
            return Response({"detail": "Cart item not found"}, status=404)

        item.delete()
        return Response({"detail": "Item removed"}, status=200)


# ------------------------------------------
# ADDRESS
# ------------------------------------------

class AddressListCreate(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=request.user)


# ------------------------------------------
# ORDER PLACEMENT
# ------------------------------------------

class OrderList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=request.user).order_by("-created_at")


@api_view(["POST"])
@permission_classes([IsAdminUser])
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
    
    if payment == "paypal":
        is_paid = "paid"
    else:
        is_paid = "unpaid"

    # --- Create order ---
    order = Order.objects.create(
        user=user,
        address=address,
        total_amount=0,
        status="pending",
        payment_status=is_paid,
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
        # reduce stock
        if payment == "paypal":
            item.product.stock -= item.quantity
            item.product.save()

        total += subtotal

    order.total_amount = total
    order.save()

    cart_items.delete()
    return Response({"message": "Order placed", "order_id": order.id}, status=201)


# ------------------------------------------
# AUTH
# ------------------------------------------

@csrf_exempt
def signup_view(request):
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        username = data.get("username")
        password = data.get("password")
        confirm_password = data.get("confirmPassword")

        if not username or not password or not confirm_password:
            return JsonResponse({"error": "Missing fields"}, status=400)

        if password != confirm_password:
            return JsonResponse({"error": "Password mismatch"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username taken"}, status=400)

        user = User.objects.create_user(username=username, password=password)
        login(request, user)

        return JsonResponse({"message": "User created and logged in"}, status=201)

    return JsonResponse({"error": "Invalid method"}, status=405)


@api_view(["POST"])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({"message": "Logged in"})
    return Response({"error": "Invalid credentials"}, status=401)


def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logged out"})


def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True,
            "username": request.user.username,
            "is_admin": request.user.is_staff  
        })
    return JsonResponse({"authenticated": False})


# ------------------------------------------
# ADMIN
# ------------------------------------------

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_order_list(request):
    orders = Order.objects.all().order_by("-created_at")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_order_detail(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    new_status = request.data.get("status")
    new_payment_status = request.data.get("payment_status")

    if new_status:
        order.status = new_status
        order.save()

    if new_payment_status:
        order.payment_status = new_payment_status
        order.save()

    return Response({"message": "Order updated", "order": OrderSerializer(order).data})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def product_sales_report(request):
    """
    Returns total quantity sold and total revenue per product.
    """
    sales = (
        OrderItem.objects
        .values("product__id", "product_name")
        .annotate(
            total_quantity=Sum("quantity"),
            total_revenue=Sum(F("quantity") * F("unit_price"))
        )
        .order_by("-total_revenue")
    )
    return Response(sales)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_customers_list(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_customer_update(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    serializer = UserSerializer(user, data=request.data, partial=True)  # partial=True allows partial updates
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)