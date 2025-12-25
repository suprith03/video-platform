import jwt from "jsonwebtoken"

export default (roles = []) => (req, res, next) => {
  let token = null

  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.query.token) {
    token = req.query.token
  }

  if (!token) return res.sendStatus(401)

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  if (roles.length && !roles.includes(decoded.role)) {
    return res.sendStatus(403)
  }

  req.user = decoded
  next()
}
