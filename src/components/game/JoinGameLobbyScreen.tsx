import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { Button } from "../ui/button";
import { Users } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { redirect, useParams } from "next/navigation";
import { useRoomList } from "@/api/room";

const JoinGameLobbyScreen = () => {
  const [username, setUsername] = useState("");
  const { connected, connecting, joinRoom, setPlayerName } = useSocket();

  const { data } = useRoomList();

  const params = useParams();

  const roomId = params.id as string;

  const ifRoomExist = (data?.rooms || []).some((room) => room.code === roomId);
  const handleJoinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    if (!ifRoomExist) {
      toast.error("Room does not exist");
      redirect("/");
    }
    setPlayerName(username);
    joinRoom(username, roomId);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardDescription>Enter your Username to Join Room</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          {connecting ? (
            <Skeleton className="bg-slate-200 h-9 w-full"></Skeleton>
          ) : (
            <Input
              disabled={connecting || !connected}
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLocaleLowerCase())}
              className="outline-0 focus:ring-0 focus-visible:ring-0"
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          onClick={handleJoinRoom}
          className="w-full cursor-pointer disabled:cursor-not-allowed"
          variant="outline"
          disabled={connecting || !connected}
        >
          <Users className="mr-2 h-4 w-4" />
          Join Existing Room
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JoinGameLobbyScreen;
