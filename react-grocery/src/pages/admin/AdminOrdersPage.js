import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { getCookie } from "../../utils/cookieUtils";
import "./AdminOrdersPage.css";

export default function AdminOrdersPage() {
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const { adminOrders, fetchAdminOrders, formatOrderNumber } = useCart();

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  const startEdit = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status || "pending");
    setNewPaymentStatus(order.payment_status || "unpaid");
  };

  const saveEdit = async () => {
    if (!editingOrder) return;

    await fetch(`/api/admin/orders/${editingOrder.id}/`, {
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

    setEditingOrder(null);
    fetchAdminOrders();
  };

  return (
    <div className="orders-container">
      <h1 className="orders-title">All Orders</h1>

      {adminOrders.length > 0 ? (
        <>
          {adminOrders.map((order) => (
            <div key={order.id} className="order-card">

              {/* HEADER */}
              <div className="order-header">
                <div>
                  <p className="order-id">Order #{formatOrderNumber(order.id)}</p>
                  <p className="order-user">
                    {order.user?.username ?? "Unknown"}
                  </p>
                </div>

                <div className="badge-group">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>

                  <span className={`payment-badge payment-${order.payment_status}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="order-body">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <span className="item-name">{item.product_name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="order-footer">
                <button className="edit-btn" onClick={() => startEdit(order)}>
                  Edit
                </button>

                <div className="order-total">
                  RM {order.total_amount}
                </div>
              </div>

            </div>
          ))}

          {editingOrder && (
            <>
              <div className="modal-overlay" onClick={() => setEditingOrder(null)}></div>

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
            </>
          )}
        </>
      ) : (
        <p className="orders-empty">You have no orders yet.</p>
      )}
    </div>
  );
}
