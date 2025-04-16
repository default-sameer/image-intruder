"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/context/SocketContext";
import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();
  const { setPlayerName, connected, connecting } = useSocket();

  const createRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPlayerName(username);
    router.push(`/${newRoomId}`);
  };

  const joinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    setPlayerName(username);
    router.push(`/${roomId}`);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Multiplayer Rooms
          </CardTitle>
          <CardDescription>
            Create a new room or join an existing one
          </CardDescription>
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
                onChange={(e) => setUsername(e.target.value)}
                className="outline-0 focus:ring-0 focus-visible:ring-0"
              />
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="roomId" className="text-sm font-medium">
              Room ID (for joining)
            </label>
            {connecting ? (
              <Skeleton className="bg-slate-200 h-9 w-full"></Skeleton>
            ) : (
              <Input
                disabled={connecting || !connected}
                id="roomId"
                placeholder="Enter room ID to join"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="outline-0 focus:ring-0 focus-visible:ring-0"
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={createRoom}
            className="w-full bg-green-400 cursor-pointer disabled:cursor-not-allowed"
            variant="outline"
            disabled={connecting || !connected}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Room
          </Button>
          <Button
            onClick={joinRoom}
            className="w-full cursor-pointer disabled:cursor-not-allowed"
            variant="outline"
            disabled={connecting || !connected}
          >
            <Users className="mr-2 h-4 w-4" />
            Join Existing Room
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
