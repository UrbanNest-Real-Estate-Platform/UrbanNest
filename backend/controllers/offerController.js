const Offer = require("../models/Offer");
const Property = require("../models/Property");

// @desc    Make an offer on a property
// @route   POST /api/offers
// @access  Private (User only)
const makeOffer = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only users can make offers" });
        }

        const { propertyId, offerPrice, message } = req.body;

        if (!propertyId || !offerPrice) {
            return res.status(400).json({ success: false, message: "Property ID and Offer Price are required" });
        }

        // Verify property is negotiable and sell listing
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        if (property.listingType !== 'sell' || !property.isNegotiable) {
            return res.status(400).json({ success: false, message: "This property is not open for offers" });
        }

        const existingOffer = await Offer.findOne({ propertyId, buyerId: req.user._id, status: { $in: ['Pending', 'Accepted'] } });
        if (existingOffer) {
            return res.status(400).json({ success: false, message: "You already have an active offer on this property" });
        }

        const offer = await Offer.create({
            propertyId,
            buyerId: req.user._id,
            offerPrice,
            message
        });

        const Notification = require("../models/Notification");
        await Notification.create({
            userId: property.ownerId,
            type: "OFFER_UPDATE",
            title: "New Offer Received",
            message: `You have received a new offer of $${Number(offerPrice).toLocaleString()} for "${property.title}".`,
            targetLink: "/my-properties?tab=listings"
        });

        res.status(201).json({ success: true, data: offer });
    } catch (error) {
        console.error("Error in makeOffer:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get offers for a property
// @route   GET /api/offers/property/:propertyId
// @access  Private (Owner only)
const getPropertyOffers = async (req, res) => {
    try {
        if (!req.user) return res.status(403).json({ success: false, message: "Only users can view offers" });
        const { propertyId } = req.params;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        // Ensure caller is the owner
        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the property owner can view offers" });
        }

        // sort(-createdAt) sorts the offers in descending order of creation time
        const offers = await Offer.find({ propertyId }).populate('buyerId', 'name email phoneNumber').sort('-createdAt');

        res.status(200).json({ success: true, data: offers });
    } catch (error) {
        console.error("Error in getPropertyOffers:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Respond to an offer (Accept/Reject)
// @route   PUT /api/offers/:id/respond
// @access  Private (Owner only)
const respondToOffer = async (req, res) => {
    try {
        if (!req.user) return res.status(403).json({ success: false, message: "Only users can respond to offers" });
        const { id } = req.params;
        const { status } = req.body;

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Must be 'Accepted' or 'Rejected'" });
        }

        const offer = await Offer.findById(id).populate('propertyId');
        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found" });
        }

        // Ensure caller is the owner
        if (offer.propertyId.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the property owner can respond to offers" });
        }

        offer.status = status;
        await offer.save();

        const Notification = require("../models/Notification");

        if (status === 'Accepted') {
            // Reject all other offers for this property
            const otherOffers = await Offer.find({ propertyId: offer.propertyId._id, _id: { $ne: offer._id }, status: { $in: ['Pending', 'Accepted'] } });

            if (otherOffers.length > 0) {
                await Offer.updateMany(
                    { propertyId: offer.propertyId._id, _id: { $ne: offer._id }, status: { $in: ['Pending', 'Accepted'] } },
                    { $set: { status: 'Rejected' } }
                );

                const notifications = otherOffers.map(o => ({
                    userId: o.buyerId,
                    type: "OFFER_UPDATE",
                    title: "Offer Rejected",
                    message: `Your offer for "${offer.propertyId.title}" has been rejected because another offer was accepted.`,
                    targetLink: `/property/${offer.propertyId._id}`
                }));
                await Notification.insertMany(notifications);
            }
        }

        // Notify the buyer whose offer was accepted or rejected
        await Notification.create({
            userId: offer.buyerId,
            type: "OFFER_UPDATE",
            title: `Offer ${status}`,
            message: `Your offer for "${offer.propertyId.title}" has been ${status.toLowerCase()}.`,
            targetLink: `/property/${offer.propertyId._id}`
        });

        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        console.error("Error in respondToOffer:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get current user's offer for a property
// @route   GET /api/offers/my-offer/:propertyId
// @access  Private (User only)
const getMyOffer = async (req, res) => {
    try {
        if (!req.user) return res.status(403).json({ success: false, message: "Only users can view offers" });
        const { propertyId } = req.params;
        const offer = await Offer.findOne({ propertyId, buyerId: req.user._id, status: { $in: ['Pending', 'Accepted'] } });
        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        console.error("Error in getMyOffer:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Update a pending offer
// @route   PUT /api/offers/:id
// @access  Private (User only)
const updateOffer = async (req, res) => {
    try {
        if (!req.user) return res.status(403).json({ success: false, message: "Only users can update offers" });
        const { id } = req.params;
        const { offerPrice, message } = req.body;

        const offer = await Offer.findById(id);
        if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });

        if (offer.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this offer" });
        }

        if (offer.status === 'Accepted' || offer.status === 'Archived') {
            return res.status(400).json({ success: false, message: "Cannot edit an accepted or archived offer" });
        }

        offer.offerPrice = offerPrice || offer.offerPrice;
        offer.message = message !== undefined ? message : offer.message;
        offer.status = 'Pending';
        await offer.save();

        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        console.error("Error in updateOffer:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Delete a pending offer
// @route   DELETE /api/offers/:id
// @access  Private (User only)
const deleteOffer = async (req, res) => {
    try {
        if (!req.user) return res.status(403).json({ success: false, message: "Only users can delete offers" });
        const { id } = req.params;

        const offer = await Offer.findById(id);
        if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });

        if (offer.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this offer" });
        }

        if (offer.status === 'Accepted' || offer.status === 'Archived') {
            return res.status(400).json({ success: false, message: "Cannot delete an accepted or archived offer" });
        }

        await Offer.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        console.error("Error in deleteOffer:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    makeOffer,
    getPropertyOffers,
    respondToOffer,
    getMyOffer,
    updateOffer,
    deleteOffer
};
