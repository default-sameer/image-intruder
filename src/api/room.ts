import { useQuery } from "@tanstack/react-query";
import axios from "./axios";
import { RoomList } from "@/types/player.type";

export const useRoomList = () => {
  return useQuery<RoomList>({
    queryKey: ["room-list"],
    queryFn: async () => {
      return axios.get("/rooms").then((res) => res.data.data);
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
};
