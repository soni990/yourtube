import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRoutes from "./Routes/auth.js";
import videoRoutes from "./Routes/video.js";
import likeRoutes from "./Routes/like.js";
import watchLaterRoutes from "./Routes/watchLater.js";
import historyRoutes from "./Routes/history.js";
import commentRoutes from "./Routes/comment.js";
import watchPartyRoutes from "./Routes/watchParty.js";
import http from "http";
import { Server } from "socket.io";
import path from "path";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is running");
});
app.use(bodyParser.json());
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/like", likeRoutes);
app.use("/watchlater", watchLaterRoutes);
app.use("/history", historyRoutes);
app.use("/comment", commentRoutes);
app.use("/watch-party", watchPartyRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const rooms = {};
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("join-room", (partyId, name, callback) => {
    socket.join(partyId);

    if (!rooms[partyId]) {
      rooms[partyId] = {
        host: socket.id,
        users: new Map(),
      };
    }

    rooms[partyId].users.set(socket.id, name);

    const role = rooms[partyId].host === socket.id ? "host" : "viewer";

    io.to(partyId).emit("participants-update", {
      participants: Array.from(rooms[partyId].users.values()),
    });

    if (typeof callback === "function") {
      callback({ role });
    }
  });

  socket.on("play-video", ({ partyId }) => {
    const room = rooms[partyId];
    if (!room || room.host !== socket.id) return; // ONLY HOST

    socket.to(partyId).emit("play-video");
  });

  socket.on("pause-video", ({ partyId }) => {
    const room = rooms[partyId];
    if (!room || room.host !== socket.id) return; // ONLY HOST

    socket.to(partyId).emit("pause-video");
  });
  socket.on("seek-video", ({ partyId, currentTime }) => {
    const room = rooms[partyId];
    if (!room || room.host !== socket.id) return; // ONLY HOST

    socket.to(partyId).emit("seek-video", { currentTime });
  });
  socket.on("send-message", ({ partyId, message }) => {
    socket.to(partyId).emit("receive-message", message);
  });
  // ================= WEBRTC SIGNALING =================

  socket.on("offer", ({ partyId, offer }) => {
    socket.to(partyId).emit("offer", {
      offer,
      sender: socket.id,
    });
  });

  socket.on("answer", ({ partyId, answer }) => {
    socket.to(partyId).emit("answer", {
      answer,
      sender: socket.id,
    });
  });

  socket.on("ice-candidate", ({ partyId, candidate }) => {
    socket.to(partyId).emit("ice-candidate", {
      candidate,
      sender: socket.id,
    });
  });
  socket.on("host-leave", ({ partyId }) => {
  const room = rooms[partyId];

  if (!room) return;

  // Sirf host hi party end kar sakta hai
  if (room.host === socket.id) {
    io.to(partyId).emit("host-left");

    delete rooms[partyId];
  }
});
  socket.on("disconnect", () => {
    for (const partyId in rooms) {
      const room = rooms[partyId];

      if (room.users?.has(socket.id)) {
        room.users.delete(socket.id);

        io.to(partyId).emit("participants-update", {
          participants: Array.from(room.users.values()),
        });
      }

      // host leave
      if (room.host === socket.id) {
        delete rooms[partyId];
        io.to(partyId).emit("host-left");
      }
    }
  });
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });
