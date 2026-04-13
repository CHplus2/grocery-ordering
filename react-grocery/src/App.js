import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { useCart } from "./CartContext";
import CartProvider from "./CartContext";
import RequireAuth from "./RequireAuth";
import GroceryLogin from "./GroceryLogin";
import GrocerySignup from "./GrocerySignup";
import DeleteProduct from "./DeleteProduct";
import CheckoutPage from "./CheckoutPage";
import PaymentPage from "./PaymentPage";
import ProductsPage from "./ProductsPage";
import ProductsDetailPage from "./ProductDetailPage";
import CartPage from "./CartPage";
import OrdersPage from "./OrdersPage";
import AdminProductsPage from "./AdminProductsPage";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminReportsPage from "./AdminReportsPage";
import AdminCustomersPage from "./AdminCustomersPage";
import "./App.css";
import { useEffect } from "react";

function AnimatedRoutes() {
  const location = useLocation();

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
            >
              <RequireAuth message="Please log in to view products">
                <ProductsPage/>
              </RequireAuth>
            </motion.div>
          } 
        />
        <Route 
          path="/products/:id" 
          element={
            <motion.div
              {...page_motion}
            >
              <RequireAuth message="Please log in to view product details">
                <ProductsDetailPage/>
              </RequireAuth>
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
            <Link to="/">Products</Link>
            {isAuthenticated && <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">My Orders</Link>
            </>}
            {isAdmin && <>
              <Link to="/admin/products">Admin Products</Link>
              <Link to="/admin/customers">Customers</Link>
              <Link to="/admin/orders">Orders</Link>
              <Link to="/admin/reports">Reports</Link>
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
