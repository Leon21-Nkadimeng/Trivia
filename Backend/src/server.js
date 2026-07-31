require("dotenv").config();

const app = require("./app");
const db = require("./config/database");



const PORT = 7676;

async function startServer(){
  try {
    const connection = await db.getConnection();
    console.log("DB is successfully connected!")
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });

    connection.release();
  } catch(error) {
    console.log("Error")
    console.log(error);
  }
}

startServer();