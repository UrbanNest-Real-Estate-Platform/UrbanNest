import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import { toast } from 'react-toastify';
import validator from 'validator';
import { updateProfile } from '../../services/userService';
import './Profile.css';

export default function Profile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        cityOfResidence: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    cityOfResidence: user.cityOfResidence || ''
                }));
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (validator.isEmpty(formData.name.trim())) {
            toast.error("Full name is required");
            return false;
        }
        if (validator.isEmpty(formData.email.trim())) {
            toast.error("Email is required");
            return false;
        }
        if (!validator.isEmail(formData.email.trim())) {
            toast.error("Enter a valid email address");
            return false;
        }
        if (validator.isEmpty(formData.cityOfResidence.trim())) {
            toast.error("City is required");
            return false;
        }
        if (!validator.isMobilePhone(formData.phoneNumber.trim(), "en-IN")) {
            toast.error("Enter a valid phone number");
            return false;
        }
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                toast.error("Current password is required to set a new password");
                return false;
            }
            if (!validator.isLength(formData.newPassword, { min: 8 })) {
                toast.error("New password must be at least 8 characters");
                return false;
            }
            if (formData.newPassword !== formData.confirmNewPassword) {
                toast.error("New passwords do not match");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const res = await updateProfile({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                cityOfResidence: formData.cityOfResidence.trim(),
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (res.data.success) {
                toast.success('Profile updated successfully!');
                localStorage.setItem('user', JSON.stringify(res.data.user));
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                }));
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="un-profile-page">
            <DashboardNavbar />
            <main className="un-profile-content">
                <div className="un-profile-container">
                    <div className="un-profile-header">
                        <h2>My Profile</h2>
                        <p>Manage your personal information and security settings.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="un-profile-form">
                        <div className="un-form-section">
                            <h3>Personal Information</h3>
                            <div className="un-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div className="un-form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="un-form-row">
                                <div className="un-form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        required
                                    />
                                </div>
                                <div className="un-form-group">
                                    <label>City of Residence</label>
                                    <input
                                        type="text"
                                        name="cityOfResidence"
                                        value={formData.cityOfResidence}
                                        onChange={handleChange}
                                        placeholder="e.g. Mumbai"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="un-form-section un-form-section-password">
                            <h3>Change Password <span>(Optional)</span></h3>
                            <p className="un-section-subtitle">Leave blank if you don't want to change your password.</p>

                            <div className="un-form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="un-form-row">
                                <div className="un-form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="Min 8 characters"
                                    />
                                </div>
                                <div className="un-form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="un-form-actions">
                            <button type="button" className="un-btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
                            <button type="submit" className="un-btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
