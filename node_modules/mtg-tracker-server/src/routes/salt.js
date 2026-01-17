import express from "express"
import { requireAuth } from "../auth.js"
import { SaltVote } from "../models/SaltVote.js"

export const saltRouter = express.Router()
saltRouter.use(requireAuth)

// upsert user vote for a card
saltRouter.put("/:cardId", async (req, res) => {
  const { cardId } = req.params
  const { value = 1 } = req.body

  const vote = await SaltVote.findOneAndUpdate(
    { userId: req.userId, cardId },
    { $set: { value } },
    { upsert: true, new: true }
  )

  res.json(vote)
})

// leaderboard: total salt by cardId
saltRouter.get("/leaderboard/top", async (req, res) => {
  const top = await SaltVote.aggregate([
    { $group: { _id: "$cardId", total: { $sum: "$value" }, votes: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 25 }
  ])

  res.json(top)
})
