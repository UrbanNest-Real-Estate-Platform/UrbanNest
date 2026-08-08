import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-toastify";

import { forgotPassword, resetPasswordWithOtp } from "../../services/authService";
import logo from "../../assets/icons/logo.jpg";
import "../Login/Login.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        const trimmedEmail = email.trim();

        if (validator.isEmpty(trimmedEmail)) {
            return toast.error("Email is required");
        }

        if (!validator.isEmail(trimmedEmail)) {
            return toast.error("Enter a valid email address");
        }

        try {
            setLoading(true);

            const response = await forgotPassword({ email: trimmedEmail });

            setSubmitted(true);
            toast.success(response.data.message || "Verification code sent");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to send verification code");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();

        if (loading) return;
        if (!/^\d{6}$/.test(otp)) return toast.error("Enter the 6-digit verification code");
        if (password.length < 8) return toast.error("Password must be at least 8 characters long");
        if (password !== confirmPassword) return toast.error("Passwords do not match");

        try {
            setLoading(true);
            const response = await resetPasswordWithOtp({ email: email.trim(), otp, password, confirmPassword });
            toast.success(response.data.message);
            setTimeout(() => navigate("/login/user"), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="logo">
                    <img src={logo} alt="UrbanNest Logo" className="logo-img" />
                    <h2 className="logo-text">
                        Urban<span>Nest</span>
                    </h2>
                </div>

                <h1>Forgot Password</h1>

                <p className="subtitle">
                    {submitted
                        ? "Enter the 6-digit code sent to your email and choose a new password."
                        : "Enter your email and we'll send you a verification code."}
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button className="login-button" type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset}>
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" value={email} readOnly />
                        </div>

                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                maxLength="6"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>New Password</label>
                            <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>

                        <button className="login-button" type="submit" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                        <p className="bottom-text" style={{ marginTop: "16px" }}>
                            Didn't receive it? Check spam or{" "}
                            <button
                                type="button"
                                onClick={() => { setSubmitted(false); setOtp(""); }}
                                style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", padding: 0 }}
                            >
                                send a new code
                            </button>
                        </p>
                    </form>
                )}

                <p className="bottom-text">
                    Remember your password?
                    <Link to="/login/user"> Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
