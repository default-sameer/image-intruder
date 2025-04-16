"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  playerName: string;
}

interface SocketContextType {
  socket: Socket | null;
  gameState: GameState;
  createRoom: (playerName: string, roomCode: string) => void;
  joinRoom: (playerName: string, roomCode: string) => void;
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
    playerName: "",
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
      // Since we're not actually connecting to a real backend,
      // we'll simulate a successful connection after a delay
      setTimeout(() => {
        setConnected(true);
        setConnecting(false);
        toast.success("Connected to mock server");
      }, 1000);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setConnected(false);
      toast.error("Disconnected from game server");
    });

    // Room events
    socketInstance.on("room:created", (data: { roomCode: string }) => {
      setGameState((prev) => ({
        ...prev,
        roomCode: data.roomCode,
        isHost: true,
      }));
      toast.success(`Room created with code: ${data.roomCode}`);
    });

    socketInstance.on(
      "room:joined",
      (data: { roomCode: string; players: Player[] }) => {
        setGameState((prev) => ({
          ...prev,
          roomCode: data.roomCode,
          players: data.players,
        }));
        toast.success(`Joined room: ${data.roomCode}`);
      }
    );

    socketInstance.on(
      "room:player_joined",
      (data: { player: Player; players: Player[] }) => {
        setGameState((prev) => ({
          ...prev,
          players: data.players,
        }));
        toast(`${data.player.name} joined the room!`);
      }
    );

    socketInstance.on(
      "room:player_left",
      (data: { player: Player; players: Player[] }) => {
        setGameState((prev) => ({
          ...prev,
          players: data.players,
        }));
        toast(`${data.player.name} left the room`);
      }
    );

    socketInstance.on("error", (message) => {
      toast.error(message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, []);

  // Since we don't have an actual backend, we'll use this function to mock the socket responses
  const mockSocketResponse = (event: string, data: any = {}, delay = 500) => {
    setTimeout(() => {
      handleSocketEvent(event, data);
    }, delay);
  };

  // Handle mock socket events
  const handleSocketEvent = (event: string, data: any = {}) => {
    switch (event) {
      case "room:created":
        setGameState((prev) => ({
          ...prev,
          roomCode: data.roomCode,
          isHost: true,
          players: [{ id: "1", name: gameState.playerName }],
        }));
        toast.success(`Room created with code: ${data.roomCode}`);
        break;
      case "room:joined":
        setGameState((prev) => ({
          ...prev,
          roomCode: data.roomCode,
          isHost: false,
          players: data.players,
        }));
        toast.success(`Joined room: ${data.roomCode}`);
        break;
      case "room:player_joined":
        setGameState((prev) => ({
          ...prev,
          players: [...prev.players, data.player],
        }));
        toast(`${data.player.name} joined the room!`);
        break;
      case "room:player_left":
        setGameState((prev) => ({
          ...prev,
          players: prev.players.filter((p) => p.id !== data.playerId),
        }));
        toast(`${data.playerName} left the room`);
        break;
      case "error":
        toast.error(data.message);
        break;
      default:
        console.log(`Unhandled socket event: ${event}`);
    }
  };

  // Function to create a room
  const createRoom = (playerName: string, roomCode: string) => {
    if (!connected) {
      setGameState((prev) => ({ ...prev, playerName, roomCode }));
      mockSocketResponse("room:created", { roomCode });
      return;
    }

    if (socket) {
      socket.emit("room:create", { playerName, roomCode });
      setGameState((prev) => ({ ...prev, playerName, roomCode }));
    }
  };

  // Function to join a room
  const joinRoom = (playerName: string, roomCode: string) => {
    if (!connected) {
      // Mock join room
      setGameState((prev) => ({ ...prev, playerName }));
      mockSocketResponse("room:joined", {
        roomCode,
        players: [
          { id: "host", name: "Host Player" },
          { id: "1", name: playerName },
        ],
      });
      return;
    }

    if (socket) {
      socket.emit("room:join", { playerName, roomCode });
      setGameState((prev) => ({ ...prev, playerName }));
    }
  };

  // Function to leave the current room
  const leaveRoom = () => {
    if (!connected) {
      // Mock leave room
      setGameState({
        roomCode: null,
        isHost: false,
        players: [],
        playerName: gameState.playerName,
      });
      toast("Left the room");
      return;
    }

    if (socket && gameState.roomCode) {
      socket.emit("room:leave", { roomCode: gameState.roomCode });
      setGameState({
        roomCode: null,
        isHost: false,
        players: [],
        playerName: gameState.playerName,
      });
    }
  };

  // Function to update player name
  const setPlayerName = (name: string) => {
    setGameState((prev) => ({ ...prev, playerName: name }));
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
