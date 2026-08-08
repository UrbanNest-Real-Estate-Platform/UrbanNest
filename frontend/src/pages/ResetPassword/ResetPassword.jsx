import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import validator from "validator";
import { toast } from "react-toastify";

import { resetPassword } from "../../services/authService";
import logo from "../../assets/icons/logo.jpg";
import "../Login/Login.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        if (validator.isEmpty(formData.password)) {
            return toast.error("Password is required");
        }

        if (formData.password.length < 8) {
            return toast.error("Password must be at least 8 characters long");
        }

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            setLoading(true);

            const response = await resetPassword(token, {
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });

            toast.success(response.data.message);

            setTimeout(() => {
                navigate("/login/user");
            }, 1500);
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

                <h1>Reset Password</h1>

                <p className="subtitle">Choose a new password for your account.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button className="login-button" type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <p className="bottom-text">
                    <Link to="/login/user">← Back to Login</Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;
