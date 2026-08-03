import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import validator from "validator";
import { toast } from "react-toastify";

import { registerBuilder } from "../../services/authService";

import logo from "../../assets/icons/logo.jpg";
import "./BuilderRegister.css";

function BuilderRegister() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        registrationNumber: "",
        ownerName: "",
        contactPersonName: "",
        email: "",
        phoneNumber: "",
        websiteUrl: "",
        officeAddress: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (validator.isEmpty(formData.companyName.trim()))
            return toast.error("Company name is required");

        if (validator.isEmpty(formData.registrationNumber.trim()))
            return toast.error("Registration number is required");

        if (validator.isEmpty(formData.ownerName.trim()))
            return toast.error("Owner name is required");

        if (validator.isEmpty(formData.contactPersonName.trim()))
            return toast.error("Contact person name is required");

        if (validator.isEmpty(formData.email.trim()))
            return toast.error("Email is required");

        if (!validator.isEmail(formData.email.trim()))
            return toast.error("Enter a valid email address");

        if (!validator.isMobilePhone(formData.phoneNumber.trim(), "en-IN"))
            return toast.error("Enter a valid phone number");

        if (validator.isEmpty(formData.officeAddress.trim()))
            return toast.error("Office address is required");

        if (!validator.isLength(formData.password, { min: 8 }))
            return toast.error("Password must be at least 8 characters");

        if (formData.password !== formData.confirmPassword)
            return toast.error("Passwords do not match");

        try {

            setLoading(true);

            const builderData = {
                ...formData,
                companyName: formData.companyName.trim(),
                registrationNumber: formData.registrationNumber.trim(),
                ownerName: formData.ownerName.trim(),
                contactPersonName: formData.contactPersonName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                websiteUrl: formData.websiteUrl.trim(),
                officeAddress: formData.officeAddress.trim()
            };

            await registerBuilder(builderData);

            toast.success("Builder account created successfully");

            setFormData({
                companyName: "",
                registrationNumber: "",
                ownerName: "",
                contactPersonName: "",
                email: "",
                phoneNumber: "",
                websiteUrl: "",
                officeAddress: "",
                password: "",
                confirmPassword: ""
            });

            setTimeout(() => {
                navigate("/login/builder");
            }, 1000);

        } catch (error) {

            toast.error(
                error.response?.data?.message || "Registration Failed"
            );

        } finally {

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

                <h1>Builder Registration</h1>

                <p className="subtitle">
                    Register your company with UrbanNest
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="input-group">
                            <label>Company Name</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Company Name"
                                autoComplete="organization"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Registration Number</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder="Registration Number"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="Owner Name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Contact Person</label>
                            <input
                                type="text"
                                name="contactPersonName"
                                value={formData.contactPersonName}
                                onChange={handleChange}
                                placeholder="Contact Person"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                autoComplete="tel"
                                required
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Website URL (Optional)</label>
                            <input
                                type="url"
                                name="websiteUrl"
                                value={formData.websiteUrl}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                autoComplete="url"
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Office Address</label>
                            <textarea
                                name="officeAddress"
                                value={formData.officeAddress}
                                onChange={handleChange}
                                placeholder="Office Address"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Builder Account"}
                    </button>

                </form>

                <p className="bottom-text">
                    Already have an account?
                    <Link to="/login/builder"> Login</Link>
                </p>

            </div>

        </div>
    );
}

export default BuilderRegister;