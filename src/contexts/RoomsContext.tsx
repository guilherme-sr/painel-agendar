import { createContext } from "react";

interface roomsState {
  attributes: {
    name: string;
    color: string;
    active: boolean;
  };
  id: number;
}

interface RoomsContextData {
  rooms: roomsState[];
}

const RoomsContext = createContext<RoomsContextData>({ rooms: [] });

export default RoomsContext;
