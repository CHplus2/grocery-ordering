import { createContext, useContext, useState, useCallback } from "react";
import { getCookie } from "../utils/cookieUtils";
import { useCart } from "./CartProvider";
import axios from "axios";

const OrderContext = createContext();
export const useOrder = () => useContext(OrderContext);

export default function OrderProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [adminOrders, setAdminOrders] = useState([]);
    const { refreshCart } = useCart();
    
    const fetchOrders = useCallback(async () => {
        try {
            const res = await axios.get("/api/orders/", { 
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") }, 
            });
            const data = res.data;
            
            setOrders(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("fetchOrders:", err.response?.data || err.message);
        }
    }, []);

    const fetchAdminOrders = useCallback(async () => {
        try {
            const res = await axios.get("/api/admin/orders/", {
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
            })
            const data = res.data;

            setAdminOrders(Array.isArray(data) ? data : data.results || []);
        } catch (err) {
            console.error("fetchAdminOrders:", err.response?.data || err.message);
        }
    }, []);

    const placeOrder = useCallback(async (addressId, payment) => {
        try {
            await axios.post("/api/orders/place/", { address_id: addressId, payment }, {
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
            })
            refreshCart();
            return true;
        } catch (err) {
            console.error("placeOrder:", err.response?.data || err.message);
            return false;
        }
    }, [refreshCart]);

    const updateOrder = async (orderId, newStatus, newPaymentStatus) => {
        try {
            await axios.patch(`/api/admin/orders/${orderId}/`, { 
                status: newStatus, payment_status: newPaymentStatus
            }, {
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
            })
        } catch (err) {
            console.error("updateOrder:", err.response?.data || err.message);
        }
    }

    const value = {
        orders, adminOrders, setOrders, setAdminOrders, fetchOrders, fetchAdminOrders, placeOrder, updateOrder
    }
    
    return <OrderContext.Provider value={value}>
        {children}
    </OrderContext.Provider>
}