const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define("user", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter name."
            },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Please enter a valid email address"
            },
            notEmpty: {
                msg: "Please enter the email."
            },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter the password."
            },
        },
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    board: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter the board."
            },
        },
    },
    field: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter the field."
            },
        },
    },
    standard: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter the standard."
            },
        },
    },
    dob: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter your date of birth."
            },
            isDate: {
                msg: "Please enter a valid date."
            }
        },
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Please enter your age."
            },
        },
    },
});

module.exports = User;
