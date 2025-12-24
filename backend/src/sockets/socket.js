import { Server } from "socket.io"

export let io

export const initSocket = server => {
  io = new Server(server, { cors: { origin: "*" } })
}
