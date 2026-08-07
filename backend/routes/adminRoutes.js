const express = require('express');

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getDashboardStats,
    getPendingBuilders,
    verifyBuilder,
    rejectBuilder,
    getAllUsers,
    getAllBuilders,
    deleteUser,
    deleteBuilder,
    deleteAdminProperty,
    deleteAdminProject
} = require('../controllers/adminController');

const adminOnly = (req, res, next) => {
    if (!req.admin) return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
};

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/builders/pending', protect, adminOnly, getPendingBuilders);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/builders', protect, adminOnly, getAllBuilders);
router.put('/builders/:id/verify', protect, adminOnly, verifyBuilder);
router.put('/builders/:id/reject', protect, adminOnly, rejectBuilder);
router.delete('/builders/:id', protect, adminOnly, deleteBuilder);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.delete('/properties/:id', protect, adminOnly, deleteAdminProperty);
router.delete('/projects/:id', protect, adminOnly, deleteAdminProject);

module.exports = router;
