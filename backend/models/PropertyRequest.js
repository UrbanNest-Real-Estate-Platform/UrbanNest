const mongoose = require("mongoose");

const propertyRequestSchema = new mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "properties",
            required: true
        },
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        requestType: {
            type: String,
            enum: ["ownership_transfer", "tenancy", "vacancy"],
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },
        message: {
            type: String
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PropertyRequest", propertyRequestSchema);
