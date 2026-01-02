import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCart, createAddress, placeOrder } from "../api/api";
import "./CheckoutPage.css"; // import CSS

function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    payment: "cod",
  });

  useEffect(() => {
    fetchCart().then(setCart);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.line1 || !form.city || !form.state || !form.postal_code || !form.phone) {
      alert("Please fill all address fields");
      return;
    }
    try {
      const address = await createAddress(form);
      await placeOrder({ address_id: address.id, payment: form.payment });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to place order");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-content">
        {/* Cart Items */}
        <div className="checkout-cart-section">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="checkout-cart">
              {cart.map((item) => (
                <li key={item.id} className="checkout-cart-item">
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="checkout-item-image"
                    />
                  )}
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.product.name}</p>
                    <p className="checkout-item-qty">Quantity: {item.quantity}</p>
                    <p className="checkout-item-price">
                      RM {item.product.price} x {item.quantity} = RM{" "}
                      {item.product.price * item.quantity}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="checkout-total">Total: RM {total}</p>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form-section">
          <h2>Shipping & Payment</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
            <input name="line1" placeholder="Street Address" value={form.line1} onChange={handleChange} />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} />
            <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} />
            <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />

            <select name="payment" value={form.payment} onChange={handleChange}>
              <option value="cod">Cash on Delivery</option>
              <option value="paypal">PayPal</option>
            </select>

            <button type="submit" className="place-order-btn">Place Order</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
