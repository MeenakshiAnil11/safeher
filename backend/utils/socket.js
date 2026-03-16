import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Appointment from "../models/Appointment.js";
import Session from "../models/Session.js";

let io = null;
const connectedUsers = new Map(); // userId -> Set<socketId>

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password").lean();
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const uid = socket.userId;
    console.log(`🔌 Socket connected: ${socket.userName} (${uid}) role=${socket.userRole}`);

    // Track connected user
    if (!connectedUsers.has(uid)) connectedUsers.set(uid, new Set());
    connectedUsers.get(uid).add(socket.id);

    // Join personal room for targeted events
    socket.join(`user:${uid}`);

    // ─── Consultation room ───
    socket.on("join_consultation", async ({ appointmentId }) => {
      try {
        const apt = await Appointment.findById(appointmentId).populate("doctor");
        if (!apt) return;

        const patientId = apt.user.toString();
        const doctorUserId = apt.doctor?.user?.toString();

        if (uid !== patientId && uid !== doctorUserId) return;

        const room = `consultation:${appointmentId}`;
        socket.join(room);
        socket.to(room).emit("peer_joined", {
          userId: uid,
          name: socket.userName,
          role: socket.userRole,
        });
        console.log(`  → ${socket.userName} joined ${room}`);
      } catch (e) {
        console.error("join_consultation error:", e.message);
      }
    });

    socket.on("leave_consultation", ({ appointmentId }) => {
      const room = `consultation:${appointmentId}`;
      socket.leave(room);
      socket.to(room).emit("peer_left", { userId: uid, name: socket.userName });
    });

    // ─── Chat messages ───
    socket.on("send_message", async ({ appointmentId, content, type = "text", fileUrl, fileName }) => {
      try {
        const apt = await Appointment.findById(appointmentId).populate("doctor");
        if (!apt) return;

        const patientId = apt.user.toString();
        const doctorUserId = apt.doctor?.user?.toString();
        if (uid !== patientId && uid !== doctorUserId) return;

        const activeSession = await Session.findOne({
          appointment: appointmentId,
          status: { $in: ["active", "ongoing"] },
        }).select("_id");
        if (!activeSession) {
          socket.emit("message_error", {
            appointmentId,
            message: "Session is not active yet.",
          });
          return;
        }

        const senderRole = uid === patientId ? "patient" : "doctor";

        const msg = await Message.create({
          appointment: appointmentId,
          session: activeSession._id,
          sender: uid,
          senderRole,
          content,
          type,
          fileUrl,
          fileName,
          readBy: [uid],
        });

        const populated = await Message.findById(msg._id)
          .populate("sender", "name email")
          .lean();

        const room = `consultation:${appointmentId}`;
        io.to(room).emit("new_message", populated);
      } catch (e) {
        console.error("send_message error:", e.message);
      }
    });

    socket.on("typing", ({ appointmentId }) => {
      socket.to(`consultation:${appointmentId}`).emit("user_typing", {
        userId: uid,
        name: socket.userName,
      });
    });

    socket.on("stop_typing", ({ appointmentId }) => {
      socket.to(`consultation:${appointmentId}`).emit("user_stop_typing", {
        userId: uid,
      });
    });

    // ─── WebRTC signaling ───
    socket.on("webrtc_offer", ({ appointmentId, offer }) => {
      socket.to(`consultation:${appointmentId}`).emit("webrtc_offer", {
        offer,
        from: uid,
      });
    });

    socket.on("webrtc_answer", ({ appointmentId, answer }) => {
      socket.to(`consultation:${appointmentId}`).emit("webrtc_answer", {
        answer,
        from: uid,
      });
    });

    socket.on("webrtc_ice_candidate", ({ appointmentId, candidate }) => {
      socket.to(`consultation:${appointmentId}`).emit("webrtc_ice_candidate", {
        candidate,
        from: uid,
      });
    });

    socket.on("webrtc_end_call", ({ appointmentId }) => {
      socket.to(`consultation:${appointmentId}`).emit("webrtc_end_call", {
        from: uid,
      });
    });

    // ─── Disconnect ───
    socket.on("disconnect", () => {
      const sockets = connectedUsers.get(uid);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) connectedUsers.delete(uid);
      }
      console.log(`🔌 Socket disconnected: ${socket.userName}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function isUserOnline(userId) {
  return connectedUsers.has(userId.toString());
}

export function emitToUser(userId, event, data) {
  if (io) {
    io.to(`user:${userId.toString()}`).emit(event, data);
  }
}

export function emitToRoom(room, event, data) {
  if (io) {
    io.to(room).emit(event, data);
  }
}
