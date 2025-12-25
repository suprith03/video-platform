import Video from "../models/Video.js"
import { analyze } from "./sensitivity.js"
import { io } from "../sockets/socket.js"
import fs from "fs"
import ffmpeg from "fluent-ffmpeg"
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export const processVideo = async video => {
  try {
    const inputPath = `uploads/${video.filename}`
    const outputName = video.filename.replace(/\.[^/.]+$/, "") + "-processed.mp4"
    const outputPath = `uploads/${outputName}`

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions("-movflags faststart")
        .on("progress", p => {
          if (p.percent) {
            io.emit(`progress-${video._id}`, Math.min(99, Math.floor(p.percent)))
          }
        })
        .on("end", () => {
          io.emit(`progress-${video._id}`, 100)
          resolve()
        })
        .on("error", reject)
        .save(outputPath)
    })

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)

    video.filename = outputName
    video.sensitivity = await analyze()
    video.status = "completed"
    await video.save()

    io.emit("processing-complete", video._id)
  } catch (e) {
    video.status = "failed"
    await video.save()
  }
}
