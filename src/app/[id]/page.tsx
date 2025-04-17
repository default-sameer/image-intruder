"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Copy, Users } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const GameRoom = () => {
  const router = useRouter();
  const {
    gameState: { name, roomCode, players, isHost },
    leaveRoom,
  } = useSocket();

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  const copyRoomId = (roomCode: string) => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room ID has been copied to clipboard");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Room: {roomCode}</CardTitle>
          <div className="flex gap-2">
            {/* <Button
              variant="outline"
              size="sm"
              // onClick={() => setShowDebug(!showDebug)}
            >
              <Info className="h-4 w-4" />
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyRoomId(roomCode || "")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {players.length}/5 players connected
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-md bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {player.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{player.name}</p>
                    {isHost && name === player.name && (
                      <Badge variant="outline" className="text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                </div>
                {player.name === name && <Badge variant="secondary">You</Badge>}
              </div>
            ))}

            {Array.from({ length: Math.max(0, 5 - players.length) }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center p-2 rounded-md bg-slate-50 opacity-50"
                >
                  <Avatar>
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <p className="ml-3 text-sm text-muted-foreground">
                    Waiting for player...
                  </p>
                </div>
              )
            )}
          </div>
          <Button
            onClick={handleLeaveRoom}
            className="w-full"
            variant="outline"
          >
            Leave Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameRoom;
