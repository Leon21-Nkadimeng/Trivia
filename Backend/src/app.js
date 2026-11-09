const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const triviaRoutes = require("./routes/trivia.routes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/trivias", triviaRoutes);

// Root endpoint
app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Hello World"
    });
});

module.exports = app;