import { createContext, useEffect } from "react";
import { io } from "socket.io-client";

export const SocketDataContext = createContext();

const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket"],
  withCredentials: true,
});

import Console from "../utils/console";

function SocketContext({ children }) {
  useEffect(() => {
    socket.on("connect", () => {
      Console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      Console.log("Disconnected from server");
    });
  }, []);

  return (
    <SocketDataContext.Provider value={{ socket }}>
      {children}
    </SocketDataContext.Provider>
  );
}

export default SocketContext;
