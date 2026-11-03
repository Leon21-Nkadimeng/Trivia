require("dotenv").config();

const app = require("./app");
const db = require("./config/database");

const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const express = require('express');


const http = require('http');
const {initSocket} = require('./socket');


app.use(cors());
app.use(cookieParser());
app.use(express.json());

const PORT = 7676;

const server = http.createServer(app);
initSocket(server);

async function startServer(){
  try {
    const connection = await db.getConnection();
    console.log("DB is successfully connected!")
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });

    connection.release();
  } catch(error) {
    console.log("Error")
    console.log(error);
  }
}

startServer();