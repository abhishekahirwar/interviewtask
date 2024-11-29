const express = require('express');
const router = express.Router();

const { register, login, updateUser, updatePassword, logout, getAllUser } = require('../controller/userController');
const { isAuthenticatedUser } = require('../middlewares/auth');

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/updateUser").put(isAuthenticatedUser, updateUser);
router.route("/updatePassword").put(isAuthenticatedUser, updatePassword);
router.route("/logout").get(logout);

router.route("/getAllUsers").get(getAllUser);

module.exports = router;
