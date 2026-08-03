import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { registerUser } from '../../services/authService';
import "./Register.css";
import { toast } from 'react-toastify';
import validator from 'validator';
import logo from "../../assets/icons/logo.jpg";

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    cityOfResidence: "",
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

    if(validator.isEmpty(formData.name.trim())){
      return toast.error("Full name is required");
    }

    if(validator.isEmpty(formData.email.trim())){
      return toast.error("Email is required");
    }

    if(!validator.isEmail(formData.email.trim())){
      return toast.error("Enter a valid email address");
    }

    if(validator.isEmpty(formData.cityOfResidence.trim())){
      return toast.error("City is required");
    }

    if (!validator.isMobilePhone(formData.phoneNumber.trim(), "en-IN")) {
      return toast.error("Enter a valid phone number");
    }
    
    if (!validator.isLength(formData.password, { min: 8 })) {
      return toast.error("Password must be at least 8 characters");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {

      setLoading(true);
      const userData = {
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          cityOfResidence: formData.cityOfResidence.trim(),
      };

      await registerUser(userData);

      setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          cityOfResidence: "",
          password: "",
          confirmPassword: ""
      });

      toast.success("Registration Successful");

      setTimeout(()=>{
        navigate('/login');
      },1000);

    } catch (error) {

      toast.error(error.response?.data?.message || "Register Failed");
    
    }
    finally{

      setLoading(false);
    
    }
};

  return (
    <div className="register-page">
      <div className="register-card">

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

        <h1>Create Account</h1>

        <p className="subtitle">
          Join UrbanNest and start your real estate journey
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
            </div>

            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                name="cityOfResidence"
                placeholder="Enter your city"
                value={formData.cityOfResidence}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group full-width">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="input-group full-width">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <button className="register-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="bottom-text">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;