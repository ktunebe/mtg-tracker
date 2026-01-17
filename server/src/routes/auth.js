import express from "express"
import bcrypt from "bcryptjs"
import { User } from "../models/User.js"
import { signToken } from "../auth.js"

export const authRouter = express.Router()

authRouter.post("/signup", async (req, res) => {
  const { email, password, displayName } = req.body
  if (!email || !password) return res.status(400).json({ error: "email and password required" })
  if (password.length < 8) return res.status(400).json({ error: "password must be at least 8 characters" })

  const normalized = email.toLowerCase().trim()
  const existing = await User.findOne({ email: normalized })
  if (existing) return res.status(409).json({ error: "email already in use" })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email: normalized, passwordHash, displayName: displayName || "" })

  const token = signToken(user._id.toString())
  res.status(201).json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } })
})

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: "email and password required" })

  const normalized = email.toLowerCase().trim()
  const user = await User.findOne({ email: normalized })
  if (!user) return res.status(401).json({ error: "invalid credentials" })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: "invalid credentials" })

  const token = signToken(user._id.toString())
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } })
})
