import { useState } from "react";
import { useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-toastify";

import { loginAdmin } from "../../services/authService";
import logo from "../../assets/icons/logo.jpg";

import "./AdminLogin.css";

function AdminLogin() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validator.isEmpty(formData.email.trim())) {
            return toast.error("Email is required");
        }

        if (!validator.isEmail(formData.email.trim())) {
            return toast.error("Enter a valid email address");
        }

        if (validator.isEmpty(formData.password)) {
            return toast.error("Password is required");
        }

        try {

            setLoading(true);

            const response = await loginAdmin({
                email: formData.email.trim(),
                password: formData.password
            });

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "admin",
                JSON.stringify(response.data.admin)
            );

            toast.success("Welcome Admin");

            setTimeout(() => {
                navigate("/admin/dashboard");
            }, 1000);

        } catch (error) {

            toast.error(
                error.response?.data?.message || "Login Failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="logo">

                    <img
                        src={logo}
                        alt="UrbanNest Logo"
                        className="logo-img"
                    />

                    <h2 className="logo-text">
                        Urban<span>Nest</span>
                    </h2>

                </div>

                <h1>Admin Login</h1>

                <p className="subtitle">
                    Sign in to access the UrbanNest Admin Console
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter admin email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;