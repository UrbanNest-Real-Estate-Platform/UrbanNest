const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Builder = require("../models/Builder");

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
        } else {
            req.user = await Builder.findById(decoded.id).select("-password");
        }

        req.role = decoded.role;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

module.exports = protect;