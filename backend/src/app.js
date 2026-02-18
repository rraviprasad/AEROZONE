const express = require("express");
const cors = require("cors");
const connectDB = require("../config/mongodb");
const dataRoute = require("../routes/dataRoute");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

app.use("/api/data", dataRoute);

module.exports = app;