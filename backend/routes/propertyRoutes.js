const express = require("express");

const router = express.Router();

const {
    searchProperties,
    getFeaturedSaleProperties,
    getRentalProperties,
    getRecentlyViewed,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    submitPropertyRequest,
    reviewPropertyRequest,
    predictPropertyPrice
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const { restrictBuilder } = require("../middleware/propertyMiddleware");

router.post("/predict", predictPropertyPrice);

// Protect all routes and restrict builder role
router.use(protect);
router.use(restrictBuilder);

// Create, Update, Delete Property routes
router.post("/", createProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

// Property requests routes
router.post("/:id/request", submitPropertyRequest);
router.put("/requests/:requestId/review", reviewPropertyRequest);

// Feed & Search routes
router.get("/search", searchProperties);
router.get("/featured-sale", getFeaturedSaleProperties);
router.get("/rentals", getRentalProperties);
router.post("/recently-viewed", getRecentlyViewed);

// Single property detail route (Must be placed after static routes)
router.get("/:id", getPropertyById);

module.exports = router;