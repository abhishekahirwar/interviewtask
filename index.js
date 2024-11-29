const express = require('express');
const app = express();
require('dotenv').config();

const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 4000;

app.use(express.json());

// Sync the models with the database
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized successfully.');
}).catch((error) => {
    console.error('Unable to sync the database:', error);
    process.exit(1);
});

// Routes
const userRoutes = require("./routes/userRoute");

app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
