const User = require('../model/userModel');
const { getToken } = require('../utils/getToken');
const { hashPassword, verifyPassword } = require('../utils/password');
const redis = require('../config/redis');
const { sequelize } = require('../config/database')

// Register a user
exports.register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, board, field, standard, dob, age } = req.body;

        if (!name || !email || !password || !confirmPassword || !board || !field || !standard || !dob || !age) {
            return res.status(400).json({
                success: false,
                message: "Please enter required fields.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match.",
            });
        }

        // Check Email 
        const emailCheck = await User.findOne({ where: { email } });
        if (emailCheck !== null) {
            return res.status(401).json({
                success: false,
                message: "User already present.",
            });
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        // Create a new user record in the database
        const user = await User.create({
            name,
            email,
            password: hashedPassword.password,
            salt: hashedPassword.salt,
            board,
            field,
            standard,
            dob,
            age
        });

        user.password = undefined;
        user.salt = undefined;

        return res.status(201).json({
            success: true,
            data: user,
            message: "User registered successfully.",
        });

    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Login a user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please Enter Email & Password",
            });
        }

        const user = await User.findOne({ where: { email }, raw: true, });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentails.",
            });
        }

        if (!(await verifyPassword(password, user.password, user.salt))) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentails.",
            });
        }

        const token = getToken({ id: user.id, email: user.email });

        user.password = undefined;
        user.salt = undefined;

        // Store session with expiration (86400 seconds = 1 day)
        const sessionKey = `session:${user.id}`;
        await redis.set(sessionKey, token, 'EX', 86400);

        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const expirationTime = new Date(Date.now() + process.env.COOKIE_EXPIRE * MS_PER_DAY);
        const tokenCookie = `token=${token}; Expires=${expirationTime}; Secure; SameSite=Strict; Path=/`;
        res.setHeader("Set-Cookie", tokenCookie);

        return res.status(200).json({
            success: true,
            user,
            message: "User logged in successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, board, field, standard, dob, age } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Update the user with the new data
        await user.update({
            name,
            email,
            board,
            field,
            standard,
            dob,
            age
        });

        user.password = undefined;
        user.salt = undefined;

        return res.status(200).json({
            success: true,
            user,
            message: "User updated successfully.",
        });
    } catch (error) {
        // console.log(error.name)
        // console.log(error)
        return res.status(500).json({
            success: false,
            error: error.name,
            message: "Internal Server Error.",
        });
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!(await verifyPassword(oldPassword, user.password, user.salt))) {
            return res.status(400).json({
                success: false,
                message: "Invalid Old Password.",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match.",
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(newPassword);

        await User.update({ password: hashedPassword.password, salt: hashedPassword.salt }, { where: { id: user.id } },);

        return res.status(200).json({
            success: true,
            message: "Password Update Successfully.",
        });

    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};


// GetAllUser
exports.getAllUser = async (req, res) => {
    try {
        let { page = 1, resultsPerPage = 5 } = req.query;

        page = parseInt(page, 10);
        resultsPerPage = parseInt(resultsPerPage, 10);

        const offset = (page - 1) * resultsPerPage;
        const limit = resultsPerPage;

        let users = await sequelize.query("SELECT * FROM users LIMIT :limit OFFSET :offset", {
            replacements: { limit, offset },
            raw: true
        });

        users = users[0].map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            board: user.board,
            field: user.field,
            standard: user.standard,
            age: user.age,
        }));

        return res.status(200).json({
            success: true,
            data: users,
            message: "All user retrieved.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
}

// Logout 
exports.logout = async (req, res) => {
    try {
        const clearCookie = `token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=Strict`;

        res.setHeader('Set-Cookie', clearCookie);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};
