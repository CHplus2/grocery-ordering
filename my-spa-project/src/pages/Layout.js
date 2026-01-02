import { Link } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children, isAuthenticated, isAdmin, handleLogout }) {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-logo">GroceryX</Link>
          <Link to="/">Products</Link>
          <Link to="/cart">Cart</Link>
          {(!isAdmin && isAuthenticated) && (
            <Link to="/orders">Orders</Link>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/products">Admin Products</Link>
              <Link to="/admin/orders">Orders</Link>
              <Link to="/admin/customers">Customers</Link>
              <Link to="/admin/reports">Reports</Link>
            </>
          )}
        </div>

        <div className="nav-right">
          {isAuthenticated 
            ? <button className="btn-logout" onClick={handleLogout}>Logout</button>
            : <Link to="/login" className="btn-login">Login</Link>}
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        © 2025 GroceryX. All rights reserved.
      </footer>
    </div>
  );
}
