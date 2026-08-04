const express = require("express");

const router = express.Router();

const {
    getDashboardStats
} = require("../controllers/adminDashboardController");

router.get("/dashboard", getDashboardStats);

module.exports = router;