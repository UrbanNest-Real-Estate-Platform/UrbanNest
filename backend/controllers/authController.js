const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const generateToken = require("../utils/generateToken");
const { sendPasswordResetEmail, sendPasswordResetOtpEmail } = require("../utils/sendEmail");
const Builder = require('../models/Builder');
const Admin = require('../models/Admin');

// In-memory fallback stores when MongoDB is offline
const inMemoryUsers = [];
const inMemoryBuilders = [];

const JWT_SECRET = process.env.JWT_SECRET || "urbannest_jwt_secret_key_2026";

const generatePasswordResetToken = (userId) => {
    return jwt.sign(
        { id: userId, purpose: "password-reset" },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phoneNumber, cityOfResidence } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword ||
            !phoneNumber ||
            !cityOfResidence
        ) {
            return res.status(400).json({
                success: false,
                message: "Please Fill all Fields"
            });
        }

        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const isDbConnected = mongoose.connection.readyState === 1;
        let existingUser = false;

        if (isDbConnected) {
            existingUser = await User.findOne({ email });
        } else {
            existingUser = inMemoryUsers.find(u => u.email === email);
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user;
        if (isDbConnected) {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                cityOfResidence,
            });
        } else {
            user = {
                _id: `mem_u_${Date.now()}`,
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                cityOfResidence,
            };
            inMemoryUsers.push(user);
        }

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                cityOfResidence: user.cityOfResidence,
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const isDbConnected = mongoose.connection.readyState === 1;
        let user;

        if (isDbConnected) {
            user = await User.findOne({ email });
        } else {
            user = inMemoryUsers.find(u => u.email === email);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id, 'user');

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                cityOfResidence: user.cityOfResidence,
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const registerBuilder = async (req, res) => {
    try {
        const {
            companyName,
            registrationNumber,
            ownerName,
            contactPersonName,
            email,
            password,
            confirmPassword,
            phoneNumber,
            websiteUrl,
            officeAddress
        } = req.body;

        if (
            !companyName ||
            !registrationNumber ||
            !ownerName ||
            !contactPersonName ||
            !email ||
            !password ||
            !confirmPassword ||
            !phoneNumber ||
            !officeAddress
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (!/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be exactly 10 digits"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const isDbConnected = mongoose.connection.readyState === 1;

        let existingEmail = false;
        let existingRegistration = false;

        if (isDbConnected) {
            existingEmail = await Builder.findOne({ email });
            existingRegistration = await Builder.findOne({ registrationNumber });
        } else {
            existingEmail = inMemoryBuilders.find(b => b.email === email);
            existingRegistration = inMemoryBuilders.find(b => b.registrationNumber === registrationNumber);
        }

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "Registration number already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let builder;
        if (isDbConnected) {
            builder = await Builder.create({
                companyName,
                registrationNumber,
                ownerName,
                contactPersonName,
                email,
                password: hashedPassword,
                phoneNumber,
                websiteUrl,
                officeAddress
            });
        } else {
            builder = {
                _id: `mem_b_${Date.now()}`,
                companyName,
                registrationNumber,
                ownerName,
                contactPersonName,
                email,
                password: hashedPassword,
                phoneNumber,
                websiteUrl,
                officeAddress
            };
            inMemoryBuilders.push(builder);
        }

        res.status(201).json({
            success: true,
            message: "Builder account created successfully",
            builder: {
                id: builder._id,
                companyName: builder.companyName,
                registrationNumber: builder.registrationNumber,
                ownerName: builder.ownerName,
                contactPersonName: builder.contactPersonName,
                email: builder.email,
                phoneNumber: builder.phoneNumber,
                websiteUrl: builder.websiteUrl,
                officeAddress: builder.officeAddress
            }
        });

    } catch (error) {
        console.error("Register Builder Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const loginBuilder = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const isDbConnected = mongoose.connection.readyState === 1;
        let builder;

        if (isDbConnected) {
            builder = await Builder.findOne({ email });
        } else {
            builder = inMemoryBuilders.find(b => b.email === email);
        }

        if (!builder) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, builder.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(builder._id, "builder");

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            builder: {
                id: builder._id,
                companyName: builder.companyName,
                registrationNumber: builder.registrationNumber,
                ownerName: builder.ownerName,
                contactPersonName: builder.contactPersonName,
                email: builder.email,
                phoneNumber: builder.phoneNumber,
                websiteUrl: builder.websiteUrl,
                officeAddress: builder.officeAddress
            }
        });

    } catch (error) {
        console.error("Login Builder Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const getCurrentUser = async (req, res) => {

    res.status(200).json({
        success: true,
        user: req.user
    });

};

const loginAdmin = async (req,res) =>{
    try{
        const email = req.body.email?.trim();
        const password = req.body.password;

        if(!email || !password ){
            return res.status(400).json({
                success : false,
                message : "Please provide email and password"
            });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const admin = await Admin.findOne({ email });

        if(!admin){
            return res.status(401).json({
                success : false,
                message : "Admin Not Found"
            })
        }

        const isMatch = await bcrypt.compare(password,admin.password);

        if(!isMatch){
            return res.status(401).json({
                success : false,
                message : "Invalid email or password"
            });
        }

        const token = generateToken(admin._id,"admin")

        res.cookie("token",token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            admin: {
                id: admin._id,
                email: admin.email
            }
        });
    }
    catch(error){
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

const logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email address"
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: "Password reset is unavailable while the database is offline"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with that email, a verification code has been sent"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        user.passwordResetOtpHash = crypto.createHash("sha256").update(otp).digest("hex");
        user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        user.passwordResetOtpAttempts = 0;
        await user.save();

        try {
            await sendPasswordResetOtpEmail({
                to: user.email,
                name: user.name,
                otp
            });
        } catch (emailError) {
            user.passwordResetOtpHash = undefined;
            user.passwordResetOtpExpiresAt = undefined;
            user.passwordResetOtpAttempts = 0;
            await user.save();
            console.error("Forgot Password Email Error:", emailError);
            return res.status(500).json({
                success: false,
                message: "Unable to send reset email. Please try again later."
            });
        }

        res.status(200).json({
            success: true,
            message: "If an account exists with that email, a verification code has been sent"
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !otp || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Email, verification code, and both password fields are required" });
        }

        if (!validator.isEmail(normalizedEmail) || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address and 6-digit verification code" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ success: false, message: "Password reset is unavailable while the database is offline" });
        }

        const user = await User.findOne({ email: normalizedEmail }).select("+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts");
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "The verification code is invalid or has expired" });
        }

        if (user.passwordResetOtpAttempts >= 5) {
            return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new code." });
        }

        if (user.passwordResetOtpHash !== otpHash) {
            user.passwordResetOtpAttempts += 1;
            await user.save();
            return res.status(400).json({ success: false, message: "The verification code is invalid or has expired" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpiresAt = undefined;
        user.passwordResetOtpAttempts = 0;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
        console.error("OTP Password Reset Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide and confirm your new password"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: "Password reset is unavailable while the database is offline"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        if (decoded.purpose !== "password-reset") {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful. You can now log in with your new password."
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    registerBuilder,
    loginBuilder,
    getCurrentUser,
    loginAdmin,
    logoutUser,
    forgotPassword,
    resetPassword,
    resetPasswordWithOtp
};
