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
  createRoom: (name: string, roomCode: string) => void;
  joinRoom: (name: string, roomCode: string) => void;
  leaveRoom: () => void;
  setPlayerName: (name: string) => void;
  connected: boolean;
  connecting: boolean;
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
  const [gameState, setGameState] = useState<GameState>({
    roomCode: null,
    isHost: false,
    players: [],
    name: "",
  });

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setConnected(true);
      setConnecting(false);
      toast.success("Connected to game server!");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnecting(false);
      toast.error("Failed to connect to game server");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setConnected(false);
      toast.error("Disconnected from game server");
    });

    // Room events
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

    socketInstance.on("playerJoined", (data: { id: string; name: string }) => {
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players, { id: data.id, name: data.name }],
      }));
      toast(`${data.name} joined the room!`);
    });

    socketInstance.on("playerLeft", (data: { id: string; name: string }) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== data.id),
      }));
      toast(`${data.name} left the room`);
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

    socketInstance.on(
      "errorMessage",
      (error: { type: string; message: string }) => {
        toast.error(error.message);
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, []);

  const createRoom = (name: string, roomCode: string) => {
    if (!connected) {
      return;
    }

    if (socket) {
      socket.emit("createRoom", { name, roomCode });
      setGameState((prev) => ({ ...prev, name, roomCode }));
    }
  };

  const joinRoom = (name: string, roomCode: string) => {
    if (!connected) {
      return;
    }

    if (socket) {
      socket.emit("joinRoom", { name, roomCode });
      setGameState((prev) => ({ ...prev, name, roomCode }));
    }
  };

  const leaveRoom = () => {
    if (!connected) {
      return;
    }

    if (socket && gameState.roomCode) {
      socket.emit("leaveRoom", { roomCode: gameState.roomCode });
      setGameState({
        roomCode: null,
        isHost: false,
        players: [],
        name: gameState.name,
      });
    }
  };

  const setPlayerName = (name: string) => {
    setGameState((prev) => ({ ...prev, name }));
  };

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
