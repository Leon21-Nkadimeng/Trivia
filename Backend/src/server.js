require("dotenv").config();

const app = require("./app");
const db = require("./config/database");

const http = require("http");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 7676;

const server = http.createServer(app);

initSocket(server);

async function startServer() {
    try {
        const connection = await db.getConnection();

        console.log("DB is successfully connected!");

        connection.release();

        server.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });

    } catch (error) {
        console.error("Error starting server:", error);
    }
}

// Only start the server when this file is executed directly.
if (require.main === module) {
    startServer();
}

module.exports = { server, startServer };