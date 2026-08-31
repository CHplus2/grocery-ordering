from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal
from ..models import CartItem, Address, Wallet, WalletTransaction, Order, OrderItem
from ..serializers import OrderSerializer, AddressSerializer

# ------------------------------------------
# ORDER 
# ------------------------------------------

class OrderList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def place_order(request):
    user = request.user
    address_id = request.data.get("address_id")
    payment = request.data.get("payment")

    if not address_id:
        return Response({"detail": "address_id required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        address = Address.objects.get(id=address_id, user=user)
    except Address.DoesNotExist:
        return Response({"detail": "Invalid address"}, status=status.HTTP_404_NOT_FOUND)

    cart_items = CartItem.objects.filter(user=user)
    if not cart_items.exists():
        return Response({"detail": "Cart empty"}, status=status.HTTP_400_BAD_REQUEST)
    
    if payment == "paypal" or payment =="wallet":
        is_paid = "paid"
    else:
        is_paid = "unpaid"

    cart_total = sum(item.quantity * item.product.price for item in cart_items)

    if payment == "wallet":
        wallet = Wallet.objects.get(user=user)
        if wallet.balance < cart_total:
            return Response({"detail": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)

        wallet.balance -= cart_total
        wallet.save()

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

    shipping_fee = Decimal("5.00") if total < 50 else Decimal("0.00")
    
    order.total_amount = total
    order.shipping_fee = shipping_fee
    order.save()

    cart_items.delete()

    if payment == "wallet":
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=order.total_amount,
            type="payment",
            reference=f"Order #{order.id}"
        )

    return Response({"detail": "Order placed", "order_id": order.id}, status=status.HTTP_201_CREATED)


# ------------------------------------------
# ADDRESS
# ------------------------------------------

class AddressListCreate(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)