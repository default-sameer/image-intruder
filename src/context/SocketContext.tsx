"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface Player {
  id: string;
  name: string;
}

interface GameState {
  roomCode: string | null;
  isHost: boolean;
  players: Player[];
  name: string;
}

interface SocketContextType {
  socket: Socket | null;
  gameState: GameState;
  createRoom: (name: string) => void;
  joinRoom: (name: string, roomCode: string) => void;
  leaveRoom: () => void;
  setPlayerName: (name: string) => void;
  connected: boolean;
  connecting: boolean;
  loading: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SOCKET_URL
    : process.env.NEXT_PUBLIC_SOCKET_URL_DEV;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    roomCode: null,
    isHost: false,
    players: [],
    name: "",
  });

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });

    const timeout = setTimeout(() => {
      setLoading(false); // Prevent indefinite loading
    }, 5000);

    socketInstance.on("connect", () => {
      console.log("✅ Connected to socket server");
      setConnected(true);
      setConnecting(false);
      setLoading(false);
      toast.success("Connected to game server!");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setConnecting(false);
      setLoading(false);
      toast.error("Failed to connect to game server");
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Disconnected from socket server");
      setConnected(false);
      toast.error("Disconnected from game server");
    });

    // Event listeners...
    socketInstance.on("roomCreated", (roomCode: string) => {
      setGameState((prev) => ({
        ...prev,
        roomCode,
        isHost: true,
      }));
      toast.success(`Room created with code: ${roomCode}`);
    });

    socketInstance.on("roomJoined", (roomCode: string) => {
      setGameState((prev) => ({
        ...prev,
        roomCode,
      }));
      toast.success(`Joined room: ${roomCode}`);
    });

    socketInstance.on("playerJoined", ({ id, name }) => {
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players, { id, name }],
      }));
      toast(`${name} joined the room!`);
    });

    socketInstance.on("playerLeft", ({ id, name }) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== id),
      }));
      toast(`${name} left the room`);
    });

    socketInstance.on("playerList", (players: { [key: string]: string }) => {
      setGameState((prev) => ({
        ...prev,
        players: Object.entries(players).map(([id, name]) => ({
          id,
          name,
        })),
      }));
    });

    socketInstance.on("roomHost", (hostId: string) => {
      setGameState((prev) => ({
        ...prev,
        isHost: hostId === socketInstance.id,
      }));
    });

    socketInstance.on("errorMessage", (error) => {
      toast.error(error.message);
    });

    setSocket(socketInstance);

    return () => {
      clearTimeout(timeout);
      socketInstance.disconnect();
      setSocket(null);
    };
  }, []);

  const createRoom = (name: string) => {
    if (!connected || !socket) return;
    socket.emit("createRoom", { name });
    setGameState((prev) => ({ ...prev, name }));
  };

  const joinRoom = (name: string, roomCode: string) => {
    if (!connected || !socket) return;
    socket.emit("joinRoom", { name, roomCode });
    setGameState((prev) => ({ ...prev, name, roomCode }));
  };

  const leaveRoom = () => {
    if (!connected || !socket || !gameState.roomCode) return;
    socket.emit("leaveRoom", { roomCode: gameState.roomCode });
    setGameState({
      roomCode: null,
      isHost: false,
      players: [],
      name: gameState.name,
    });
  };

  const setPlayerName = (name: string) => {
    setGameState((prev) => ({ ...prev, name }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Connecting to game server...
      </div>
    );
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        gameState,
        createRoom,
        joinRoom,
        leaveRoom,
        setPlayerName,
        connected,
        connecting,
        loading,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
