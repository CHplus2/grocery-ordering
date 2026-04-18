import { useEffect } from "react";
import { useCart } from "../contexts/CartContext";

export default function RequireAuth({ children, message = "Please Log in to view this page" }) {
    const { isAuthenticated, isAdmin, setShowLogin } = useCart();

    useEffect(() => {
        if (isAuthenticated === false) {
            setShowLogin(true);
        }
    }, [isAuthenticated, setShowLogin]);


    if (isAuthenticated === false || (message === "Admin access required" && !isAdmin)) {
        return (
            <div className="auth-blocked">
                <p>{message}</p>
            </div>
        )
    } 

    return children;
}