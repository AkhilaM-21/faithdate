const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const swipeRoutes = require("./routes/swipeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const communityRoutes = require("./routes/communityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { dbName: "users" })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/community", communityRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (matchId) => {
    socket.join(matchId);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.matchId).emit("receiveMessage", data);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
