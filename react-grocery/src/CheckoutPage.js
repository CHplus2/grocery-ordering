import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "./CartContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getCookie } from "./utils";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cart } = useCart();
  const [showPayPal, setShowPayPal] = useState(null);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const [form, setForm] = useState({
    name: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    payment: "",
  });

  // --- Function to place order after PayPal success ---
  const placeOrder = async (addressId, payment) => {
    return await fetch("/api/orders/place/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ 
        address_id: addressId, 
        payment: payment
      }),
      credentials: "include",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1) Create address
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
      alert("Could not save address.");
      return;
    }

    // 2) If PayPal → show PayPal popup
    if (form.payment === "paypal") {
      setShowPayPal(data.id); // store address_id
      return;
    }

    // 3) If COD → directly place order
    await placeOrder(data.id, form.payment);
    alert("Order placed!");
    navigate("/");
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Checkout</h2>

      {!showPayPal ? (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <input
            className="checkout-input"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="checkout-input"
            placeholder="Street Address"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />
          <input
            className="checkout-input"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="checkout-input"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            className="checkout-input"
            placeholder="Postal Code"
            value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
          />
          <input
            className="checkout-input"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <select
            className="checkout-input"
            value={form.payment}
            onChange={(e) => setForm({ ...form, payment: e.target.value })}
            required
          >
            <option value="">Select Payment Method</option>
            <option value="cod">Cash on Delivery</option>
            <option value="paypal">PayPal</option>
          </select>

          <button className="checkout-submit" type="submit">
            Proceed to Payment
          </button>
        </form>
      ) : (
        <PayPalScriptProvider options={{ "client-id": "AbRBrHIUPVKVqwCiCgpAR33f35M-gY5qN1P838rB4xaRAZLJOM3lycTlLQCRRFVOPO051TgyrZWvMHXK", currency: "USD" }}>
          <h3>Pay with PayPal</h3>

          <PayPalButtons
            createOrder={(data, actions) =>
              actions.order.create({
                purchase_units: [
                  {
                    amount: { value: total.toFixed(2) }, 
                  },
                ],
              })
            }
            onApprove={async (data, actions) => {
              await actions.order.capture();

              // After payment succeed → place order in backend
              await placeOrder(showPayPal, form.payment);

              alert("Payment successful! Order placed.");
              navigate("/");
            }}
          />
        </PayPalScriptProvider>
      )}
    </div>
  );
}
