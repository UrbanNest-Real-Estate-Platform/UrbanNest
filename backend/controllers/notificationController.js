const Notification = require("../models/Notification");

// @desc    Get all notifications for the logged in user
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
            
        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching notifications",
            error: error.message
        });
    }
};

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        
        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this notification" });
        }
        
        if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date();
            await notification.save();
        }
        
        return res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error marking notification as read",
            error: error.message
        });
    }
};

// @desc    Mark all notifications as read for the logged in user
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );
        
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error marking all notifications as read",
            error: error.message
        });
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
