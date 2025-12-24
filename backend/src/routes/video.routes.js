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
  const path = `uploads/${video.filename}`
  const stat = fs.statSync(path)
  const range = req.headers.range
  const start = Number(range.replace(/\D/g, ""))
  const end = stat.size - 1
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": "video/mp4"
  })
  fs.createReadStream(path, { start, end }).pipe(res)
})

export default router
