// server/src/routes/deck.js
import express from "express"
import mongoose from "mongoose"
import { requireAuth } from "../auth.js"
import { Deck } from "../models/Deck.js"
import { Card } from "../models/Card.js"

export const decksRouter = express.Router()
decksRouter.use(requireAuth)

// -------------------------
// Helpers
// -------------------------
const LINE_RE =
  /^\s*(\d+)\s+(.+?)\s+\(([A-Za-z0-9]{2,6})\)\s+([A-Za-z0-9-]+)\s*(?:\*.*\*)?\s*$/

function parseMoxfieldText(text) {
  const lines = String(text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const parsed = []
  const errors = []

  for (const line of lines) {
    const m = line.match(LINE_RE)
    if (!m) {
      errors.push({ line, reason: "Expected: '<qty> <name> (<SET>) <collector_number>'" })
      continue
    }

    const qty = Number(m[1])
    const name = m[2]
    const set = m[3].toLowerCase()
    const collector_number = m[4] // string, can include "-"

    if (!Number.isFinite(qty) || qty < 1) {
      errors.push({ line, reason: "Invalid quantity" })
      continue
    }

    parsed.push({ qty, name, set, collector_number })
  }

  return { parsed, errors }
}


function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function fetchScryfallCollection(identifiers) {
  const res = await fetch("https://api.scryfall.com/cards/collection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifiers })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Scryfall error ${res.status}: ${text}`)
  }

  return res.json()
}

function computeSortingType(typeLine = "") {
  // type_line looks like: "Legendary Artifact Creature — Human Soldier"
  const left = String(typeLine).split("—")[0] // only the "types" part
  const types = left.trim().toLowerCase().split(/\s+/)

  const has = (t) => types.includes(t)

  // Precedence to force one bucket
  if (has("land")) return "land"
  if (has("creature")) return "creature"
  if (has("planeswalker")) return "planeswalker"
  if (has("instant")) return "instant"
  if (has("sorcery")) return "sorcery"
  if (has("artifact")) return "artifact"
  if (has("enchantment")) return "enchantment"

  return "other"
}

function pickCardFields(card) {
  const face0 =
    Array.isArray(card.card_faces) && card.card_faces.length ? card.card_faces[0] : null

  const image_uris = card.image_uris ?? face0?.image_uris ?? {}

  const typeLine = card.type_line ?? face0?.type_line ?? ""

  return {
    scryfallId: card.id,

    name: card.name,
    set: card.set,
    collectorNumber: String(card.collector_number),

    manaCost: card.mana_cost ?? face0?.mana_cost ?? "",
    typeLine,
    oracleText: card.oracle_text ?? face0?.oracle_text ?? "",

    colors: card.colors ?? face0?.colors ?? [],
    colorIdentity: card.color_identity ?? [],

    imageSmall: image_uris.small ?? "",
    imageNormal: image_uris.normal ?? "",

    rarity: card.rarity ?? "",
    scryfallUri: card.scryfall_uri ?? "",

    sortingType: computeSortingType(typeLine),

    updatedAtScryfall: null
  }
}


function buildCardsMap(cards) {
  const map = {}
  for (const c of cards) map[c.scryfallId] = c
  return map
}

// -------------------------
// GET /api/decks
// -------------------------
decksRouter.get("/", async (req, res) => {
  const decks = await Deck.find({})
    .sort({ updatedAt: -1 })
    .populate("createdBy", "email displayName")
    .populate("updatedBy", "email displayName")
  res.json(decks)
})

// -------------------------
// POST /api/decks
// -------------------------
decksRouter.post("/", async (req, res) => {
  const { name, colors, mainboard, sideboard, tags, notes } = req.body
  if (!name) return res.status(400).json({ error: "name is required" })

  const deck = await Deck.create({
    name,
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

// -------------------------
// POST /api/decks/import
// Body: { name, deckText, tags?, notes? }
// Creates deck + upserts Card cache + returns { deck, cards }
// -------------------------
decksRouter.post("/import", async (req, res) => {
  const { name, deckText, tags, notes } = req.body ?? {}
  if (!name) return res.status(400).json({ error: "name is required" })
  if (!deckText) return res.status(400).json({ error: "deckText is required" })

  const { parsed, errors } = parseMoxfieldText(deckText)
  if (errors.length) return res.status(400).json({ error: "Invalid deck list", details: errors })

  const identifiers = parsed.map((p) => ({
    set: p.set,
    collector_number: p.collector_number
  }))

  const scryfallCards = []
  const notFound = []

  for (const batch of chunk(identifiers, 75)) {
    const payload = await fetchScryfallCollection(batch)
    if (Array.isArray(payload.data)) scryfallCards.push(...payload.data)
    if (Array.isArray(payload.not_found) && payload.not_found.length) notFound.push(...payload.not_found)
  }

  const idByKey = new Map(
    scryfallCards.map((c) => [`${c.set}:${String(c.collector_number)}`, c.id])
  )

  const mainboard = []
  const missing = []

  for (const p of parsed) {
    const key = `${p.set}:${p.collector_number}`
    const scryfallId = idByKey.get(key)
    if (!scryfallId) {
      missing.push(p)
      continue
    }
    mainboard.push({ scryfallId, qty: p.qty })
  }

  if (missing.length) {
    return res.status(400).json({
      error: "Some cards were not found on Scryfall",
      details: missing,
      scryfallNotFound: notFound
    })
  }

  // Upsert card cache
  const cardDocs = scryfallCards.map(pickCardFields)
  if (cardDocs.length) {
    await Card.bulkWrite(
      cardDocs.map((doc) => ({
        updateOne: {
          filter: { scryfallId: doc.scryfallId },
          update: { $set: doc },
          upsert: true
        }
      })),
      { ordered: false }
    )
  }

  // Derive deck colors from union of colorIdentity (optional)
  const colorSet = new Set()
  for (const c of cardDocs) for (const ci of c.colorIdentity ?? []) colorSet.add(ci)
  const colors = Array.from(colorSet)

  const deck = await Deck.create({
    name,
    colors,
    mainboard,
    sideboard: [],
    tags: Array.isArray(tags) ? tags : [],
    notes: notes || "",
    createdBy: req.userId,
    updatedBy: req.userId
  })

  // Hydrate cards for response
  const scryfallIds = [...new Set(mainboard.map((l) => l.scryfallId))]
  const cards = await Card.find({ scryfallId: { $in: scryfallIds } })
    .lean()
    .select(
      "scryfallId name set collectorNumber imageSmall imageNormal manaCost typeLine oracleText colors colorIdentity rarity scryfallUri"
    )

  res.status(201).json({ deck, cards: buildCardsMap(cards) })
})

// -------------------------
// GET /api/decks/:id
// Returns { deck, cards } so client can render hover/images without extra calls
// -------------------------
decksRouter.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "bad id" })

  const deck = await Deck.findById(req.params.id)
    .populate("createdBy", "email displayName")
    .populate("updatedBy", "email displayName")

  if (!deck) return res.status(404).json({ error: "Not found" })

  const scryfallIds = [
    ...new Set([
      ...(deck.mainboard ?? []).map((l) => l.scryfallId),
      ...(deck.sideboard ?? []).map((l) => l.scryfallId)
    ])
  ]

  const cards = await Card.find({ scryfallId: { $in: scryfallIds } })
    .lean()
    .select(
      "scryfallId name set collectorNumber imageSmall imageNormal manaCost typeLine oracleText colors colorIdentity rarity scryfallUri"
    )

  res.json({ deck, cards: buildCardsMap(cards) })
})

// -------------------------
// PATCH /api/decks/:id
// -------------------------
decksRouter.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "bad id" })

  const deck = await Deck.findById(req.params.id)
  if (!deck) return res.status(404).json({ error: "Not found" })

  // creator-only
  if (deck.createdBy.toString() !== req.userId) {
    return res.status(403).json({ error: "Only the creator can edit this deck" })
  }

  const allowed = ["name", "colors", "mainboard", "sideboard", "tags", "notes"]
  for (const key of allowed) {
    if (key in req.body) deck[key] = req.body[key]
  }

  deck.updatedBy = req.userId
  await deck.save()

  res.json(deck)
})

// -------------------------
// DELETE /api/decks/:id
// -------------------------
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
