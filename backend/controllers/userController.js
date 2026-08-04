const User = require("../models/User");

// @desc    Save property to wishlist
// @route   PUT /api/users/save-property/:id
// @access  Private
const saveProperty = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only users can save properties" });
        }
        const propertyId = req.params.id;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            // $addToSet adds the value to the array if it doesn't already exist
            { $addToSet: { savedPropertyIds: propertyId } },
            { returnDocument: 'after' }
        );
        res.status(200).json({ success: true, savedPropertyIds: user.savedPropertyIds });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Unsave property from wishlist
// @route   PUT /api/users/unsave-property/:id
// @access  Private
const unsaveProperty = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only users can unsave properties" });
        }
        const propertyId = req.params.id;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { savedPropertyIds: propertyId } },
            { returnDocument: 'after' }
        );
        res.status(200).json({ success: true, savedPropertyIds: user.savedPropertyIds });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get user's saved properties
// @route   GET /api/users/saved-properties
// @access  Private
const getSavedProperties = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only users can view saved properties" });
        }
        const user = await User.findById(req.user._id).populate('savedPropertyIds');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user.savedPropertyIds });
    } catch (error) {
        console.error("Error fetching saved properties:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const Property = require("../models/Property");
const Offer = require("../models/Offer");

// @desc    Get user's listings
// @route   GET /api/users/my-listings
// @access  Private
const getMyListings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only authenticated users can view listings" });
        }
        const listings = await Property.find({ ownerId: req.user._id });

        // Find total pending offers for these listings
        const listingIds = listings.map(p => p._id);
        const offersCount = await Offer.countDocuments({ propertyId: { $in: listingIds }, status: "Pending" });

        // Calculate Total Active Listings Counter
        const activeListingsCount = listings.filter(p => p.status === 'Available').length;

        // Sorting: Active (Available/Under Offer) first, then by updatedAt desc
        const activeStatuses = ['Available', 'Under Offer'];
        listings.sort((a, b) => {
            const aActive = activeStatuses.includes(a.status) ? 1 : 0;
            const bActive = activeStatuses.includes(b.status) ? 1 : 0;
            if (aActive !== bActive) {
                return bActive - aActive;
            }
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        res.status(200).json({
            success: true,
            data: listings,
            stats: {
                totalListings: activeListingsCount,
                pendingOffers: offersCount
            }
        });
    } catch (error) {
        console.error("Error fetching my listings:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// @desc    Get user's active rents
// @route   GET /api/users/my-rents
// @access  Private
const getMyRents = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only authenticated users can view rentals" });
        }

        const Tenancy = require("../models/Tenancy");
        const tenancies = await Tenancy.find({ tenantId: req.user._id, isActive: true })
            .populate('propertyId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: tenancies
        });
    } catch (error) {
        console.error("Error fetching my rents:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get pending property requests for user's properties
// @route   GET /api/users/pending-requests
// @access  Private
const getPendingRequests = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only authenticated users can view requests" });
        }

        // First find all properties owned by the user
        const properties = await Property.find({ ownerId: req.user._id }).select('_id');
        const propertyIds = properties.map(p => p._id);

        const PropertyRequest = require("../models/PropertyRequest");
        const pendingRequests = await PropertyRequest.find({
            propertyId: { $in: propertyIds },
            status: 'PENDING'
        })
            .populate('propertyId')
            .populate('requesterId', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: pendingRequests
        });
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { saveProperty, unsaveProperty, getSavedProperties, getMyListings, getMyRents, getPendingRequests };
