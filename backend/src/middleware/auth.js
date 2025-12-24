import jwt from "jsonwebtoken"

export default (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  if (roles.length && !roles.includes(decoded.role)) return res.sendStatus(403)
  req.user = decoded
  next()
}
