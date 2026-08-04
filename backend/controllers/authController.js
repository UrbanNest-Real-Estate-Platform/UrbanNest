const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const generateToken = require("../utils/generateToken");
const Builder = require('../models/Builder');
const Admin = require('../models/Admin');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phoneNumber, cityOfResidence} = req.body;

        if(
            !name ||
            !email ||
            !password ||
            !confirmPassword ||
            !phoneNumber ||
            !cityOfResidence
        ){
            return res.status(400).json({
                success : false,
                message : "Please Fill all Fields"
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

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const salt = await bcrypt.genSalt(10);
        
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            cityOfResidence,
        });

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

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);

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

        const existingEmail = await Builder.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const existingRegistration = await Builder.findOne({
            registrationNumber
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "Registration number already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const builder = await Builder.create({
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

        console.error(error);

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

        const builder = await Builder.findOne({ email });

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

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

const getCurrentUser = async (req, res) => {
    const currentUser = req.user || req.builder;
    const currentRole = req.user ? "user" : "builder";

    res.status(200).json({
        success: true,
        user: currentUser,
        role: currentRole
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

module.exports = {
    registerUser,
    loginUser,
    registerBuilder,
    loginBuilder,
    getCurrentUser,
    loginAdmin,
    logoutUser
};