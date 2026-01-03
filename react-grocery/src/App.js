import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { useCart } from "./CartContext";
import CartProvider from "./CartContext";
import GroceryLogin from "./GroceryLogin";
import GrocerySignup from "./GrocerySignup";
import CheckoutPage from "./CheckoutPage";
import ProductsPage from "./ProductsPage";
import ProductsDetailPage from "./ProductDetailPage";
import CartPage from "./CartPage";
import AdminProductsPage from "./AdminProductsPage";
import AdminAddProduct from "./AdminAddProduct";
import AdminOrdersPage from "./AdminOrdersPage";
import AdminReportsPage from "./AdminReportsPage";
import AdminCustomersPage from "./AdminCustomersPage";
import "./App.css";

function AnimatedRoutes({ isAdmin }) {
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
              <ProductsPage/>
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
              <CartPage />
            </motion.div>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <motion.div
              {...page_motion}
            >
              <CheckoutPage />
            </motion.div>
          }
        />
        {isAdmin && (
          <>
            <Route 
              path="/admin/products" 
              element={
                <motion.div {...page_motion}>
                  <AdminProductsPage />
                </motion.div>
              }
            />
            <Route 
              path="/admin/add-product" 
              element={
                <motion.div {...page_motion}>
                  <AdminAddProduct />
                </motion.div>
              }
            />
            <Route 
              path="/admin/orders" 
              element={
                <motion.div {...page_motion}>
                  <AdminOrdersPage />
                </motion.div>
              }
            />
            <Route 
              path="/admin/reports" 
              element={
                <motion.div {...page_motion}>
                  <AdminReportsPage />
                </motion.div>
              }
            />
            <Route 
              path="/admin/customers" 
              element={
                <motion.div {...page_motion}>
                  <AdminCustomersPage />
                </motion.div>
              }
            />
          </>
        )}
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const { 
    modalMotion, refreshCart,
    checkAuth, handleLogout,
    showLogin, setShowLogin,
    showSignup, setShowSignup,
    dropdownOpen, setDropdownOpen,
    isAuthenticated, isAdmin
  } = useCart();

  return (
    <Router>
      <nav>
          <div className="nav-left">
            <Link to="/" className="brand">
              TokenFresh
            </Link>
            <Link to="/">Products</Link>
            <Link to="/cart">Cart</Link>
            {isAdmin && <>
              <Link to="/admin/products">Admin Products</Link>
              <Link to="/admin/customers">Customers</Link>
              <Link to="/admin/orders">Orders</Link>
              <Link to="/admin/reports">Reports</Link>
            </>}
          </div>
        
          <div className="nav-right">
            {!isAuthenticated ? (
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
      
      <AnimatedRoutes
        isAdmin={isAdmin}
      ></AnimatedRoutes>

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
