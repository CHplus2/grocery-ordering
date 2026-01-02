from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

router = DefaultRouter()
router.register(r"cart", api_views.CartViewSet, basename="cart")

router2 = DefaultRouter()
router2.register(r"admin/products", api_views.AdminProductViewSet, basename="admin-products")

urlpatterns = [
    # -------- AUTH --------
    path("login/", api_views.spa_login),
    path("signup/", api_views.spa_signup),
    path("logout/", api_views.spa_logout),
    path("check-auth/", api_views.spa_check_auth),

    # -------- PRODUCTS & CATEGORIES --------
    path("products/", api_views.ProductListCreate.as_view()),
    path("products/<int:pk>/", api_views.ProductDetail.as_view()),
    path("categories/", api_views.CategoryListCreate.as_view()),
    path("categories/<int:pk>/", api_views.CategoryDetail.as_view()),

    # -------- ADDRESS & ORDERS --------
    path("addresses/", api_views.SPAAddressCreateView.as_view(), name="spa-address-create"),
    path("orders/", api_views.OrderList.as_view()),
    path("orders/place/", api_views.place_order),

    # -------- ADMIN --------
    # admin products
    path("admin/orders/", api_views.admin_order_list),
    path("admin/orders/<int:order_id>/", api_views.admin_orders_view),
    path("admin/customers/", api_views.spa_admin_customers),
    path("admin/customers/<int:pk>/", api_views.spa_admin_customer_update),
    path("admin/reports/sales/", api_views.spa_sales_report),
]

urlpatterns += router.urls + router2.urls

"""
    path("admin/products/add/", api_views.add_product),
    path("admin/products/<int:pk>/", api_views.admin_product_detail),
    path("admin/orders/", api_views.admin_order_list),
    path("admin/orders/<int:pk>/", api_views.admin_order_detail),
    path("admin/customers/", api_views.admin_customers_list),
    path("admin/customers/<int:pk>/", api_views.admin_customer_update),
    path("admin/reports/product-sales/", api_views.product_sales_report),
"""
