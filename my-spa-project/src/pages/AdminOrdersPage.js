import { useEffect, useState } from "react";
import { getCookie } from "../utils";
import "./AdminOrdersPage.css";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all admin orders
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/spa/admin/orders/", {
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      alert("Could not load orders");
    }
  };

  const startEdit = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status || "pending");
    setNewPaymentStatus(order.payment_status || "unpaid");
  };

  const saveEdit = async () => {
    if (!editingOrder) return;

    try {
      const res = await fetch(`http://localhost:8000/api/spa/admin/orders/${editingOrder.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          payment_status: newPaymentStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      setEditingOrder(null);
      fetchOrders(); // reload admin orders
    } catch (err) {
      console.error(err);
      alert("Could not update order");
    }
  };

  return (
    <div className="admin-orders-container">
      <h1 className="admin-title">Admin Order Management</h1>

      {orders.map((order) => (
        <div key={order.id} className="admin-order-card">
          <div className="order-row">
            <p><strong>Order #{order.id}</strong></p>
            <p className="order-status">{order.status?.toUpperCase()}</p>
          </div>

          <p className="order-user">
            Customer: <strong>{order.user?.username ?? "Unknown"}</strong>
          </p>

          <p>Total Amount: <strong>RM {order.total_amount}</strong></p>
          <p>Payment Status: <strong>{order.payment_status}</strong></p>

          <p><strong>Items:</strong></p>
          <ul className="order-item-list">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product_name} × {item.quantity}
              </li>
            ))}
          </ul>

          <button className="edit-btn" onClick={() => startEdit(order)}>
            View / Edit
          </button>
        </div>
      ))}

      {editingOrder && (
        <div className="edit-modal">
          <h2>Order #{editingOrder.id}</h2>

          {/* Address Section */}
          <div className="modal-address-block">
            <strong>Shipping Address:</strong>
            <p>
              {editingOrder.address?.line1}<br />
              {editingOrder.address?.line2 && (
                <>
                  {editingOrder.address.line2}<br />
                </>
              )}
              {editingOrder.address?.city}, {editingOrder.address?.state}{" "}
              {editingOrder.address?.postal_code}<br />
              {editingOrder.address?.country}<br />
              Phone: {editingOrder.address?.phone}
            </p>
          </div>

          {/* Status Select */}
          <label htmlFor="status-select">Order Status:</label>
          <select
            id="status-select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status Select */}
          <label htmlFor="payment-select">Payment Status:</label>
          <select
            id="payment-select"
            value={newPaymentStatus}
            onChange={(e) => setNewPaymentStatus(e.target.value)}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>

          <div className="modal-buttons">
            <button className="modal-save" onClick={saveEdit}>Save</button>
            <button className="modal-cancel" onClick={() => setEditingOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
