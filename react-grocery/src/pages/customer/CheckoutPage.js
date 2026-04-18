import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { getCookie } from "../../utils/cookieUtils";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    payment: "",
  });
  const { cart, total, SHIPPING_FEE, finalTotal, formatPrice, placeOrder, setAlert } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create address
    const res = await fetch("/api/addresses/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({
        line1: form.line1,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        phone: form.phone,
      }),
      credentials: "include",
    });

    const data = await res.json();

    if (!data.id) {
      setAlert({ message: "Address could not be saved", type: "error" });
      return;
    }

    setLoading(true);

    if (form.payment === "cod") {
      await placeOrder(data.id, form.payment);
      navigate("/orders", { state: { formPayment: true } });
      return;
    }

    localStorage.setItem("addressId", data.id);
    navigate(`/payment/${form.payment}`, { state: { addressId: data.id }});
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      <div className="checkout-grid">

        {/* LEFT: FORM */}
        <div className="checkout-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Cart
          </button>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h4>Shipping Info</h4>
                <input
                className="checkout-input"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <input
                className="checkout-input"
                placeholder="Street Address"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                required
              />

              <input
                className="checkout-input"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />

              <input
                className="checkout-input"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />

              <input
                className="checkout-input"
                placeholder="Postal Code"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                required
              />

              <input
                className="checkout-input"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            
            <div className="form-section">
              <h4>Payment</h4>
              <div className="payment-options">
                <label>
                  <input type="radio" 
                  name="payment" 
                  value="cod" 
                  onChange={(e) => setForm(
                    { ...form, payment: e.target.value }
                  )}
                  required
                  />
                  Cash on Delivery
                </label>

                <label>
                  <input 
                  type="radio" 
                  name="payment" 
                  value="paypal" 
                  onChange={
                    (e) => setForm(
                      { ...form, payment: e.target.value }
                    )}
                  required
                  />
                  PayPal
                </label>
                
                <label>
                  <input 
                  type="radio" 
                  name="payment" 
                  value="wallet" 
                  onChange={
                    (e) => setForm(
                      { ...form, payment: e.target.value }
                    )}
                  required
                  />
                  Crypto Wallet
                </label>
              </div>
            </div>

            <button className="checkout-submit" type="submit" disabled={loading}>
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="checkout-right">
          <h3 className="summary-title">Order Summary</h3>
          <p className="summary-subtitle">Secure checkout</p>

          {cart.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.product.name}</span>
              <span>x{item.quantity}</span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}

          <div className="summary-breakdown">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping Fee</span>
              <span>{SHIPPING_FEE > 0 ? formatPrice(SHIPPING_FEE) : "Free"}</span>
            </div>
          </div>

          {total < 50 && (
            <p className="summary-note">
              Add {formatPrice(50 - total)} more for free shipping!
            </p>
          )}

          <div className="summary-total">
            Total: <strong>{formatPrice(finalTotal)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
