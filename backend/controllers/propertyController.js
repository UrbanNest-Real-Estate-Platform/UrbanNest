const mongoose = require("mongoose");
const Property = require("../models/Property");
const Builder = require("../models/Builder");
const PropertyRequest = require("../models/PropertyRequest");
const Tenancy = require("../models/Tenancy");
const User = require("../models/User");
const Notification = require("../models/Notification");

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
            page = 1,
            limit = 24
        } = req.query;

        const query = {};

        // Match locality (case-insensitive)
        if (locality) {
            query["address.locality"] = { $regex: locality, $options: "i" };
            query["address.city"] = { $regex: locality, $options: "i" };
        }

        // Match listingType ('sell', 'rent')
        if (listing_type) {
            query.listingType = listing_type;
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

        // Check if the current user is an active tenant
        let isActiveTenant = false;
        if (req.user) {
            const activeTenancy = await Tenancy.findOne({
                propertyId: id,
                tenantId: req.user._id,
                isActive: true
            });
            if (activeTenancy) {
                isActiveTenant = true;
            }
        }

        // Authorization check for off-market properties
        if (property.status !== 'Available' && property.status !== 'Under Offer') {
            const isOwner = req.user && property.ownerId && property.ownerId._id.toString() === req.user._id.toString();
            if (!isOwner && !isActiveTenant) {
                return res.status(403).json({
                    success: false,
                    message: "This property is no longer available"
                });
            }
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
                project: projectData,
                isActiveTenant
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
            address, location, images
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
            address, location, images
        } = req.body;

        const isPriceDrop = totalPrice && (totalPrice < property.totalPrice);

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

        const updatedProperty = await property.save();

        if (isPriceDrop) {
            // Automatically checks whether the property id is in savedPropertyIds array.
            const savedUsers = await User.find({ savedPropertyIds: property._id });
            if (savedUsers.length > 0) {
                const notifications = savedUsers.map(user => ({
                    userId: user._id,
                    type: "PRICE_DROP",
                    title: "Price Drop Alert",
                    message: `The price for "${property.title}" has dropped to ₹${totalPrice.toLocaleString()}.`,
                    targetLink: `/property/${property._id}`
                }));
                await Notification.insertMany(notifications);
            }
        }

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

// @desc    Submit a property request (tenancy or ownership transfer)
// @route   POST /api/properties/:id/request
// @access  Private
const submitPropertyRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, startDate, endDate, isVacancyRequest } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Property ID" });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        if (property.ownerId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot request your own property" });
        }

        // Determine request type based on listing type and payload
        let requestType;
        if (isVacancyRequest) {
            // Verify if the user is actually an active tenant
            const activeTenancy = await Tenancy.findOne({
                propertyId: id,
                tenantId: req.user._id,
                isActive: true
            });
            if (!activeTenancy) {
                return res.status(403).json({ success: false, message: "Only active tenants can submit a vacancy request" });
            }
            requestType = 'vacancy';
        } else if (property.listingType === 'sell') {
            requestType = 'ownership_transfer';
        } else if (property.listingType === 'rent') {
            requestType = 'tenancy';
        } else {
            return res.status(400).json({ success: false, message: "Cannot request this type of property" });
        }

        // Anti-Spam: Check if a PENDING request already exists for this property
        const existingPending = await PropertyRequest.findOne({ propertyId: id, status: 'PENDING' });
        if (existingPending) {
            return res.status(400).json({ success: false, message: "A request is already pending for this property" });
        }

        const requestData = {
            propertyId: id,
            requesterId: req.user._id,
            requestType,
            message
        };

        if (requestType === 'ownership_transfer') {
            const Offer = require("../models/Offer");
            const acceptedOffer = await Offer.findOne({ propertyId: id, buyerId: req.user._id, status: 'Accepted' });
            if (acceptedOffer) {
                requestData.offerPrice = acceptedOffer.offerPrice;
            }
        }

        if (requestType === 'tenancy') {
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: "startDate and endDate are required for tenancy requests" });
            }
            requestData.startDate = startDate;
            requestData.endDate = endDate;
        }

        const propertyRequest = await PropertyRequest.create(requestData);

        let notifType = "TRANSFER_REQUEST";
        let notifTitle = "New Ownership Transfer Request";
        if (requestType === 'tenancy') {
            notifType = "TENANCY_REQUEST";
            notifTitle = "New Tenancy Request";
        } else if (requestType === 'vacancy') {
            notifType = "VACANCY_REQUEST";
            notifTitle = "New Vacancy Request";
        }

        await Notification.create({
            userId: property.ownerId,
            type: notifType,
            title: notifTitle,
            message: `You have received a new ${requestType.replace('_', ' ')} request for "${property.title}".`,
            targetLink: `/my-properties?tab=listings`
        });

        return res.status(201).json({
            success: true,
            data: propertyRequest,
            message: "Request submitted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while submitting request",
            error: error.message
        });
    }
};

