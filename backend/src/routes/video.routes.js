import express from "express"
import multer from "multer"
import fs from "fs"
import Video from "../models/Video.js"
import auth from "../middleware/auth.js"
import { processVideo } from "../services/processor.js"

const router = express.Router()

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage })

router.post("/", auth(["admin", "editor"]), upload.single("video"), async (req, res) => {
  const video = await Video.create({
    filename: req.file.filename,
    userId: req.user.id,
    tenantId: req.user.tenantId,
    status: "processing",
    assignedUsers: []
  })

  processVideo(video)
  res.json(video)
})

router.get("/", auth(), async (req, res) => {
  const query = { tenantId: req.user.tenantId }

  if (req.user.role === "viewer") {
    query.assignedUsers = req.user.id
  }

  const videos = await Video.find(query)
    .populate("assignedUsers", "email")
    .sort({ createdAt: -1 })

  res.json(videos)
})


router.post("/:id/assign", auth(["admin"]), async (req, res) => {
  const { userId } = req.body
  const video = await Video.findById(req.params.id)

  if (!video) return res.sendStatus(404)
  if (video.tenantId !== req.user.tenantId) return res.sendStatus(403)

  if (!video.assignedUsers.includes(userId)) {
    video.assignedUsers.push(userId)
    await video.save()
  }

  res.json({ message: "Assigned successfully" })
})

router.delete("/:id", auth(["admin"]), async (req, res) => {
  const video = await Video.findById(req.params.id)
  if (!video) return res.sendStatus(404)

  if (video.tenantId !== req.user.tenantId) return res.sendStatus(403)

  const path = `uploads/${video.filename}`
  if (fs.existsSync(path)) fs.unlinkSync(path)

  await video.deleteOne()
  res.json({ message: "Deleted" })
})

router.get("/stream/:id", auth(), async (req, res) => {
  const video = await Video.findById(req.params.id)
  if (!video) return res.sendStatus(404)
  if (video.tenantId !== req.user.tenantId) return res.sendStatus(403)
  if (video.status !== "completed") return res.sendStatus(409)

  const filePath = `uploads/${video.filename}`
  const stat = fs.statSync(filePath)
  const range = req.headers.range

  if (!range) {
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4"
    })
    fs.createReadStream(filePath).pipe(res)
    return
  }

  const parts = range.replace(/bytes=/, "").split("-")
  const start = parseInt(parts[0], 10)
  const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${stat.size}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": "video/mp4"
  })

  fs.createReadStream(filePath, { start, end }).pipe(res)
})

export default router
