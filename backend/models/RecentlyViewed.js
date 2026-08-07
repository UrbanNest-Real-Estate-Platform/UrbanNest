const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "properties",
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("RecentlyViewed", recentlyViewedSchema);
