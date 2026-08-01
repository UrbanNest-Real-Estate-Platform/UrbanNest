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

    role: {
        type: String,
        enum: ["user", "builder", "admin"],
        default: "user"
    },

    profileImage: {
        type: String,
        default: "default_avatar.webp"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);