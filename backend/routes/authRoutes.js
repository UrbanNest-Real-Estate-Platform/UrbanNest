const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    registerBuilder,
    loginBuilder,
    logoutUser,
    getCurrentUser
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post('/logout',logoutUser);

router.post("/builder/register", registerBuilder);

router.post("/builder/login", loginBuilder);


router.get('/me',protect,getCurrentUser);

module.exports = router;