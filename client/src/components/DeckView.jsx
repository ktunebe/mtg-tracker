import React from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "../lib/api.js"

export function DeckView() {
  const { id } = useParams()
  const [deckData, setDeckData] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [cardOpen, setCardOpen] = React.useState(null)

  React.useEffect(() => {
    apiFetch(`/api/decks/${id}`)
      .then(setDeckData)
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-red-500">{error}</p>
  if (!deckData) return <p>Loading...</p>

  const { deck, cards } = deckData
  const openCard = cardOpen ? cards[cardOpen] : null

  return (
    <div className="relative">
      <h1 className="text-xl font-semibold mb-4">{deck.name}</h1>

      {/* Click-off overlay + preview */}
      {openCard && (
        <>
          <button
            type="button"
            onClick={() => setCardOpen(null)}
            className="fixed inset-0 z-40"
            aria-label="Close card preview"
          />
          <img
            className="fixed z-50 left-1/2 top-24 -translate-x-1/2 w-72 rounded-xl shadow-xl"
            src={openCard.imageNormal ?? openCard.imageSmall}
            alt={openCard.name}
          />
        </>
      )}

      <ul className="space-y-2">
        {deck.mainboard.map((line) => {
          const card = cards[line.cardId]
          return (
            <li key={line.cardId} className="flex gap-2">
              <span className="w-10 text-right font-mono">{line.qty}x</span>
              <button
                type="button"
                onClick={() => setCardOpen(line.cardId)}
                className="text-left hover:underline"
              >
                {card?.name ?? "Unknown card"}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
