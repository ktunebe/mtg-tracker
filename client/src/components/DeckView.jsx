import React from "react"
import { useParams } from "react-router-dom"
import { apiFetch } from "../lib/api.js"
import { CardModal } from "./CardModal.jsx"

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

  console.log(openCard)

  return (
    <div className="relative">
      <h1 className="text-xl font-semibold mb-4">{deck.name}</h1>

      {/* Click-off overlay + preview */}
      {openCard && (
        <CardModal
          card={openCard}
          onClose={() => setCardOpen(null)}
          isOpen={!!openCard}
        />  
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
