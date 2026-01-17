import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Force-load mtg-tracker/.env (repo root)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, "../../.env") })

import express from "express"
import cors from "cors"
import { connectDb } from "./db.js"

import { authRouter } from "./routes/auth.js"
import { decksRouter } from "./routes/decks.js"
import { saltRouter } from "./routes/salt.js"

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI. Check your .env location and variable name.")
}

const app = express()
app.use(cors())
app.use(express.json())

app.get("/api/health", (req, res) => res.json({ ok: true }))
app.use("/api/auth", authRouter)
app.use("/api/decks", decksRouter)
app.use("/api/salt", saltRouter)

// Serve built client only in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist")
  app.use(express.static(clientDist))
  app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")))
} else {
  app.get("/", (req, res) => {
    res.send("API running. Start Vite dev server at http://localhost:5173")
  })
}

await connectDb(process.env.MONGODB_URI)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on :${port}`))
