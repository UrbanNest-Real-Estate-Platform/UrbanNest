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
    deleteUser
} = require('../controllers/adminController');

router.get('/dashboard', protect, getDashboardStats);
router.get('/builders/pending', protect, getPendingBuilders);
router.get('/users', protect, getAllUsers);
router.get('/builders', protect, getAllBuilders);
router.put('/builders/:id/verify', protect, verifyBuilder);
router.put('/builders/:id/reject', protect, rejectBuilder);
router.delete('/builders/:id', protect, rejectBuilder);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;