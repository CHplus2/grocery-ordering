import { getCookie } from "../utils";

const BASE_URL = "http://localhost:8000/api/spa";

/* --------------------------------------------------
   CSRF
-------------------------------------------------- */
const csrfHeader = () => {
  const token = getCookie("csrftoken");
  if (!token) console.warn("CSRF token not found in cookies!");
  return token
    ? { "Content-Type": "application/json", "X-CSRFToken": token }
    : { "Content-Type": "application/json" };
};

/* --------------------------------------------------
   Helper for fetch with CSRF + credentials
-------------------------------------------------- */
const fetchWithCSRF = async (url, options = {}) => {
  const defaultOptions = {
    headers: csrfHeader(),
    credentials: "include",
  };
  const mergedOptions = { ...defaultOptions, ...options };
  const res = await fetch(url, mergedOptions);

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = await res.text();
    }
    console.error("Fetch failed:", res.status, errorData);
    throw new Error(`Request failed: ${res.status}`);
  }

  // handle empty body (e.g., DELETE 204)
  if (res.status === 204) return null;

  try {
    return await res.json();
  } catch {
    return await res.text();
  }
};

/* --------------------------------------------------
   Products (Admin)
-------------------------------------------------- */
export const updateProduct = async (product) => {
  return fetchWithCSRF(`${BASE_URL}/admin/products/${product.id}/`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
};

export const addProductAdmin = async (productData) => {
  return fetchWithCSRF(`${BASE_URL}/admin/products/`, {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const deleteProductAdmin = async (id) => {
  return fetchWithCSRF(`${BASE_URL}/admin/products/${id}/`, {
    method: "DELETE",
  });
};

/* --------------------------------------------------
   AUTH
-------------------------------------------------- */

/**
 * Login user (SPA login, CSRF exempt)
 */

export const loginUser = async ({ username, password }) => {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // required for DRF
    },
    credentials: "include", // important to store session cookie
    body: JSON.stringify({ username, password }), // must match Django view
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `${res.status} ${res.statusText}`);
  }

  return data;
};

export const signupUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data;
};

export const logoutUser = async () => {
  const res = await fetch(`${BASE_URL}/logout/`, {
    method: "POST",
    headers: csrfHeader(), // CSRF required after login
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
};

export const checkAuth = async () => {
  const res = await fetch(`${BASE_URL}/check-auth/`, { credentials: "include" });
  if (!res.ok) return { authenticated: false };
  return await res.json();
};

/* --------------------------------------------------
   PRODUCTS & CATEGORIES
-------------------------------------------------- */
export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products/`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return await res.json();
};

export const fetchProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}/`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return await res.json();
};

export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/categories/`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return await res.json();
};

/* --------------------------------------------------
   CART (AUTH REQUIRED)
-------------------------------------------------- */
export const fetchCart = async () => {
  const res = await fetch(`${BASE_URL}/cart/`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return await res.json();
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const res = await fetch(`${BASE_URL}/cart/`, {
      method: "POST",
      headers: csrfHeader(),
      credentials: "include",
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (!res.ok) {
      // If user is not logged in, return a special flag instead of throwing
      if (res.status === 401 || res.status === 403) {
        return { loginRequired: true };
      }
      throw new Error("Failed to add to cart");
    }

    return await res.json();
  } catch (err) {
    console.error("Add to cart error:", err);
    return { error: err.message };
  }
};

export const updateCartItem = async (id, quantity) => {
  const res = await fetch(`${BASE_URL}/cart/${id}/`, {
    method: "PATCH",
    headers: csrfHeader(),
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart item");
  return await res.json();
};

export const removeCartItem = async (id) => {
  const res = await fetch(`${BASE_URL}/cart/${id}/`, {
    method: "DELETE",
    headers: csrfHeader(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to remove cart item");
};

/* --------------------------------------------------
   ADDRESSES & ORDERS
-------------------------------------------------- */
export const fetchAddresses = async () => {
  const res = await fetch(`${BASE_URL}/addresses/`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return await res.json();
};

export const placeOrder = async (orderData) => {
  const res = await fetch(`${BASE_URL}/orders/place/`, {
    method: "POST",
    headers: csrfHeader(),
    credentials: "include",
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Failed to place order");
  return await res.json();
};

export const createAddress = async (addressData) => {
  const res = await fetch(`${BASE_URL}/addresses/`, {
    method: "POST",
    headers: csrfHeader(),  
    credentials: "include",  
    body: JSON.stringify(addressData),
  });

  if (!res.ok) throw new Error("Failed to save address");
  return await res.json();
};

export const fetchAdminOrders = async () => {
  const res = await fetch(`${BASE_URL}/admin/orders/`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch admin orders");
  return await res.json();
};

export const updateAdminOrder = async (orderId, data) => {
  const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/`, {
    method: "PUT",
    headers: csrfHeader(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return await res.json();
};

export const fetchSalesReport = async () => {
  const res = await fetch(`${BASE_URL}/admin/reports/sales/`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch sales report");
  return await res.json();
};

export const fetchCustomers = async () => {
  const res = await fetch(`${BASE_URL}/admin/customers/`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch customers");
  return await res.json();
};

export const toggleCustomerActive = async (id, is_active) => {
  const res = await fetch(`${BASE_URL}/admin/customers/${id}/`, {
    method: "PUT",
    headers: csrfHeader(),
    credentials: "include",
    body: JSON.stringify({ is_active }),
  });

  if (!res.ok) throw new Error("Failed to update customer");
  return await res.json();
};

