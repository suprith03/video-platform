import Video from "../models/Video.js"
import fs from "fs"
import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"
import { io } from "../sockets/socket.js"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export const processVideo = async video => {
  try {
    const inputPath = `uploads/${video.filename}`
    const outputName = video.filename.replace(/\.[^/.]+$/, "") + "-processed.mp4"
    const outputPath = `uploads/${outputName}`

    let progress = 0
    let ffmpegDone = false

    const interval = setInterval(() => {
      if (progress < 90) {
        progress += 4.5
        io.emit(`progress-${video._id}`, Math.min(90, Math.round(progress)))
      }

      if (ffmpegDone && progress >= 90) {
        clearInterval(interval)
        io.emit(`progress-${video._id}`, 100)
      }
    }, 200)

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions("-movflags faststart")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath)
    })

    ffmpegDone = true

    while (progress < 90) {
      await new Promise(r => setTimeout(r, 200))
    }

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)

    video.filename = outputName
    video.status = "completed"
    video.sensitivity = "safe"
    await video.save()

    io.emit("processing-complete", video._id)
  } catch (err) {
    video.status = "failed"
    await video.save()
  }
}
