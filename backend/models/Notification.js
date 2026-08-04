const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            enum: ["TRANSFER_REQUEST", "TENANCY_REQUEST", "VACANCY_REQUEST", "PRICE_DROP"],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: null
        },
        targetLink: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// TTL index to automatically purge notifications 30 days after they are read
// If readAt is null, the document won't be deleted by TTL
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { readAt: { $exists: true, $ne: null } } });

module.exports = mongoose.model("Notification", notificationSchema);
