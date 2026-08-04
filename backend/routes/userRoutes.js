const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { saveProperty, unsaveProperty, getSavedProperties, getMyListings } = require("../controllers/userController");

router.use(protect);
router.put("/save-property/:id", saveProperty);
router.put("/unsave-property/:id", unsaveProperty);
router.get("/saved-properties", getSavedProperties);
router.get("/my-listings", getMyListings);

module.exports = router;
