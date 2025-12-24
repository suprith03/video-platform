import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

router.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10)
  const user = await User.create({ ...req.body, password: hash })
  res.json(user)
})

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.sendStatus(401)
  const ok = await bcrypt.compare(req.body.password, user.password)
  if (!ok) return res.sendStatus(401)
  const token = jwt.sign({ id: user._id, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET)
  res.json({ token })
})

export default router
