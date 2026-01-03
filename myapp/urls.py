from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import *

router = DefaultRouter()
router.register("cart", CartViewSet, basename="cart")

urlpatterns = [
    path("", index, name="index"),

    # Categories
    path("api/categories/", CategoryListCreate.as_view()),
    path("api/categories/<int:pk>/", CategoryDetail.as_view()),

    # Products
    path("api/products/", ProductListCreate.as_view()),
    path("api/products/<int:pk>/", ProductDetail.as_view()),

    # Address
    path("api/addresses/", AddressListCreate.as_view()),

    # Orders
    path("api/orders/", OrderList.as_view()),
    path("api/orders/place/", place_order),

    # Admin 
    path("api/admin/products/add/", ProductListCreate.as_view()),
    path("api/admin/products/<int:pk>/", ProductDetail.as_view()),
    path("api/admin/orders/", admin_order_list, name="admin-order-list"),
    path("api/admin/orders/<int:pk>/", admin_order_detail, name="admin-order-detail"),
    path("api/admin/reports/sales/", product_sales_report, name="product-sales-report"),
    path("api/admin/customers/", admin_customers_list, name="admin-customers-list"),
    path("api/admin/customers/<int:pk>/", admin_customer_update, name="admin-customer-update"),

    # Auth
    path("api/signup/", signup_view),
    path("api/login/", login_view),
    path("api/logout/", logout_view),
    path("api/check-auth/", check_auth),


    # Another React app
    path("api/spa/", include("myapp.api_urls")),
] + router.urls
