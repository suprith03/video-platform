import http from "http"
import app from "./app.js"
import userRoutes from "./routes/user.routes.js"
import { initSocket } from "./sockets/socket.js"

const server = http.createServer(app)
initSocket(server)
app.use("/api/users", userRoutes)

server.listen(process.env.PORT || 5001)
