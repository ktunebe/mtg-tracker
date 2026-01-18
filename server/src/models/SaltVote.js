import mongoose from "mongoose"

const SaltVoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cardId: { type: String, required: true },
    value: { type: Number, default: 0, min: 0, max: 5 }
  },
  { timestamps: true }
)

SaltVoteSchema.index({ userId: 1, cardId: 1 }, { unique: true })

export const SaltVote = mongoose.model("SaltVote", SaltVoteSchema)
