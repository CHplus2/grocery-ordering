import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/api";
import "./LoginPage.css"; // reuse login styles

export default function SignupPage({ onSignup }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);

    if (!username || !password) {
        setError("Please fill all fields");
        return;
    }

    try {
        await signupUser({ username, password, confirmPassword });
        await onSignup();     // refresh auth state
        navigate("/");
    } catch (err) {
        setError("Signup failed");
    }
  };

    return (
        <div className="login-form-container">
            <h2>Register</h2>

        <form onSubmit={handleSignup} className="login-form">
            <div>
                <label>Username:</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Confirm Password:</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <div>
            <label>Password:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit">Create Account</button>
        </form>

        <p className="login-register-text">
            Already have an account?{" "}
            <Link to="/login" className="login-register-link">
            Login
            </Link>
        </p>
        </div>
    );
}
