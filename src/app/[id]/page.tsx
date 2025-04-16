"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

const GameRoom = () => {
  const router = useRouter();
  const {
    gameState: { name, roomCode },
    leaveRoom,
  } = useSocket();

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-3">
      Room ID: {roomCode} Comming Soon {name}
      <Button
        onClick={handleLeaveRoom}
        className="w-md cursor-pointer disabled:cursor-not-allowed"
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        onClick={handleLeaveRoom}
        className="w-md cursor-pointer disabled:cursor-not-allowed"
        variant="outline"
      >
        Leave Room
      </Button>
    </div>
  );
};

export default GameRoom;
