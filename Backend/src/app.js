const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();

const triviaRoutes = require("./routes/trivia.routes");


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/trivias", triviaRoutes);

app.get("/", (re, res) => {
  return res.status(200).json({message:"Hello World"});
});


module.exports = app;