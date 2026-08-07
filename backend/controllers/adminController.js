const User = require("../models/User");
const Builder = require("../models/Builder");
const Property = require("../models/Property");
const Project = require("../models/Project");
const Offer = require("../models/Offer");
const PropertyRequest = require("../models/PropertyRequest");
const RecentlyViewed = require("../models/RecentlyViewed");
const Tenancy = require("../models/Tenancy");

const deletePropertiesAndRelatedRecords = async (propertyIds) => {
    if (!propertyIds.length) return;

    await Promise.all([
        Offer.deleteMany({ propertyId: { $in: propertyIds } }),
        PropertyRequest.deleteMany({ propertyId: { $in: propertyIds } }),
        RecentlyViewed.deleteMany({ propertyId: { $in: propertyIds } }),
        Tenancy.deleteMany({ propertyId: { $in: propertyIds } }),
        Property.deleteMany({ _id: { $in: propertyIds } })
    ]);
};

const getDashboardStats = async (req, res) => {

    try {

        const [
            totalUsers,
            totalBuilders,
            totalProperties,
            pendingBuilders,
            listingMix,
            totalValuation
        ] = await Promise.all([

            User.countDocuments(),

            Builder.countDocuments(),

            Property.countDocuments(),

            Builder.countDocuments({
                isVerified:false
            }),

            Property.aggregate([
                {
                    $group:{
                        _id:"$listingType",
                        count:{
                            $sum:1
                        }
                    }
                }
            ]),

            Property.aggregate([
                {
                    $group:{
                        _id: null,
                        totalAmount: { $sum: "$totalPrice" }
                    }
                }
            ])

        ]);


        const formattedListingMix = listingMix.map(item => ({
            name:
                item._id.charAt(0).toUpperCase() 
                + item._id.slice(1),

            value:
                totalProperties > 0 ? Math.round(
                    (item.count / totalProperties) * 100
                ) : 0
        }));

        const totalPropertyValue = totalValuation.length > 0 ? totalValuation[0].totalAmount : 0;


        res.status(200).json({

            success:true,

            stats:{

                totalUsers,
                totalBuilders,
                totalProperties,
                pendingBuilders,
                totalPropertyValue,
                listingMix: formattedListingMix

            }

        });


    }
    catch(error){

        console.log(error);

        res.status(500).json({

            success:false,
            message:"Failed to load dashboard."

        });

    }

};

const getPendingBuilders = async (req, res) => {
    try {
        const builders = await Builder.find({ isVerified: false });
        res.status(200).json({
            success: true,
            builders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending builders"
        });
    }
};

const verifyBuilder = async (req, res) => {
    try {
        const { id } = req.params;
        const builder = await Builder.findById(id);
        if (!builder) {
            return res.status(404).json({
                success: false,
                message: "Builder not found"
            });
        }
        builder.isVerified = true;
        if (builder.documents && builder.documents.length > 0) {
            builder.documents.forEach(doc => {
                doc.status = "Verified";
            });
        }
        await builder.save();
        res.status(200).json({
            success: true,
            message: "Builder verified successfully",
            builder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to verify builder"
        });
    }
};

const rejectBuilder = async (req, res) => {
    return deleteBuilder(req, res);
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const properties = await Property.find({ ownerId: id }).select("_id");
        await deletePropertiesAndRelatedRecords(properties.map((property) => property._id));
        await Promise.all([
            Offer.deleteMany({ buyerId: id }),
            PropertyRequest.deleteMany({ requesterId: id }),
            RecentlyViewed.deleteMany({ userId: id }),
            Tenancy.deleteMany({ tenantId: id })
        ]);
        await user.deleteOne();
        res.status(200).json({
            success: true,
            message: "User account and its properties deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user account"
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
        const properties = await Property.find({ ownerId: { $in: users.map((user) => user._id) } })
            .select("ownerId title propertyType listingType totalPrice status address projectId")
            .sort({ createdAt: -1 })
            .lean();
        const propertiesByOwner = properties.reduce((result, property) => {
            const ownerId = property.ownerId.toString();
            result[ownerId] = [...(result[ownerId] || []), property];
            return result;
        }, {});
        res.status(200).json({
            success: true,
            users: users.map((user) => ({
                ...user,
                properties: propertiesByOwner[user._id.toString()] || []
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

const getAllBuilders = async (req, res) => {
    try {
        const builders = await Builder.find().select("-password").sort({ createdAt: -1 }).lean();
        const projects = await Project.find({ builderId: { $in: builders.map((builder) => builder._id) } })
            .select("builderId name location totalUnits availableUnits bookedUnits priceRange status reraNo")
            .sort({ createdAt: -1 })
            .lean();
        const projectsByBuilder = projects.reduce((result, project) => {
            const builderId = project.builderId.toString();
            result[builderId] = [...(result[builderId] || []), project];
            return result;
        }, {});
        res.status(200).json({
            success: true,
            builders: builders.map((builder) => ({
                ...builder,
                projects: projectsByBuilder[builder._id.toString()] || []
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch builders"
        });
    }
};

const deleteBuilder = async (req, res) => {
    try {
        const builder = await Builder.findById(req.params.id);
        if (!builder) return res.status(404).json({ success: false, message: "Builder not found" });

        const projects = await Project.find({ builderId: builder._id }).select("_id");
        const projectIds = projects.map((project) => project._id);
        const properties = projectIds.length
            ? await Property.find({ projectId: { $in: projectIds } }).select("_id")
            : [];
        await deletePropertiesAndRelatedRecords(properties.map((property) => property._id));
        await Project.deleteMany({ _id: { $in: projectIds } });
        await builder.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Builder account, projects, and linked properties deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to delete builder account" });
    }
};

const deleteAdminProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).select("_id");
        if (!property) return res.status(404).json({ success: false, message: "Property not found" });
        await deletePropertiesAndRelatedRecords([property._id]);
        return res.status(200).json({ success: true, message: "Property deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to delete property" });
    }
};

const deleteAdminProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).select("_id builderId");
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });
        const properties = await Property.find({ projectId: project._id }).select("_id");
        await deletePropertiesAndRelatedRecords(properties.map((property) => property._id));
        await Project.deleteOne({ _id: project._id });
        await Builder.updateOne({ _id: project.builderId }, { $pull: { projects: { projectId: project._id } } });
        return res.status(200).json({ success: true, message: "Project and linked properties deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to delete project" });
    }
};

module.exports = {
    getDashboardStats,
    getPendingBuilders,
    verifyBuilder,
    rejectBuilder,
    getAllUsers,
    getAllBuilders,
    deleteUser,
    deleteBuilder,
    deleteAdminProperty,
    deleteAdminProject
};
