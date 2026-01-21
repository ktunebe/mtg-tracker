import mongoose from "mongoose"

const CardSchema = new mongoose.Schema(
  {
    // Scryfall canonical ID (uuid string)
    scryfallId: { type: String, required: true, unique: true, index: true },

    // Core identity
    name: { type: String, required: true },
    set: { type: String, required: true, lowercase: true, trim: true }, // e.g. "ltr"
    collectorNumber: { type: String, required: true, trim: true },

    // Display helpers
    manaCost: { type: String, default: "" }, // e.g. "{1}{W}{U}"
    typeLine: { type: String, default: "" }, // e.g. "Legendary Creature — Human Noble"
    oracleText: { type: String, default: "" },

    colors: { type: [String], default: [] },        // e.g. ["W","U"]
    colorIdentity: { type: [String], default: [] }, // e.g. ["W","U"]

    // Images for UI
    imageSmall: { type: String, default: "" },
    imageNormal: { type: String, default: "" },

    // Optional (useful later)
    rarity: { type: String, default: "" },        // "common" | "uncommon" | "rare" | "mythic"
    scryfallUri: { type: String, default: "" },   // link to scryfall page

    // Refresh control (optional)
    updatedAtScryfall: { type: Date, default: null },
    // Salt Score
    saltTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Helpful compound index for alternate lookup
CardSchema.index({ set: 1, collectorNumber: 1 })

export const Card = mongoose.model("Card", CardSchema)
