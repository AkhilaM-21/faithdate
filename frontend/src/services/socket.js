import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    if (socket && socket.connected) return socket;

    socket = io("http://localhost:5000", {
        auth: { token },
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
        console.log("🔔 Socket connected for notifications");
    });

    socket.on("disconnect", () => {
        console.log("👋 Socket disconnected");
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export default { connectSocket, getSocket, disconnectSocket };
