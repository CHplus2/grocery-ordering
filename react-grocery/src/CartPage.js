import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import "./CartPage.css";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              {/* IMAGE */}
              <div className="cart-image-wrapper">
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="cart-item-image"
                  />
                ) : (
                  <div className="cart-image-placeholder">No Image</div>
                )}
              </div>

              {/* PRODUCT INFO */}
              <div className="cart-item-info">
                <p className="cart-item-name">{item.product.name}</p>
                <p className="cart-item-price">
                  RM {item.product.price}
                </p>
              </div>

              {/* QUANTITY */}
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                >
                  −
                </button>

                <span className="qty-number">{item.quantity}</span>

                <button
                  className="qty-btn"
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              {/* REMOVE */}
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </>
      )}

      <div className="cart-total">
        Total: <strong>RM {total.toFixed(2)}</strong>
      </div>

      {cart.length > 0 && (
        <button
          className="checkout-btn"
          onClick={() => navigate("/checkout")}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
