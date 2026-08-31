import { useState } from "react";
import { getCookie } from "../../utils/cookieUtils";
import { motion } from "framer-motion";
import { useUI } from "../../contexts/UIProvider";
import { useAuth } from "../../contexts/AuthProvider";
import axios from "axios"
import "./GroceryLogin.css";

function GroceryLogin() {
    const [account, setFormData] = useState({ "username": "", "password": "" });

    const { setShowSignup, setShowLogin, modalMotion } = useUI();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...account, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(account);
    }   

    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-content"
                {...modalMotion}
                transition= {{ ...modalMotion.transition, duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={() => setShowLogin(false)}>✖</button>
                <h2>Access Your Account</h2>
                <form onSubmit={handleSubmit} className="login-form">
                <input 
                        type="text" 
                        name="username" 
                        placeholder="Username"
                        value={account.username}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password"
                        value={account.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account?{" "}
                    <span
                        className="switch-link"
                        onClick={() => {
                            setShowLogin(false);
                            setShowSignup(true);
                        }}   
                    >
                        Create one
                    </span>
                </p>
            </motion.div>
        </div>
    )
}

export default GroceryLogin;