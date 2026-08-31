from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views.auth import signup_view, login_view, logout_view, check_auth
from .views.products import CategoryListCreate, CategoryDetail, ProductListCreate, ProductDetail, recommend
from .views.cart import CartViewSet
from .views.orders import OrderList, place_order, AddressListCreate
from .views.wallet import get_wallet, create_wallet, topup_wallet
from .views.admin import admin_order_list, admin_order_detail, product_sales_report, AdminCustomerViewSet

router = DefaultRouter()
router.register("cart", CartViewSet, basename="cart")
router.register("admin/customers", AdminCustomerViewSet, basename="admin-customers")

urlpatterns = [
    # Categories
    path("categories/", CategoryListCreate.as_view()),
    path("categories/<int:pk>/", CategoryDetail.as_view()),

    # Products
    path("products/", ProductListCreate.as_view()),
    path("products/<int:pk>/", ProductDetail.as_view()),

    # Address
    path("addresses/", AddressListCreate.as_view()),

    # Orders
    path("orders/", OrderList.as_view()),
    path("orders/place/", place_order),

    # Recommendation
    path("recommendation/", recommend),

    # Admin 
    path("admin/products/add/", ProductListCreate.as_view()),
    path("admin/products/<int:pk>/", ProductDetail.as_view()),
    path("", include(router.urls)),
    path("admin/orders/", admin_order_list, name="admin-order-list"),
    path("admin/orders/<int:pk>/", admin_order_detail, name="admin-order-detail"),
    path("admin/reports/sales/", product_sales_report, name="product-sales-report"),

    # Wallet
    path("wallet/", get_wallet),
    path("wallet/create/", create_wallet),
    path("wallet/topup/", topup_wallet),

    # Auth
    path("signup/", signup_view),
    path("login/", login_view),
    path("logout/", logout_view),
    path("check-auth/", check_auth),
    
] 
