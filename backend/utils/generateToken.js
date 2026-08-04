const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign(
        {
            id: id,
            role: role
        },
        process.env.JWT_SECRET || "urbannest_jwt_secret_key_2026",
        {
            expiresIn: "7d"
        }
    );
};

module.exports = generateToken;