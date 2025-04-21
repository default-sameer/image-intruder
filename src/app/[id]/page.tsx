"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import LobbyScreen from "@/components/game/LobbyScreen";
import JoinGameLobbyScreen from "@/components/game/JoinGameLobbyScreen";

const GameRoom = () => {
  const params = useParams();

  const roomId = params.id as string;
  const {
    gameState: { name, roomCode },
  } = useSocket();

  if (roomId && (!name || !roomCode)) return <JoinGameLobbyScreen />;

  return <LobbyScreen />;
};

export default GameRoom;
