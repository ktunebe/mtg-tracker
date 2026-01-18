export function computeSortingType(typeLine = "") {
  const left = String(typeLine).split("—")[0]
  const types = left.trim().toLowerCase().split(/\s+/)
  const has = (t) => types.includes(t)

  if (has("land")) return "land"
  if (has("creature")) return "creature"
  if (has("planeswalker")) return "planeswalker"
  if (has("instant")) return "instant"
  if (has("sorcery")) return "sorcery"
  if (has("artifact")) return "artifact"
  if (has("enchantment")) return "enchantment"

  return "other"
}

const SORT_ORDER = [
  "creature",
  "planeswalker",
  "instant",
  "sorcery",
  "artifact",
  "enchantment",
  "land",
  "other"
]

export function groupDeckLinesByType(deck, cardsMap) {
  const groups = new Map()

  for (const line of deck.mainboard ?? []) {
    const card = cardsMap?.[line.cardId]
    const type = computeSortingType(card?.typeLine ?? "")

    if (!groups.has(type)) groups.set(type, [])
    groups.get(type).push({ line, card })
  }

  // return a stable ordered array of sections
  return SORT_ORDER
    .filter((t) => groups.has(t))
    .map((t) => ({
      type: t,
      items: groups.get(t)
    }))
}
