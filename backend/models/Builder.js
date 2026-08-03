const mongoose = require("mongoose");

const builderSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPersonName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    websiteUrl: {
      type: String,
      trim: true,
    },

    officeAddress: {
      type: String,
      required: true,
      trim: true,
    },

    projects: [
      {
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },

        projectName: {
          type: String,
          required: true,
        },

        status: {
          type: String,
          required: true,
        },

        launchYear: {
          type: Number,
          required: true,
        },
      },
    ],
    password: {
        type: String,
        required: true,
    },
    isVerified:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Builder", builderSchema);