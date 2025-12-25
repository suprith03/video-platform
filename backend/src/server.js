import http from "http"
import app from "./app.js"
import { initSocket } from "./sockets/socket.js"

const server = http.createServer(app)
initSocket(server)

server.listen(process.env.PORT || 5001)
