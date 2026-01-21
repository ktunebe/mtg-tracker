import mongoose from "mongoose"

const SaltVoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scryfallId: { type: String, required: true },
    value: { type: Number, default: 0, min: 0, max: 2, validate: Number.isInteger }
  },
  { timestamps: true }
)

SaltVoteSchema.index({ userId: 1, scryfallId: 1 }, { unique: true })
SaltVoteSchema.index({ scryfallId: 1 })


export const SaltVote = mongoose.model("SaltVote", SaltVoteSchema)
