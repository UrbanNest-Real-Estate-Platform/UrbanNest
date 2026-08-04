const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Builder = require("../models/Builder");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {

    try {

        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {

            token = req.headers.authorization.split(" ")[1];

        }

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Not authorized"
            });

        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === "user") {

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

        }

        else if (decoded.role === "builder") {

            req.builder = await Builder.findById(decoded.id).select("-password");

            if (!req.builder) {
                return res.status(401).json({
                    success: false,
                    message: "Builder not found"
                });
            }

        }

        else if (decoded.role === "admin") {

            req.admin = await Admin.findById(decoded.id).select("-password");

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: "Admin not found"
                });
            }

        }

        else {

            return res.status(401).json({
                success: false,
                message: "Invalid role"
            });

        }

        next();

    }

    catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });

    }

};

module.exports = protect;