const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        phoneNumber: {
            type: String,
            required: true
        },

        cityOfResidence: {
            type: String,
            required: true
        },

        passwordResetOtpHash: {
            type: String,
            select: false
        },

        passwordResetOtpExpiresAt: {
            type: Date,
            select: false
        },

        passwordResetOtpAttempts: {
            type: Number,
            default: 0,
            select: false
        },

        savedPropertyIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "properties"
            }
        ]
    },
    {
        timestamps: true
    });

module.exports = mongoose.model("User", userSchema);
