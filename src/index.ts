import "dotenv/config";
import app from "./app";
import { env } from "./env";
import { createServer } from "http";
import { Server } from "socket.io";
import setupChatSocket from "./sockets/chatSocket";
import setupPollSocket from "./sockets/pollSocket";
import { connectDB } from "./db";

const port = env.PORT;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // For initial dev, later lock to your frontend
    methods: ["GET", "POST"]
  }
});
// Setup chat sockets
setupChatSocket(io);
setupPollSocket(io);

async function main() {
  await connectDB();
  httpServer.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
  });
}
main();

httpServer.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
