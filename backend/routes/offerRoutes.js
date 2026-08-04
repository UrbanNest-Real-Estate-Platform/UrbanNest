const express = require("express");
const { makeOffer, getPropertyOffers, respondToOffer, getMyOffer, updateOffer, deleteOffer } = require("../controllers/offerController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", makeOffer);
router.get("/property/:propertyId", getPropertyOffers);
router.put("/:id/respond", respondToOffer);

router.get("/my-offer/:propertyId", getMyOffer);
router.put("/:id", updateOffer);
router.delete("/:id", deleteOffer);

module.exports = router;
