const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        propertyType: {
            type: String,
            required: true,
            enum: ["Apartment", "Villa", "Plot", "Commercial"]
        },

        listingType: {
            type: String,
            required: true,
            enum: ["sell", "rent"]
        },

        totalPrice: {
            type: Number,
            required: true
        },

        securityDeposit: {
            type: Number,
            default: 0
        },

        maintenance: {
            type: Number,
            default: 0
        },

        isNegotiable: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ["Available", "Under Offer", "Sold", "Rented"],
            default: "Available"
        },

        specs: {
            areaSqft: {
                type: Number,
                required: true
            },
            superBuiltUpSqft: {
                type: Number
            },
            bedrooms: {
                type: Number
            },
            bathrooms: {
                type: Number
            },
            furnishingStatus: {
                type: String,
                enum: ["Unfurnished", "Semi-Furnished", "Furnished"]
            },
            yearBuilt: {
                type: Number
            }
        },

        address: {
            street: {
                type: String,
                trim: true
            },
            locality: {
                type: String,
                required: true,
                trim: true
            },
            city: {
                type: String,
                required: true,
                trim: true
            },
            state: {
                type: String,
                required: true,
                trim: true
            },
            zipCode: {
                type: String,
                trim: true
            }
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true
            },
            coordinates: {
                type: [Number], // Stored as [longitude, latitude]
                required: true
            }
        },

        images: [
            {
                type: String,
                trim: true
            }
        ],

        salesHistory: [
            {
                sellerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                buyerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                soldPrice: {
                    type: Number,
                    required: true
                },
                soldAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
    },
    {
        timestamps: true    // Created createdAt, updatedAt automatically and updates the updatedAt field automatically
    });

// Enable 2dsphere indexing for $near geospatial radius queries
// propertySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("properties", propertySchema);