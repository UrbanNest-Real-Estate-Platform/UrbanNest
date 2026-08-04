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

module.exports = { saveProperty, unsaveProperty };
