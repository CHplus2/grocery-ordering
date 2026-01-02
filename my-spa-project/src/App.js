import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OrdersPage from "./pages/OrdersPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import Layout from "./pages/Layout";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import { checkAuth, logoutUser } from "./api/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const refreshAuth = async () => {
    try {
      const data = await checkAuth();
      setIsAuthenticated(data.authenticated);
      setIsAdmin(data.is_admin);
    } catch {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    refreshAuth(); // run on app load
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            handleLogout={handleLogout}
          >
            <ProductsPage />
          </Layout>
        }
      />
      <Route
        path="product/:id"
        element={
          <Layout
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            handleLogout={handleLogout}
          >
            <ProductDetailPage />
          </Layout>
        }
      />
      <Route
        path="/cart"
        element={
          <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
            <CartPage />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
            <CheckoutPage />
          </Layout>
        }
      />

      <Route
        path="/login"
        element={
          <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
            <LoginPage onLogin={refreshAuth} />
          </Layout>
        }
      />

      <Route
        path="/signup"
        element={
          <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
            <SignupPage onSignup={refreshAuth} />
          </Layout>
        }
      />
      {!isAdmin && (
        <Route
            path="/orders"
            element={
              <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
                <OrdersPage />
              </Layout>
            }
          />
      )}
      {/* ADMIN ROUTES */}
      {isAdmin && (
        <>
          <Route
            path="/admin/orders"
            element={
              <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
                <AdminOrdersPage />
              </Layout>
            }
          />
          <Route
            path="/admin/products"
            element={
              <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
                <AdminProductsPage />
              </Layout>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
                <AdminCustomersPage />
              </Layout>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} handleLogout={handleLogout}>
                <AdminReportsPage />
              </Layout>
            }
          />
        </>
      )}
    </Routes>
  );
}

export default App;
