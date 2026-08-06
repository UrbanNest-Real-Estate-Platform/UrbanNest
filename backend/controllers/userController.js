const User = require("../models/User");
const bcrypt = require("bcryptjs");

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
const RecentlyViewed = require("../models/RecentlyViewed");

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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only authenticated users can update their profile" });
        }

        const { name, email, phoneNumber, cityOfResidence, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Handle profile fields update
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (cityOfResidence) user.cityOfResidence = cityOfResidence;

        // Handle password update if requested
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to set a new password" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Incorrect current password" });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                cityOfResidence: user.cityOfResidence,
            }
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Mark a property as recently viewed
// @route   POST /api/users/recently-viewed/:id
// @access  Private
const markRecentlyViewed = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only authenticated users can mark properties as viewed" });
        }
        const propertyId = req.params.id;

        // Check if property exists
        const propertyExists = await Property.findById(propertyId);
        if (!propertyExists) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        await RecentlyViewed.findOneAndUpdate(
            { userId: req.user._id, propertyId },
            { $set: { viewedAt: Date.now() } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        // Enforce maximum of 10 recently viewed entries per user
        const excessEntries = await RecentlyViewed.find({ userId: req.user._id })
            .sort({ viewedAt: -1 })
            .skip(10);

        if (excessEntries.length > 0) {
            const excessIds = excessEntries.map(entry => entry._id);
            await RecentlyViewed.deleteMany({ _id: { $in: excessIds } });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error marking recently viewed:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// @desc    Get recently viewed properties
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "Only authenticated users can view history" });
        }

        const history = await RecentlyViewed.find({ userId: req.user._id })
            .sort({ viewedAt: -1 })
            .limit(10)
            .populate('propertyId');

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Error fetching recently viewed:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { saveProperty, unsaveProperty, getSavedProperties, getMyListings, getMyRents, getPendingRequests, updateProfile, markRecentlyViewed, getRecentlyViewed };
