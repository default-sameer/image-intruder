"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

const GameRoom = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const {
    gameState: { playerName },
  } = useSocket();
  return (
    <div className="flex flex-col gap-3">
      Room ID: {roomId} Comming Soon {playerName}
      <Button
        onClick={() => router.push("/")}
        className="w-md cursor-pointer disabled:cursor-not-allowed"
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
    </div>
  );
};

export default GameRoom;
