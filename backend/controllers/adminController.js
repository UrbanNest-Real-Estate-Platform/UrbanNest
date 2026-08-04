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
            listingMix
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
            ])

        ]);


        const formattedListingMix = listingMix.map(item => ({
            name:
                item._id.charAt(0).toUpperCase() 
                + item._id.slice(1),

            value:
                Math.round(
                    (item.count / totalProperties) * 100
                )
        }));


        res.status(200).json({

            success:true,

            stats:{

                totalUsers,
                totalBuilders,
                totalProperties,
                pendingBuilders,
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

module.exports = {
    getDashboardStats
};