import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCookie } from "./utils";
import axios from "axios";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export default function CartProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([])
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  const [showLogin, setShowLogin] = useState(null);
  const [showSignup, setShowSignup] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [wallet, setWallet] = useState(null); 
  const [walletLoading, setWalletLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get("/api/check-auth/", { withCredentials: true })
      setIsAuthenticated(res.data.authenticated);
      setIsAdmin(res.data.is_admin); 
    } catch (err) {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await axios.get("/api/wallet/", { withCredentials: true });
      setWallet(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setWallet(null);
      } else {
        setWallet(false);
      } 
    } finally {
      setWalletLoading(false);
    }
  }, [])

  const fetchCategories = useCallback(() => {
    axios.get("/api/categories/").then((res) => setCategories(res.data));
  }, []);

  const fetchProducts = useCallback(() => {
    axios.get("/api/products/").then((res) => setProducts(res.data));
  }, []);

  const refreshCart = useCallback(() => {
    fetch("/api/cart/", { credentials: "include" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        Array.isArray(data) ? setCart(data) : setCart([]);
      })
      .catch(() => setCart([]));
  }, []);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchProducts();
    refreshCart();
  }, [checkAuth, fetchWallet, fetchProducts, fetchCategories, refreshCart]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
      axios.get("/api/recommendation/")
      .then((res) => { 
        setRecommended(res.data)}); 
    } else if (isAuthenticated === false) {
      setRecommended([]);
    }
  }, [isAuthenticated, fetchWallet]);

  const modalMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { ease: [0.4, 0, 0.2, 1] }
  }

  const createWallet = useCallback(async () => {
    try {
      const res = await axios.post("/api/wallet/create/", {}, { 
        withCredentials: true, 
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      })
      setWallet(res.data);
    } catch (err) {
      setWallet(false);
      setAlert({ message: "Failed to create wallet", type: "error"})
    }
  }, [])

  const topupWallet = useCallback(async (amount) => {
    try {
      const res = await axios.post("/api/wallet/topup/", { amount }, { 
        withCredentials: true, 
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      })
      setWallet(prev => ({...prev, "balance": res.data.balance}));
    } catch (err) {
      setWallet(false);
      setAlert({ message: "Failed to top up wallet", type: "error"})
    }
  }, []);

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
      setAlert({ message: "An error occurred while logging out", type: "error" });
      console.error(err);
    }
  }

  const deleteProduct = async (productId) => {
    await fetch(`/api/admin/products/${productId}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    });

    setProductIdToDelete(null);
    fetchProducts();

    setAlert({ message: "Product deleted successfully", type: "success" });

    refreshCart();
  };

  const addToCart = async (productId, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await fetch("/api/cart/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          credentials: "include",
          body: JSON.stringify({ product_id: productId, quantity }),
        });

        if (!res.ok) {
          const err = await res.text();

          setAlert(prev => ({ 
            message: "Failed to add item to cart", 
            type: "error" 
          }));
          console.error("Add to cart failed:", err);
          return;
        }

        const data = await res.json();

        setAlert(prev => ({ 
          message: "Item added to cart", 
          type: "success" 
        }));
        console.log("Added to cart:", data);

        refreshCart();
      } catch (err) {
        setAlert({ message: "An error occurred while adding to cart", type: "error" });
        console.error("Cart error:", err);
      }
    } else{
      setShowLogin(true);
    } 
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`/api/cart/${cartItemId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });

      if (!res.ok) {
        const err = await res.text();
        
        setAlert({ message: "Failed to remove item from cart", type: "error" });
        console.error("Remove from cart failed:", err);
        return;
      }

      refreshCart();
      setAlert(prev => 
        ({ 
          message: "Item removed from cart", 
          type: "success" 
        }));
    } catch (err) {
      setAlert({ message: "An error occurred while removing the item from the cart", type: "error" });
      console.error("Cart remove error:", err);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId);

    try {
      const res = await fetch(`/api/cart/${cartItemId}/`, {
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

        setAlert({ message: "Failed to update cart item quantity ", type: "error" });
        console.error("Update cart failed:", err);
        return;
      }

      refreshCart();
    } catch (err) {
      setAlert({ message: "An error occurred while updating the cart", type: "error" });
      console.error("Cart update error:", err);
    }
  };

  const placeOrder = useCallback(async (addressId, payment) => {
    await fetch("/api/orders/place/", {
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
    refreshCart();
  }, [refreshCart]);
  
  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      credentials: "include",
    });
    const data = await res.json();
    
    setOrders(Array.isArray(data) ? data : data.results || []);
  }, []);

  const fetchAdminOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders/", {
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      credentials: "include",
    });
    const data = await res.json();

    setAdminOrders(Array.isArray(data) ? data : data.results || []);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        total,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        modalMotion,
        deleteProduct,
        fetchCategories,
        fetchProducts,
        fetchOrders,
        fetchAdminOrders,
        placeOrder,
        categories, setCategories,
        products, setProducts,
        orders, setOrders,
        adminOrders, setAdminOrders,
        recommended, setRecommended,
        productIdToDelete, setProductIdToDelete,
        checkAuth, handleLogout,
        showLogin, setShowLogin,
        showSignup, setShowSignup,
        dropdownOpen, setDropdownOpen,
        isAuthenticated, setIsAuthenticated,
        isAdmin, setIsAdmin,
        alert, setAlert,
        wallet, walletLoading,
        createWallet, topupWallet
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
