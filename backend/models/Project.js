const mongoose = require("mongoose");

const unitConfigSchema = new mongoose.Schema({
  unitId: String,
  type: String,
  mode: {
    type: String,
    enum: ["Direct Sale", "Rental"],
    default: "Direct Sale",
  },
  area: String,
  price: String,
  status: {
    type: String,
    enum: ["Available", "Booked", "Rented"],
    default: "Available",
  },
});

const documentSchema = new mongoose.Schema({
  title: String,
  category: String,
  status: {
    type: String,
    default: "Verified",
  },
  date: String,
  fileUrl: String,
});

const projectSchema = new mongoose.Schema(
  {
    builderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Builder",
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    totalUnits: {
      type: Number,
      default: 50,
    },
    availableUnits: {
      type: Number,
      default: 50,
    },
    bookedUnits: {
      type: Number,
      default: 0,
    },
    priceRange: {
      type: String,
      default: "₹1.5 Cr - ₹3.0 Cr",
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=380&fit=crop&auto=format",
    },
    reraNo: {
      type: String,
      default: "HARERA/GGM/2026/PENDING",
    },
    status: {
      type: String,
      default: "Active",
    },
    description: {
      type: String,
      default: "Modern urban development featuring high-end architecture and top-tier amenities.",
    },
    amenities: [String],
    unitsConfig: [unitConfigSchema],
    documents: [documentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
