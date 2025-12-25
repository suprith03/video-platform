import express from "express"
import User from "../models/User.js"
import auth from "../middleware/auth.js"

const router = express.Router()

router.get("/", auth(["admin"]), async (req, res) => {
  const users = await User.find(
    { tenantId: req.user.tenantId },
    "_id email role"
  )
  res.json(users)
})

export default router
