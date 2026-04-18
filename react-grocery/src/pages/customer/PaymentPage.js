import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCart } from "../../contexts/CartContext";
import "./PaymentPage.css";

export default function PaymentPage() {
    const { 
        total, finalTotal, convertToUSD, placeOrder, setAlert, 
        wallet, walletLoading, createWallet, topupWallet, formatPrice 
    } = useCart();

    const { method } = useParams();
    const [amount, setAmount] = useState(0);
    const [paying, setPaying] = useState(null);
    const location = useLocation();
    const addressId = location.state?.addressId || Number(localStorage.getItem("addressId"));

    const navigate = useNavigate();

    useEffect(() => {
        if (!addressId) {
            setAlert({ message: "Session expired. Please checkout again", type: "error" })
            navigate("/checkout")
        }
    }, [addressId, setAlert, navigate])

    const handlePay = () => {
        setPaying(true);
        placeOrder(addressId, method);
        setPaying(false);

        localStorage.removeItem("addressId");
        setAlert({ "message": "Payment successful!", "type": "success" })
        navigate("/orders", { state: { formPayment: true } });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!wallet || amount <= 0) {
            setAlert({ message: "Enter a valid top-up amount", type:"error" });
            return;
        }

        topupWallet(amount);
        setAmount(0);
    }

    return (    
        <div className="payment-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back to Checkout
            </button>
        
            {method==="paypal" && (
            <div className="paypal-box">
                <h3>Complete Payment</h3>

                <PayPalScriptProvider
                    options={{
                    "client-id": "AbRBrHIUPVKVqwCiCgpAR33f35M-gY5qN1P838rB4xaRAZLJOM3lycTlLQCRRFVOPO051TgyrZWvMHXK",
                    currency: "USD",
                    }}
                >
                    <PayPalButtons
                        createOrder={(data, actions) =>
                            actions.order.create({
                                purchase_units: [
                                {
                                    amount: { value: convertToUSD(total) },
                                },
                                ],
                            })
                        }
                        onApprove={async (data, actions) => {
                        await actions.order.capture();
                        setAlert({ message: "Payment made successfully", type: "success"});
                        await placeOrder(addressId, method);

                        localStorage.removeItem("addressId");
                        navigate("/orders", { state: { formPayment: true }});
                        }}
                    />
                </PayPalScriptProvider>
            </div>
            )}

            {method === "wallet" && (
            <div className="wallet-box">
                <h3>Crypto Payment</h3>

                <div className="payment-summary">
                <p><strong>Total:</strong> {finalTotal.toFixed(2)} TFT</p>

                {wallet && (
                    <p>
                    <strong>Your Balance:</strong> {wallet.balance.toFixed(2)} TFT
                    </p>
                )}
                </div>

                {walletLoading ? (
                <p className="loading-text">Loading wallet...</p>
                ) : !wallet ? (
                <button className="primary-btn" onClick={createWallet}>
                    Create Wallet
                </button>
                ) : wallet.balance < finalTotal ? (
                <div className="topup-section">
                    <p className="warning-text">
                    Insufficient balance. You need {(finalTotal - wallet.balance).toFixed(2)} TFT more.
                    </p>

                    <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        min="0"
                        step="0.01"
                    />
                    <button className="secondary-btn" type="submit" disabled={!wallet || amount <= 0}>
                        Top Up
                    </button>
                    </form>
                </div>
                ) : (
                <button className="primary-btn" onClick={handlePay} disabled={paying}>
                    {paying ? "Processing..." : `Pay ${finalTotal.toFixed(2)} TFT`}
                </button>
                )}
            </div>
            )}
        </div>
    );
}