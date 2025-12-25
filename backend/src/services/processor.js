import Video from "../models/Video.js"
import { analyze } from "./sensitivity.js"
import { io } from "../sockets/socket.js"

export const processVideo = async video => {
  for (let i = 10; i <= 100; i += 10) {
    await new Promise(r => setTimeout(r, 500))
    io.emit(`progress-${video._id}`, i)
  }

  video.sensitivity = await analyze()
  video.status = "completed"
  await video.save()

  io.emit("processing-complete", video._id)
}
