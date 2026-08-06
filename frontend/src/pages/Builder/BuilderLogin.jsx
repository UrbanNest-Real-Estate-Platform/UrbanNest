import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-toastify";

import { loginBuilder } from "../../services/authService";
import logo from "../../assets/icons/logo.jpg";

import "./BuilderLogin.css";

function BuilderLogin() {
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

            const response = await loginBuilder({
                email: formData.email.trim(),
                password: formData.password
            });

            localStorage.setItem("token", response.data.token);

            const builderData = {
                ...response.data.builder,
                role: "builder"
            };

            localStorage.setItem("user", JSON.stringify(builderData));
            localStorage.setItem("builder", JSON.stringify(builderData));

            setFormData({
                email: "",
                password: ""
            });

            toast.success("Login Successful");

            setTimeout(() => {
                navigate("/builder/dashboard");
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
        <div className="builder-login-page">

            <div className="builder-login-card">

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

                <h1>Builder Login</h1>

                <p className="subtitle">
                    Login to manage your properties and projects.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter company email"
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
                        className="builder-login-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>

                </form>

                <p className="bottom-text">
                    Don't have a builder account?
                    <Link to="/register/builder"> Register</Link>
                </p>

                <p className="bottom-text">
                    <Link to="/login">← Back to Login Options</Link>
                </p>

            </div>

        </div>
    );
}

export default BuilderLogin;