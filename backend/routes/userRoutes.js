const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { saveProperty, unsaveProperty } = require("../controllers/userController");

router.use(protect);
router.put("/save-property/:id", saveProperty);
router.put("/unsave-property/:id", unsaveProperty);

module.exports = router;