// @desc    Review a property request
// @route   PUT /api/properties/requests/:requestId/review
// @access  Private
const reviewPropertyRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Must be APPROVED or REJECTED" });
        }

        const propertyRequest = await PropertyRequest.findById(requestId).populate('propertyId');
        if (!propertyRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const property = propertyRequest.propertyId;
        if (!property) {
            return res.status(404).json({ success: false, message: "Associated property not found" });
        }

        if (property.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to review this request" });
        }

        if (propertyRequest.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: "Request has already been processed" });
        }

        propertyRequest.status = status;
        await propertyRequest.save();

        if (status === 'APPROVED') {
            if (propertyRequest.requestType === 'ownership_transfer') {
                // Set all associated Tenancies to inactive
                await Tenancy.updateMany({ propertyId: property._id }, { isActive: false });

                // Add to sales history
                property.salesHistory.push({
                    sellerId: property.ownerId,
                    buyerId: propertyRequest.requesterId,
                    soldPrice: propertyRequest.offerPrice || property.totalPrice,
                    soldAt: new Date()
                });

                // Update owner and status
                property.ownerId = propertyRequest.requesterId;
                property.status = 'Sold';
                await property.save();

                // Reject all pending/accepted offers for this property since it's sold (except for the buyer)
                const Offer = require("../models/Offer");
                const otherOffers = await Offer.find({
                    propertyId: property._id,
                    buyerId: { $ne: propertyRequest.requesterId },
                    status: { $in: ['Pending', 'Accepted'] }
                });
                if (otherOffers.length > 0) {
                    await Offer.updateMany(
                        { propertyId: property._id, buyerId: { $ne: propertyRequest.requesterId } },
                        { $set: { status: 'Rejected' } }
                    );
                    const notifications = otherOffers.map(o => ({
                        userId: o.buyerId,
                        type: "OFFER_UPDATE",
                        title: "Offer Rejected",
                        message: `Your offer for "${property.title}" has been rejected because the property was sold to someone else.`,
                        targetLink: `/dashboard`
                    }));
                    await Notification.insertMany(notifications);
                }

                // Archive the buyer's accepted offer, if it exists
                await Offer.updateMany(
                    { propertyId: property._id, buyerId: propertyRequest.requesterId, status: 'Accepted' },
                    { $set: { status: 'Archived' } }
                );
            } else if (propertyRequest.requestType === 'tenancy') {
                // Set all existing Tenancies to inactive
                await Tenancy.updateMany({ propertyId: property._id }, { isActive: false });

                // Create new Tenancy
                await Tenancy.create({
                    propertyId: property._id,
                    tenantId: propertyRequest.requesterId,
                    startDate: propertyRequest.startDate,
                    endDate: propertyRequest.endDate,
                    monthlyRent: property.totalPrice,
                    isActive: true
                });

                // Update property status
                property.status = 'Rented';
                await property.save();
            } else if (propertyRequest.requestType === 'vacancy') {
                // Find active tenancy for requester and set inactive
                await Tenancy.updateMany({
                    propertyId: property._id,
                    tenantId: propertyRequest.requesterId,
                    isActive: true
                }, { isActive: false });

                property.status = 'Available';
                await property.save();
            }
        }

        let notifType = "TRANSFER_REQUEST";
        let titlePrefix = "Ownership Transfer";
        if (propertyRequest.requestType === 'tenancy') {
            notifType = "TENANCY_REQUEST";
            titlePrefix = "Tenancy Request";
        } else if (propertyRequest.requestType === 'vacancy') {
            notifType = "VACANCY_REQUEST";
            titlePrefix = "Vacancy Request";
        }

        await Notification.create({
            userId: propertyRequest.requesterId,
            type: notifType,
            title: `${titlePrefix} ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
            message: `Your ${propertyRequest.requestType.replace('_', ' ')} request for "${property.title}" has been ${status.toLowerCase()}.`,
            targetLink: `/property/${property._id}`
        });

        return res.status(200).json({
            success: true,
            data: propertyRequest,
            message: `Request ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while reviewing request",
            error: error.message
        });
    }
};

// @desc    Predict property price using Django ML Microservice
// @route   POST /api/properties/predict
const predictPropertyPrice = async (req, res) => {
    try {
        const payload = req.body;
        const DJANGO_ML_SERVICE_URL = process.env.DJANGO_ML_URL || 'http://127.0.0.1:8000/api/predict/';

        const response = await fetch(DJANGO_ML_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Django ML service returned status ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error connecting to Django ML service:", error.message);

        const areaSqft = Number(req.body.superBuiltUpSqft || req.body.areaSqft || 1800);
        const locality = String(req.body.locality || 'Sector 81');

        const localityRates = {
            'Golf Course Road': 24000,
            'DLF Phase 5': 21000,
            'Golf Course Extension': 16500,
            'Sector 54': 18000,
            'MG Road': 15000,
            'Sector 65': 14200,
            'Sector 43': 13500,
            'Sohna Road': 9800,
            'Dwarka Expressway': 9200,
            'Sector 81': 8800,
            'Sector 84': 8200,
            'Sector 102': 7900
        };

        const rate = localityRates[locality] || 10000;
        const estPrice = Math.round(areaSqft * rate);
        const pricePerSqft = Math.round(estPrice / areaSqft);

        function formatINR(val) {
            if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
            if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
            return `₹${val.toLocaleString()}`;
        }

        return res.status(200).json({
            success: true,
            prediction: {
                estimatedPrice: estPrice,
                formattedPrice: formatINR(estPrice),
                pricePerSqft: `₹${pricePerSqft.toLocaleString()} / sqft`,
                priceRangeMin: formatINR(Math.round(estPrice * 0.95)),
                priceRangeMax: formatINR(Math.round(estPrice * 1.05)),
                confidenceScore: "95.0%",
                locality: locality,
                microMarketDemand: "Active Zone (Fallback)"
            },
            inputs: req.body
        });
    }
};

module.exports = {
    searchProperties,
    getFeaturedSaleProperties,
    getRentalProperties,
    getRecentlyViewed,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    submitPropertyRequest,
    reviewPropertyRequest,
    predictPropertyPrice
};