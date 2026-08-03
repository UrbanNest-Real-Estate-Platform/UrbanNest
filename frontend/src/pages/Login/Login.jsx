import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";

import { loginUser } from "../../services/authService";
import logo from "../../assets/icons/logo.jpg";
import "./Login.css";
import validator from "validator";

import { toast } from 'react-toastify';

function Login() {
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

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
        
        try {
            
            
            if(loading){
                return;
            }

            if (validator.isEmpty(formData.email.trim())) {
                return toast.error("Email is required");
            }

            if (!validator.isEmail(formData.email.trim())) {
                return toast.error("Enter a valid email address");
            }

            if (validator.isEmpty(formData.password)) {
                return toast.error("Password is required");
            }

            const loginData = {
                email: formData.email.trim(),
                password: formData.password,
            };

            setLoading(true);

            const response = await loginUser(loginData);

            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            setFormData({
                email: "",
                password: ""
            });

            toast.success("Login Successful");
            setTimeout(()=>{
                navigate('/dashboard');
            },1000);

        } catch (error) {

            toast.error(error.response?.data?.message || "Login Failed");

        }
        finally{
            setLoading(false);
        }

    };

    return (

        <div className="login-page">

            <div className="login-card">

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

                <h1>Welcome Back</h1>

                <p className="subtitle">
                    Login to your UrbanNest account
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="login-options">

                        <Link to="#">
                            Forgot Password?
                        </Link>

                    </div>

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>

                </form>

                <p className="bottom-text">

                    Don't have an account?

                    <Link to="/register">
                        Register
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Login;