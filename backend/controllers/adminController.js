const User = require("../models/User");
const Builder = require("../models/Builder");
const Property = require("../models/Property");

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
    try {
        const { id } = req.params;
        const builder = await Builder.findByIdAndDelete(id);
        if (!builder) {
            return res.status(404).json({
                success: false,
                message: "Builder not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Builder application rejected"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to reject builder application"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "User account deleted successfully"
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
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
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
        const builders = await Builder.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            builders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch builders"
        });
    }
};

module.exports = {
    getDashboardStats,
    getPendingBuilders,
    verifyBuilder,
    rejectBuilder,
    getAllUsers,
    getAllBuilders,
    deleteUser
};