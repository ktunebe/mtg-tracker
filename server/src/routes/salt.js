import express from "express"
import mongoose from "mongoose"
import { requireAuth } from "../auth.js"
import { SaltVote } from "../models/SaltVote.js"
import { Card } from "../models/Card.js"
import { User } from "../models/User.js"

export const saltRouter = express.Router()
saltRouter.use(requireAuth)

function parseVoteValue(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  const v = Math.floor(n)
  if (v < 0 || v > 2) return null
  return v
}

function computeSaltScore(saltTotal, usersCount) {
  if (!usersCount) return 0
  // max per user = 2, map to 0..5 => multiply by 2.5
  return (saltTotal / usersCount) * 2.5
}

// Upsert user vote for a card (0, 1, 2) AND keep Card.saltTotal in sync
saltRouter.put("/:scryfallId", async (req, res) => {
  const { scryfallId } = req.params
  const value = parseVoteValue(req.body?.value ?? 1)
  if (value === null) return res.status(400).json({ error: "value must be 0, 1, or 2" })

  const session = await mongoose.startSession()

  try {
    let voteDoc = null
    let cardDoc = null

    await session.withTransaction(async () => {
      // Ensure card exists (scryfallId is Scryfall ID in your design)
      const card = await Card.findOne({ scryfallId }).session(session)
      if (!card) {
        const err = new Error("Card not found")
        err.status = 404
        throw err
      }

      const existingVote = await SaltVote.findOne({
        userId: req.userId,
        scryfallId
      }).session(session)

      const oldValue = existingVote?.value ?? 0
      const delta = value - oldValue

      voteDoc = await SaltVote.findOneAndUpdate(
        { userId: req.userId, scryfallId },
        { $set: { value } },
        { upsert: true, new: true, setDefaultsOnInsert: true, session }
      )

      if (delta !== 0) {
        await Card.updateOne(
          { scryfallId: scryfallId },
          { $inc: { saltTotal: delta } },
          { session }
        )
      }

      cardDoc = await Card.findOne({ scryfallId })
        .select("scryfallId name imageSmall imageNormal saltTotal")
        .lean()
        .session(session)
    })

    const usersCount = await User.countDocuments({})
    const saltScore = computeSaltScore(cardDoc.saltTotal, usersCount)

    res.json({ vote: voteDoc, card: cardDoc, usersCount, saltScore })
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Server error" })
  } finally {
    session.endSession()
  }
})

// Get my current vote for a card
saltRouter.get("/:scryfallId/me", async (req, res) => {
  const { scryfallId } = req.params
  const vote = await SaltVote.findOne({ userId: req.userId, scryfallId }).lean()
  res.json({ value: vote?.value ?? 0 })
})

// Leaderboard: top salty cards (uses Card.saltTotal, not aggregation each time)
saltRouter.get("/leaderboard/top", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 25, 100)
  const usersCount = await User.countDocuments({})

  const cards = await Card.find({})
    .sort({ saltTotal: -1 })
    .limit(limit)
    .select("scryfallId name imageSmall saltTotal")
    .lean()

  const results = cards.map((c) => ({
    ...c,
    saltScore: computeSaltScore(c.saltTotal, usersCount)
  }))

  res.json({ usersCount, cards: results })
})
