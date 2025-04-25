export interface PlayersResponse {
  status: string;
  data: RoomList;
}

export interface RoomList {
  rooms: Room[];
  total: number;
}

export interface Room {
  code: string;
  playerCount: number;
  players: Players;
}

export interface Players {
  key: string;
}
