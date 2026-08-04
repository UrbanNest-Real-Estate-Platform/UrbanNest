const User = require('../models/User');
const Builder = require('../models/Builder');
const Property = require('../models/Property');

const getDashboardStats = async(req,res) =>{
    try{
        const totalUsers = await User.countDocuments();
        const totalBuilders = await Builder.countDocuments();
        const totalProperties = await Property.countDocuments();


        res.status(200).json({
            success:true,
            stats : {
                totalUsers,
                totalBuilders,
                totalProperties
            }
        });
    }
    catch(error){
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

module.exports = {
    getDashboardStats
};