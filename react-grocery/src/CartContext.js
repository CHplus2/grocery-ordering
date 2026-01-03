import { createContext, useContext, useEffect, useState } from "react";
import { getCookie } from "./utils";
import axios from "axios";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const modalMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { ease: [0.4, 0, 0.2, 1] }
  }

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/check-auth/", { withCredentials: true })
      setIsAuthenticated(res.data.authenticated);
      setIsAdmin(res.data.is_admin); 
    } catch (err) {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const safeSetCart = (data) => {
    if (Array.isArray(data)) {
      setCart(data);
    } else {
      setCart([]);
    }
  };

  const refreshCart = () => {
    fetch("/cart/", { credentials: "include" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        safeSetCart(data);
      })
      .catch(() => safeSetCart([]));
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout/", {}, {
        withCredentials: true,
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      checkAuth();
      setDropdownOpen(false);
      refreshCart()
    } catch (err) {
      console.error(err);
    }
  }

  const addToCart = async (product_id, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await fetch("/cart/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
          body: JSON.stringify({ product_id, quantity }),
        });

        if (!res.ok) {
          const err = await res.text();
          console.error("Add to cart failed:", err);
          return;
        }

        const data = await res.json();
        console.log("Added to cart:", data);
        refreshCart();
      } catch (err) {
        console.error("Cart error:", err);
      }
    } else{
      setShowLogin(true);
    } 
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`/cart/${cartItemId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Remove from cart failed:", err);
        return;
      }

      refreshCart();
    } catch (err) {
      console.error("Cart remove error:", err);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId);

    try {
      const res = await fetch(`/cart/${cartItemId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Update cart failed:", err);
        return;
      }

      refreshCart();
    } catch (err) {
      console.error("Cart update error:", err);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        modalMotion,
        checkAuth, handleLogout,
        showLogin, setShowLogin,
        showSignup, setShowSignup,
        dropdownOpen, setDropdownOpen,
        isAuthenticated, setIsAuthenticated,
        isAdmin, setIsAdmin 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
