const express = require("express");

const router = express.Router();

const {
    searchProperties,
    getLiveAuctions,
    getFeaturedSaleProperties,
    getRentalProperties,
    getRecentlyViewed,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const { restrictBuilder } = require("../middleware/propertyMiddleware");

// Protect all routes and restrict builder role
router.use(protect);
router.use(restrictBuilder);

// Create, Update, Delete Property routes
router.post("/", createProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

// Feed & Search routes
router.get("/search", searchProperties);
router.get("/auctions", getLiveAuctions);
router.get("/featured-sale", getFeaturedSaleProperties);
router.get("/rentals", getRentalProperties);
router.post("/recently-viewed", getRecentlyViewed);

// Single property detail route (Must be placed after static routes)
router.get("/:id", getPropertyById);

module.exports = router;