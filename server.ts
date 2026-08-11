import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";

interface PlayerInfo {
  socketId: string;
  name: string;
  image: string | null;
  role: "player1" | "player2";
}

interface RoomData {
  id: string;
  players: PlayerInfo[];
  isPublic: boolean;
  createdAt: number;
}

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Socket.IO setup with CORS support
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-Memory Room Storage
const rooms = new Map<string, RoomData>();

// Helper to generate 6-digit room codes
function generateRoomCode(): string {
  let code = "";
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

// Socket.IO Connection & Event Handlers
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Create Private Room
  socket.on("create_room", (data: { name: string; image: string | null }) => {
    const roomId = generateRoomCode();
    const player: PlayerInfo = {
      socketId: socket.id,
      name: data.name || "Player 1",
      image: data.image || null,
      role: "player1"
    };

    const newRoom: RoomData = {
      id: roomId,
      players: [player],
      isPublic: false,
      createdAt: Date.now()
    };

    rooms.set(roomId, newRoom);
    socket.join(`room_${roomId}`);

    socket.emit("room_created", {
      roomId,
      role: "player1",
      player
    });
    console.log(`[Socket.IO] Room created: ${roomId} by ${player.name}`);
  });

  // Join Existing Room via Code
  socket.on("join_room", (data: { roomId: string; name: string; image: string | null }) => {
    const cleanRoomId = (data.roomId || "").trim();
    const room = rooms.get(cleanRoomId);

    if (!room) {
      socket.emit("room_error", { message: "Room not found. Please check room code!" });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("room_error", { message: "Room is already full!" });
      return;
    }

    const player: PlayerInfo = {
      socketId: socket.id,
      name: data.name || "Player 2",
      image: data.image || null,
      role: "player2"
    };

    room.players.push(player);
    socket.join(`room_${cleanRoomId}`);

    // Broadcast Game Start to both players in the room
    io.to(`room_${cleanRoomId}`).emit("game_start", {
      roomId: cleanRoomId,
      players: room.players,
      startingTurn: "player1"
    });

    console.log(`[Socket.IO] ${player.name} joined room: ${cleanRoomId}`);
  });

  // Quick Matchmaking (Find available public room or create one)
  socket.on("quick_match", (data: { name: string; image: string | null }) => {
    // Find open public room with 1 player
    let availableRoom: RoomData | null = null;
    for (const room of rooms.values()) {
      if (room.isPublic && room.players.length === 1) {
        availableRoom = room;
        break;
      }
    }

    if (availableRoom) {
      // Join as player2
      const player: PlayerInfo = {
        socketId: socket.id,
        name: data.name || "Player 2",
        image: data.image || null,
        role: "player2"
      };

      availableRoom.players.push(player);
      socket.join(`room_${availableRoom.id}`);

      io.to(`room_${availableRoom.id}`).emit("game_start", {
        roomId: availableRoom.id,
        players: availableRoom.players,
        startingTurn: "player1"
      });

      console.log(`[Socket.IO] Quick match formed in room ${availableRoom.id}`);
    } else {
      // Create new public room
      const roomId = generateRoomCode();
      const player: PlayerInfo = {
        socketId: socket.id,
        name: data.name || "Player 1",
        image: data.image || null,
        role: "player1"
      };

      const newRoom: RoomData = {
        id: roomId,
        players: [player],
        isPublic: true,
        createdAt: Date.now()
      };

      rooms.set(roomId, newRoom);
      socket.join(`room_${roomId}`);

      socket.emit("match_searching", { roomId, player });
      console.log(`[Socket.IO] Quick match created room ${roomId}, searching...`);
    }
  });

  // Real-Time Aim / Striker Movement Sync
  socket.on("aim_update", (data: { roomId: string; strikerX: number; aimPos?: { x: number; y: number } | null }) => {
    socket.to(`room_${data.roomId}`).emit("opponent_aim", {
      strikerX: data.strikerX,
      aimPos: data.aimPos
    });
  });

  // Real-Time Shot Execution Sync
  socket.on("take_shot", (data: { roomId: string; shotVel: { x: number; y: number }; strikerX: number }) => {
    socket.to(`room_${data.roomId}`).emit("opponent_shot", {
      shotVel: data.shotVel,
      strikerX: data.strikerX
    });
  });

  // Sync Board State after Physics Settles
  socket.on("sync_board", (data: {
    roomId: string;
    pieces: any[];
    p1Score: number;
    p2Score: number;
    turn: "player1" | "player2";
    queenOwner: string;
    queenCoverNeeded: boolean;
    queenPendingPlayer: string | null;
  }) => {
    socket.to(`room_${data.roomId}`).emit("board_synced", data);
  });

  // Quick Emoji / Message Reaction
  socket.on("send_reaction", (data: { roomId: string; emoji: string; senderName: string }) => {
    io.to(`room_${data.roomId}`).emit("opponent_reaction", data);
  });

  // Leave Room / Disconnect
  socket.on("leave_room", (data: { roomId: string }) => {
    const room = rooms.get(data.roomId);
    if (room) {
      socket.leave(`room_${data.roomId}`);
      room.players = room.players.filter((p) => p.socketId !== socket.id);
      socket.to(`room_${data.roomId}`).emit("opponent_left", { message: "Opponent has left the room!" });
      if (room.players.length === 0) {
        rooms.delete(data.roomId);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        socket.to(`room_${roomId}`).emit("opponent_left", { message: "Opponent disconnected from the match!" });
        if (room.players.length === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", activeRooms: rooms.size });
});

// Vite middleware for development vs Static file server for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
