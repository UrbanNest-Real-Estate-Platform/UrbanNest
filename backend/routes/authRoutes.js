const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    registerBuilder,
    loginBuilder,
    logoutUser,
    getCurrentUser,
    loginAdmin,
    forgotPassword,
    resetPassword,
    resetPasswordWithOtp
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post('/logout',logoutUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/reset-password", resetPasswordWithOtp);

router.post("/builder/register", registerBuilder);

router.post("/builder/login", loginBuilder);

router.post('/admin/login',loginAdmin);

router.get('/me',protect,getCurrentUser);

module.exports = router;
