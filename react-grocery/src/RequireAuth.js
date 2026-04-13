import { useEffect } from "react";
import { useCart } from "./CartContext";

export default function RequireAuth({ children, message = "Please Log in to view this page" }) {
    const { isAuthenticated, setShowLogin } = useCart();

    useEffect(() => {
        if (isAuthenticated === false) {
            setShowLogin(true);
        }
    }, [isAuthenticated, setShowLogin]);


    if (!isAuthenticated) {
        return (
            <div className="auth-blocked">
                <p>{message}</p>
            </div>
        )
    }

    return children;
}