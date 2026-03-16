import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  const token = localStorage.getItem("token");
  if (!token) return null;

  const clientSocket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });
  socket = clientSocket;

  clientSocket.on("connect", () => {
    console.log("🔌 Socket connected:", clientSocket?.id || "unknown");
  });

  clientSocket.on("connect_error", (err) => {
    console.warn("Socket connection error:", err.message);
  });

  clientSocket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  return clientSocket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Consultation helpers
export function joinConsultation(appointmentId) {
  if (socket?.connected) {
    socket.emit("join_consultation", { appointmentId });
  }
}

export function leaveConsultation(appointmentId) {
  if (socket?.connected) {
    socket.emit("leave_consultation", { appointmentId });
  }
}

export function sendChatMessage(appointmentId, content, type = "text", fileUrl, fileName) {
  if (socket?.connected) {
    socket.emit("send_message", { appointmentId, content, type, fileUrl, fileName });
  }
}

export function emitTyping(appointmentId) {
  if (socket?.connected) {
    socket.emit("typing", { appointmentId });
  }
}

export function emitStopTyping(appointmentId) {
  if (socket?.connected) {
    socket.emit("stop_typing", { appointmentId });
  }
}

// WebRTC helpers
export function sendWebRTCOffer(appointmentId, offer) {
  if (socket?.connected) {
    socket.emit("webrtc_offer", { appointmentId, offer });
  }
}

export function sendWebRTCAnswer(appointmentId, answer) {
  if (socket?.connected) {
    socket.emit("webrtc_answer", { appointmentId, answer });
  }
}

export function sendICECandidate(appointmentId, candidate) {
  if (socket?.connected) {
    socket.emit("webrtc_ice_candidate", { appointmentId, candidate });
  }
}

export function endCall(appointmentId) {
  if (socket?.connected) {
    socket.emit("webrtc_end_call", { appointmentId });
  }
}
