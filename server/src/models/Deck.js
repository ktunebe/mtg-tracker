import mongoose from "mongoose"

const CardLineSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true }, // later: Scryfall ID
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }
)

const DeckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    format: { type: String, default: "Modern" },
    colors: { type: [String], default: [] }, // optional ["U","R"]
    mainboard: { type: [CardLineSchema], default: [] },
    sideboard: { type: [CardLineSchema], default: [] },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
)

export const Deck = mongoose.model("Deck", DeckSchema)
