const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "properties",
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected", "Archived"],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
