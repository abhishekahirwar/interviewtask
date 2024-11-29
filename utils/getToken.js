const jwt = require('jsonwebtoken');

exports.getToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    return token;
};
