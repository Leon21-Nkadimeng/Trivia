import { io } from "socket.io-client";

const socket = io("http://localhost:7676", {
  autoConnect: false
});

export default socket;