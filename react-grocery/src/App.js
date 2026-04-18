import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { User } from "lucide-react";
import { useCart } from "./contexts/CartContext";
import CartProvider from "./contexts/CartContext";
import RequireAuth from "./hoc/RequireAuth";
import GroceryLogin from "./components/LoginModal/GroceryLogin";
import GrocerySignup from "./components/SignupModal/GrocerySignup";
import DeleteProduct from "./components/DeleteProductModal/DeleteProduct";
import ProductsPage from "./pages/customer/ProductsPage";
import ProductsDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import OrdersPage from "./pages/customer/OrdersPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import PaymentPage from "./pages/customer/PaymentPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();

  const { isAdmin } = useCart();

  const page_motion = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -10 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div
              {...page_motion}
            > {isAdmin ? <Navigate to="/admin/products" replace />: <ProductsPage/>}
            </motion.div>
          } 
        />
        <Route 
          path="/products/:id" 
          element={
            <motion.div
              {...page_motion}
            >
              <ProductsDetailPage/>
            </motion.div>
          } 
        />
        <Route 
          path="/cart" 
          element={
            <motion.div
              {...page_motion}
            >
              <RequireAuth message="Please log in to view your cart">
                <CartPage />
              </RequireAuth>
            </motion.div>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <motion.div
              {...page_motion}
            >
              <RequireAuth message="Please log in to proceed to checkout">
                <CheckoutPage />
              </RequireAuth>
            </motion.div>
          }
        />
        <Route 
          path="/payment/:method" 
          element={
            <motion.div
              {...page_motion}
            >
              <RequireAuth message="Please log in to proceed to checkout">
                <PaymentPage />
              </RequireAuth>
            </motion.div>

          }
        />
        <Route 
          path="/orders" 
          element={
            <motion.div
              {...page_motion}
            >
              <RequireAuth message="Please log in to view your orders">
                <OrdersPage />
              </RequireAuth>
            </motion.div>
          }
        />
        <Route 
          path="/admin/products" 
          element={
            <motion.div {...page_motion}>
              <RequireAuth message="Admin access required">
                <AdminProductsPage />
              </RequireAuth>
            </motion.div>
          }
        />
        <Route 
          path="/admin/orders" 
          element={
            <motion.div {...page_motion}>
              <RequireAuth message="Admin access required">
                <AdminOrdersPage />
              </RequireAuth>
            </motion.div>
          }
        />
        <Route 
          path="/admin/reports" 
          element={
            <motion.div {...page_motion}>
              <RequireAuth message="Admin access required">
                <AdminReportsPage />
              </RequireAuth>
            </motion.div>
          }
        />
        <Route 
          path="/admin/customers" 
          element={
            <motion.div {...page_motion}>
              <RequireAuth message="Admin access required">
                <AdminCustomersPage />
              </RequireAuth>
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const { 
    modalMotion, refreshCart,
    showLogin, setShowLogin,
    showSignup, setShowSignup,
    dropdownOpen, setDropdownOpen,
    isAuthenticated, isAdmin,
    alert, setAlert,
    checkAuth, handleLogout,
    productIdToDelete, setProductIdToDelete,
    deleteProduct
  } = useCart();

  useEffect(() => {
    if (!alert.message) return;

    const timer = setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 2500);

    return () => clearTimeout(timer);
  }, [alert, setAlert]);

  return (
    <Router>
      <nav>
          <div className="nav-left">
            <Link to="/" className="brand">
              TokenFresh
            </Link>

            {isAdmin ? <>
              <Link to="/admin/products">Admin Products</Link>
              <Link to="/admin/customers">Customers</Link>
              <Link to="/admin/orders">Orders</Link>
              <Link to="/admin/reports">Reports</Link>
            </> : <>
              <Link to="/">Products</Link>
              {isAuthenticated && <>
                <Link to="/cart">Cart</Link>
                <Link to="/orders">My Orders</Link>
              </>}
            </>}
          </div>
        
          <div className="nav-right">
            {isAuthenticated === null ? null : isAuthenticated === false ? (
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                Log in
              </button>
            ) : (
              <div className="user-dropdown">
                <button 
                  className="user-icon"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={28} color="white" />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-content">
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
      </nav>

      <AnimatePresence>
        {showSignup && (
          <GrocerySignup 
            animation={modalMotion}
            onClose={() => setShowSignup(false)}
            onOpen={() => setShowLogin(true)}
            onSuccess={() => {
              checkAuth();
              refreshCart();         
            }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showLogin && (
          <GroceryLogin 
            animation={modalMotion}
            onClose={() => setShowLogin(false)}
            onOpen={() => setShowSignup(true)}
            onSuccess={() => {
              checkAuth();
              refreshCart();               
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {productIdToDelete && (
          <DeleteProduct 
            animation={modalMotion}
            onClose={() => setProductIdToDelete(null)}
            onSuccess={() => {
              deleteProduct(productIdToDelete);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert?.message && (
          <motion.div 
            className={`alert ${alert.type}`}
            initial={{ opacity: 0, y:30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div>
              {alert.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatedRoutes></AnimatedRoutes>
    </Router>
  )
}

export default function App() {

  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
