const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const swipeRoutes = require("./routes/swipeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const communityRoutes = require("./routes/communityRoutes");
const accountRoutes = require("./routes/accountRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { dbName: "users" })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("Mongo error:", err));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Make io accessible to route handlers via req.app
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/swipe", swipeRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/notifications", notificationRoutes);

// ═══════════════════════════════════════════
// Socket.IO — User rooms + Chat rooms
// ═══════════════════════════════════════════
io.on("connection", (socket) => {
  // Authenticate and join user-specific room for notifications
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.user.id;
      socket.userId = userId;
      socket.join(`user_${userId}`);
      console.log(`🔔 User ${userId} connected for notifications`);
    } catch (err) {
      console.log("Socket auth failed:", err.message);
    }
  }

  // Chat room support
  socket.on("joinRoom", (matchId) => {
    socket.join(matchId);
  });

  // ── 🛡️ Anti-Spam (Rate Limiting) ──
  const messageTimestamps = new Map(); // userId -> [timestamps]

  socket.on("sendMessage", async (data) => {
    const userId = socket.userId;
    if (!userId) return;

    // Get recent timestamps
    let timestamps = messageTimestamps.get(userId) || [];
    const now = Date.now();

    // Filter out messages older than 10 seconds
    timestamps = timestamps.filter(t => now - t < 10000);
    timestamps.push(now);
    messageTimestamps.set(userId, timestamps);

    // 🚩 SPAM DETECTED (More than 5 messages in 10s)
    if (timestamps.length > 5) {
      console.log(`🚩 SPAM DETECTED: User ${userId} sent ${timestamps.length} msgs in 10s`);

      try {
        const User = require("./models/User");
        await User.findByIdAndUpdate(userId, {
          $inc: { spamScore: 20 },
          isShadowBanned: true
        });
        socket.emit("error", { msg: "You are sending messages too fast. Slow down." });
      } catch (err) {
        console.error("Spam update failed:", err);
      }
      return; // Block message
    }

    io.to(data.matchId).emit("receiveMessage", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.matchId).emit("typing", data);
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.matchId).emit("stopTyping", data);
  });

  socket.on("messagesRead", (data) => {
    socket.to(data.matchId).emit("messagesRead", data);
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      console.log(`👋 User ${socket.userId} disconnected`);
    }
  });
});

server.listen(process.env.PORT || 8000, () => {
  console.log("Server running");
});
