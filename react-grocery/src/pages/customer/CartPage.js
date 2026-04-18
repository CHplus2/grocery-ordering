import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import "./CartPage.css";

export default function CartPage() {
  const { cart, refreshCart, removeFromCart, updateQuantity, formatPrice } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>

      {cart.length > 0 ? (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              
              {/* LEFT: IMAGE + INFO */}
              <div className="cart-left">
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

                <div className="cart-item-info">
                  <p className="cart-item-name">{item.product.name}</p>
                  <p className="cart-item-price">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="cart-right">
                <div className="qty-controls">
                  <button
                    className="qty-btn"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
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

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>

            </div>
          ))}
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}

      <div className="cart-total">
        Total: <strong>{formatPrice(total)}</strong>
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
