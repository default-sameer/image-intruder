"use client";

import { useRoomList } from "@/api/room";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocket } from "@/context/SocketContext";
import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [type, setType] = useState<"create" | "join">("create");
  const router = useRouter();
  const {
    setPlayerName,
    connected,
    connecting,
    createRoom,
    joinRoom,
    gameState: { roomCode },
    loading,
  } = useSocket();

  const { data } = useRoomList();

  const ifRoomExist = (data?.rooms || []).some((room) => room.code === roomId);

  const handleCreateRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setPlayerName(username);
    createRoom(username);
  };

  const handleJoinRoom = () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    setPlayerName(username);
    joinRoom(username, roomId);
    if (!ifRoomExist) return;
    router.push(`/${roomId}`);
  };

  useEffect(() => {
    if (!loading && roomCode && type === "create") {
      console.log("i am called");
      router.push(`/${roomCode}`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, loading]);
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Image Intruder</CardTitle>
        <CardDescription>Create or Join an existing one</CardDescription>
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
        <Tabs
          defaultValue="create"
          className="w-full"
          onValueChange={(value) => setType(value as "create" | "join")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="cursor-pointer">
              Create Room
            </TabsTrigger>
            <TabsTrigger value="join" className="cursor-pointer">
              Join Room
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <Button
              onClick={handleCreateRoom}
              className="w-full bg-green-400 cursor-pointer disabled:cursor-not-allowed"
              variant="outline"
              disabled={connecting || !connected || loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create New Room"}
            </Button>
          </TabsContent>
          <TabsContent value="join" className="space-y-2">
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
            <Button
              onClick={handleJoinRoom}
              className="w-full cursor-pointer disabled:cursor-not-allowed"
              variant="outline"
              disabled={connecting || !connected}
            >
              <Users className="mr-2 h-4 w-4" />
              {loading ? "Joining..." : "Join Existing Room"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2"></CardFooter>
    </Card>
  );
}
