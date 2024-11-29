const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

// isAuthenticatedUser
exports.isAuthenticatedUser = async (req, res, next) => {
    // const { token } = req.cookies;
    const token = req.headers['cookie'] && req.headers['cookie'].replace('token=', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please Login to access this resource.",
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const sessionKey = `session:${decoded.id}`;

    // Check if token exists in Redis
    const redisToken = await redis.get(sessionKey);
    if (!redisToken || redisToken !== token) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session.",
        });
    }

    req.user = decoded;
    next();
}
