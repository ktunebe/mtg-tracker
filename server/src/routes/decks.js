import express from "express"
import mongoose from "mongoose"
import { requireAuth } from "../auth.js"
import { Deck } from "../models/Deck.js"

export const decksRouter = express.Router()
decksRouter.use(requireAuth)

decksRouter.get("/", async (req, res) => {
  const decks = await Deck.find({})
    .sort({ updatedAt: -1 })
    .populate("createdBy", "email displayName")
    .populate("updatedBy", "email displayName")
  res.json(decks)
})

decksRouter.post("/", async (req, res) => {
  const { name, format, colors, mainboard, sideboard, tags, notes } = req.body
  if (!name) return res.status(400).json({ error: "name is required" })

  const deck = await Deck.create({
    name,
    format: format || "Modern",
    colors: Array.isArray(colors) ? colors : [],
    mainboard: Array.isArray(mainboard) ? mainboard : [],
    sideboard: Array.isArray(sideboard) ? sideboard : [],
    tags: Array.isArray(tags) ? tags : [],
    notes: notes || "",
    createdBy: req.userId,
    updatedBy: req.userId
  })

  res.status(201).json(deck)
})

decksRouter.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "bad id" })
  const deck = await Deck.findById(req.params.id)
    .populate("createdBy", "email displayName")
    .populate("updatedBy", "email displayName")
  if (!deck) return res.status(404).json({ error: "Not found" })
  res.json(deck)
})

decksRouter.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "bad id" })

  const deck = await Deck.findById(req.params.id)
  if (!deck) return res.status(404).json({ error: "Not found" })

  // creator-only
  if (deck.createdBy.toString() !== req.userId) {
    return res.status(403).json({ error: "Only the creator can edit this deck" })
  }

  // whitelist fields you allow updates for
  const allowed = ["name", "format", "colors", "mainboard", "sideboard", "tags", "notes"]
  for (const key of allowed) {
    if (key in req.body) deck[key] = req.body[key]
  }
  deck.updatedBy = req.userId
  await deck.save()

  res.json(deck)
})

decksRouter.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "bad id" })

  const deck = await Deck.findById(req.params.id)
  if (!deck) return res.status(404).json({ error: "Not found" })

  // creator-only
  if (deck.createdBy.toString() !== req.userId) {
    return res.status(403).json({ error: "Only the creator can delete this deck" })
  }

  await deck.deleteOne()
  res.json({ deleted: true })
})
