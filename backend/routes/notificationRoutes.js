const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

// Get all notifications for the user
router.get("/", getUserNotifications);

// Mark all notifications as read
router.put("/read-all", markAllAsRead);

// Mark a specific notification as read
router.put("/:id/read", markAsRead);

module.exports = router;
