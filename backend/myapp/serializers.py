from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Product, CartItem, Order, OrderItem, Address
)
from .services.ai import ai_summarize

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        if validated_data.get("description") and not validated_data.get("ai_summary"):
            ai_summary = ai_summarize(validated_data["description"])
            if ai_summary:
                validated_data["ai_summary"] = ai_summary

        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if "description" in validated_data and instance.description != validated_data.get("description"):
            try:
                ai_summary = ai_summarize(validated_data["description"])
                if ai_summary:
                    instance.ai_summary = ai_summary
            except Exception as e:
                pass

        return super().update(instance, validated_data)


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "added_at"]
        read_only_fields = ["id", "added_at"]


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ["id", "user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    address = AddressSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = "__all__"

    def get_user(self, obj):
        return {"id": obj.user.id, "username": obj.user.username}
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "is_staff", "is_active"]
        read_only_fields = ["id", "username"]