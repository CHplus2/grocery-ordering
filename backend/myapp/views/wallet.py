from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid
from decimal import Decimal
from ..models import Wallet, WalletTransaction

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    try: 
        wallet = Wallet.objects.get(user=request.user)
        return Response({
            "id": wallet.id,
            "balance": float(wallet.balance),
            "wallet_address": wallet.wallet_address
        })
    except Wallet.DoesNotExist:
        return Response({"detail": "No wallet found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_wallet(request):
    if Wallet.objects.filter(user=request.user).exists():
        return Response({"detail": "Wallet already exists"}, status=status.HTTP_400_BAD_REQUEST)

    wallet = Wallet.objects.create(
        user=request.user,
        balance=0,
        wallet_address=f"TF-{uuid.uuid4().hex[:12].upper()}",
        is_external=False
    )

    return Response({
        "id": wallet.id,
        "balance": float(wallet.balance),
        "wallet_address": wallet.wallet_address
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def topup_wallet(request):
    amount = Decimal(str(request.data.get("amount", 0)))

    if amount <= 0:
        return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        wallet = Wallet.objects.get(user=request.user)
    except Wallet.DoesNotExist:
        return Response({"detail": "No wallet found"}, status=status.HTTP_404_NOT_FOUND)
    
    wallet.balance += amount
    wallet.save()

    WalletTransaction.objects.create(
        wallet=wallet,
        amount=amount,
        type="deposit",
        reference="Manual top-up"
    )

    return Response({
        "balance": float(wallet.balance),
        "message": f"Successfully added {amount} TFT"
    }, status=status.HTTP_200_OK
)