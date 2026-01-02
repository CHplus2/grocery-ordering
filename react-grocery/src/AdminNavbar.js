import { NavLink } from "react-router-dom";
import "./AdminNavbar.css";

export default function AdminNavbar() {
  return (
    <nav className="admin-navbar">
      <h2 className="admin-logo">Admin Panel</h2>
      <div className="nav-links">
        <NavLink
          to="/admin/products"
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/customers"
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Customers
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Orders
        </NavLink>
      </div>
    </nav>
  );
}
