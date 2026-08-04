const mongoose = require("mongoose");
const Property = require("../models/Property");
const Builder = require("../models/Builder");

// @desc    Search properties using query parameters with pagination
// @route   GET /api/properties/search
// @access  Private (Restricted for Builders)
const searchProperties = async (req, res) => {
    try {
        const {
            bhk,
            listing_type,
            price_range,
            minPrice,
            maxPrice,
            locality,
            city,
            page = 1,
            limit = 24
        } = req.query;

        const query = {};

        // Match city (case-insensitive)
        if (city) {
            query["address.city"] = { $regex: city, $options: "i" };
        }

        // Match locality (case-insensitive)
        if (locality) {
            query["address.locality"] = { $regex: locality, $options: "i" };
        }

        // Match listingType ('sell', 'rent', 'auction')
        if (listing_type) {
            query.listingType = listing_type;
            if (listing_type === 'auction') {
                query.auctionEndTime = { $gt: new Date() };
            }
        }

        // Match BHK / bedrooms in specs
        if (bhk) {
            query["specs.bedrooms"] = Number(bhk);
        }

        // Match price range (Supports "min-max" string OR minPrice / maxPrice query params)
        if (price_range) {
            const [min, max] = price_range.split("-").map(Number);
            if (!isNaN(min) && !isNaN(max)) {
                query.totalPrice = { $gte: min, $lte: max };
            }
        } else if (minPrice || maxPrice) {
            query.totalPrice = {};
            if (minPrice) query.totalPrice.$gte = Number(minPrice);
            if (maxPrice) query.totalPrice.$lte = Number(maxPrice);
        }

        // Only search active available listings
        query.status = "Available";

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 24;
        const skip = (pageNum - 1) * limitNum;

        const properties = await Property.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Property.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: properties.length,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: properties
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while searching properties",
            error: error.message
        });
    }
};

// @desc    Get live auctions ending soon (Limit: 20)
// @route   GET /api/properties/auctions
// @access  Private
const getLiveAuctions = async (req, res) => {
    try {
        const auctions = await Property.find({
            listingType: "auction",
            status: "Available",
            auctionEndTime: { $gt: new Date() }
        })
            .sort({ createdAt: -1 })
            .limit(24);

        return res.status(200).json({
            success: true,
            count: auctions.length,
            data: auctions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching live auctions",
            error: error.message
        });
    }
};

// @desc    Get featured properties for sale (Limit: 20)
// @route   GET /api/properties/featured-sale
// @access  Private
const getFeaturedSaleProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            listingType: "sell",
            status: "Available"
        })
            .sort({ createdAt: -1 })
            .limit(24);

        return res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching featured sale properties",
            error: error.message
        });
    }
};

// @desc    Get rental properties (Limit: 20)
// @route   GET /api/properties/rentals
// @access  Private
const getRentalProperties = async (req, res) => {
    try {
        const properties = await Property.find({
            listingType: "rent",
            status: "Available"
        })
            .sort({ createdAt: -1 })
            .limit(24);

        return res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching rental properties",
            error: error.message
        });
    }
};

// @desc    Get recently viewed properties by list of IDs (Limit: 20)
// @route   POST /api/properties/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
    try {
        const { propertyIds } = req.body;

        if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        const limitedIds = propertyIds.slice(0, 24);

        const properties = await Property.find({
            _id: { $in: limitedIds }
        });

        return res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching recently viewed properties",
            error: error.message
        });
    }
};

// @desc    Get single property details by ID (With Owner Populate)
// @route   GET /api/properties/:id
// @access  Private
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Property ID format"
            });
        }

        // Populates owner details from the users collection
        const property = await Property.findById(id).populate(
            "ownerId",
            "name email phoneNumber cityOfResidence"
        ).lean();  // .lean() method basically returns plain javascript objects instead of Mongoose documents.

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Check for builder project reference
        let builderData = null;
        let projectData = null;
        if (property.projectId) {
            const builder = await Builder.findOne(
                // $elemMatch matches all the documents inside the array with the query
                { projects: { $elemMatch: { _id: property.projectId } } },
                { companyName: 1, contactPersonName: 1, phoneNumber: 1, websiteUrl: 1, projects: 1 }
            ).lean();

            if (builder) {
                builderData = {
                    companyName: builder.companyName,
                    contactPersonName: builder.contactPersonName,
                    phoneNumber: builder.phoneNumber,
                    websiteUrl: builder.websiteUrl,
                    _id: builder._id
                };
                projectData = builder.projects.find(p => p._id.toString() === property.projectId.toString());
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                ...property,
                builder: builderData,
                project: projectData
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error fetching property details",
            error: error.message
        });
    }
};

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private
const createProperty = async (req, res) => {
    try {
        const {
            title, description, propertyType, listingType, totalPrice, 
            securityDeposit, maintenance, isNegotiable, status, specs, 
            address, location, images, auctionStartTime, auctionEndTime
        } = req.body;

        const propertyData = {
            ownerId: req.user._id,
            title,
            description,
            propertyType,
            listingType,
            totalPrice,
            securityDeposit: securityDeposit || 0,
            maintenance: maintenance || 0,
            isNegotiable: isNegotiable || false,
            status: status || 'Available',
            specs,
            address,
            location: {
                type: 'Point',
                coordinates: location?.coordinates || [72.8777, 19.0760] // Default to Mumbai if not provided
            },
            images: images || [],
        };

        if (listingType === 'auction') {
            if (!auctionStartTime || !auctionEndTime) {
                return res.status(400).json({ success: false, message: "Auction properties require start and end times." });
            }
            propertyData.auctionStartTime = auctionStartTime;
            propertyData.auctionEndTime = auctionEndTime;
        }

        const property = await Property.create(propertyData);

        return res.status(201).json({
            success: true,
            data: property
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating property",
            error: error.message
        });
    }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this property" });
        }

        const {
            title, description, propertyType, listingType, totalPrice, 
            securityDeposit, maintenance, isNegotiable, status, specs, 
            address, location, images, auctionStartTime, auctionEndTime
        } = req.body;

        property.title = title || property.title;
        property.description = description || property.description;
        property.propertyType = propertyType || property.propertyType;
        property.listingType = listingType || property.listingType;
        property.totalPrice = totalPrice || property.totalPrice;
        property.securityDeposit = securityDeposit !== undefined ? securityDeposit : property.securityDeposit;
        property.maintenance = maintenance !== undefined ? maintenance : property.maintenance;
        property.isNegotiable = isNegotiable !== undefined ? isNegotiable : property.isNegotiable;
        property.status = status || property.status;
        
        if (specs) property.specs = specs;
        if (address) property.address = address;
        
        if (location && location.coordinates) {
            property.location = {
                type: 'Point',
                coordinates: location.coordinates
            };
        }
        
        if (images) property.images = images;

        if (property.listingType === 'auction') {
            if (auctionStartTime) property.auctionStartTime = auctionStartTime;
            if (auctionEndTime) property.auctionEndTime = auctionEndTime;
        }

        const updatedProperty = await property.save();

        return res.status(200).json({
            success: true,
            data: updatedProperty
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating property",
            error: error.message
        });
    }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this property" });
        }

        const Offer = require("../models/Offer");
        await Offer.deleteMany({ propertyId: id });

        await property.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Property and its offers deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting property",
            error: error.message
        });
    }
};

module.exports = {
    searchProperties,
    getLiveAuctions,
    getFeaturedSaleProperties,
    getRentalProperties,
    getRecentlyViewed,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
};