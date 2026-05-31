const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.get("/", (req, res) => {
  res.send("SkillSphere AI Server Running");
});

const PORT = process.env.PORT || 5002;


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join post room
  socket.on("joinPost", (postId) => {
    socket.join(postId);
  });

  // Realtime comment event
  socket.on("sendComment", (data) => {
  io.to(data.postId).emit(
    "receiveComment",
    data.comment
  );
});

  // REALTIME LIKE
socket.on("sendLike", (data) => {
  io.to(data.postId).emit(
    "receiveLike",
    data
  );
});

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
