import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRoutes from "./routes/auth.routes.js"
import videoRoutes from "./routes/video.routes.js"

dotenv.config()
mongoose.connect(process.env.MONGO_URI)

const app = express()
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

app.use("/api/auth", authRoutes)
app.use("/api/videos", videoRoutes)

mongoose.connection.once("open", () => {
  console.log("MongoDB connected")
})

export default app
