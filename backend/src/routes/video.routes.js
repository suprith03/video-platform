import express from "express"
import multer from "multer"
import Video from "../models/Video.js"
import auth from "../middleware/auth.js"
import { processVideo } from "../services/processor.js"
import fs from "fs"

const upload = multer({ dest: "uploads/" })
const router = express.Router()

router.post("/", auth(["editor","admin"]), upload.single("video"), async (req, res) => {
  const video = await Video.create({
    userId: req.user.id,
    tenantId: req.user.tenantId,
    filename: req.file.filename,
    status: "processing"
  })
  processVideo(video)
  res.json(video)
})

router.get("/", auth(), async (req, res) => {
  const videos = await Video.find({ tenantId: req.user.tenantId })
  res.json(videos)
})
router.get("/stream/:id", auth(), async (req, res) => {
  const video = await Video.findById(req.params.id)

  if (!video) return res.sendStatus(404)
  if (video.tenantId !== req.user.tenantId) return res.sendStatus(403)
  if (video.status !== "completed") return res.sendStatus(409)

  const videoPath = `uploads/${video.filename}`
  const stat = fs.statSync(videoPath)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4"
    })

    fs.createReadStream(videoPath, { start, end }).pipe(res)
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    })

    fs.createReadStream(videoPath).pipe(res)
  }
})


export default router
