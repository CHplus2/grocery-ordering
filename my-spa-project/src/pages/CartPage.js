import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCart, updateCartItem, removeCartItem } from "../api/api";
import "./CartPage.css"; // optional, for styling

function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const loadCart = () => fetchCart().then(setCart);

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdate = async (itemId, qty) => {
    if (qty <= 0) return handleRemove(itemId);
    await updateCartItem(itemId, qty);
    loadCart();
  };

  const handleRemove = async (itemId) => {
    await removeCartItem(itemId);
    loadCart();
  };

  return (
    <div className="cart-page">
      <h1>My Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id} className="cart-item">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <p className="cart-item-name">{item.product.name}</p>
                <p className="cart-item-price">
                  RM{item.product.price} x {item.quantity} = RM
                  {item.product.price * item.quantity}
                </p>
                <div className="cart-item-actions">
                  <button onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => handleUpdate(item.id, item.quantity - 1)}>-</button>
                  <button onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {cart.length > 0 && (
        <button className="checkout-btn" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}

export default CartPage;
