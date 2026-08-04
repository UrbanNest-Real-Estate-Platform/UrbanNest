// Middleware to restrict access to consumer-only property feeds and searches
const restrictBuilder = (req, res, next) => {
    // If req.user is undefined (i.e. req.builder was attached by the protect middleware), deny access
    if (!req.user) {
        return res.status(403).json({
            success: false,
            message: "Access denied. Builders are not permitted to search or browse property feeds."
        });
    }

    next();
};

module.exports = {
    restrictBuilder
};