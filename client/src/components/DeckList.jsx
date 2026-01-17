// client/src/pages/DecksPage.jsx
import { useEffect, useState } from "react"
import { apiFetch } from "../lib/api.js"
import { DeckOverview } from "./DeckOverview.jsx"

export function DeckList() {
  const [decks, setDecks] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true

    apiFetch("/api/decks")
      .then((data) => {
        if (!alive) return
        setDecks(data)
      })
      .catch((e) => {
        if (!alive) return
        setError(e.message)
      })

    return () => {
      alive = false
    }
  }, [])

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Decks</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <DeckOverview key={deck._id} deck={deck} />
        ))}
      </div>
    </div>
  )
}
