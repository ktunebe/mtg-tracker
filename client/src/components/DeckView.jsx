import React from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { CardModal } from './CardModal.jsx'
import { groupDeckLinesByType } from '../lib/cardUtils.js'

export function DeckView() {
	const { id } = useParams()
	const [deckData, setDeckData] = React.useState(null)
	const [error, setError] = React.useState(null)
	const [cardOpen, setCardOpen] = React.useState(null)

  // helper to update a single card in the map
const updateCardInDeck = React.useCallback((updatedCard, saltScore) => {
  setDeckData((prev) => {
    if (!prev) return prev
    const nextCards = {
      ...prev.cards,
      [updatedCard.scryfallId]: {
        ...prev.cards[updatedCard.scryfallId],
        ...updatedCard,
        saltScore // optional: store it client-side for display
      }
    }
    return { ...prev, cards: nextCards }
  })
}, [])

	React.useEffect(() => {
		apiFetch(`/api/decks/${id}`)
			.then(setDeckData)
			.catch((e) => setError(e.message))
	}, [id])

	if (error) return <p className="text-red-500">{error}</p>
	if (!deckData) return <p>Loading...</p>

	const { deck, cards } = deckData
	const openCard = cardOpen ? cards[cardOpen] : null
	const sections = groupDeckLinesByType(deck, cards)

	const label = {
		creature: 'Creatures',
		planeswalker: 'Planeswalkers',
		instant: 'Instants',
		sorcery: 'Sorceries',
		artifact: 'Artifacts',
		enchantment: 'Enchantments',
		land: 'Lands',
		other: 'Other',
	}

	return (
		<div className="relative">
			<h1 className="text-xl font-semibold mb-4">{deck.name}</h1>

			{/* Click-off overlay + preview */}
			{openCard && (
				<CardModal
					card={openCard}
					onClose={() => setCardOpen(null)}
					isOpen={!!openCard}
          onVoteApplied={(payload) => updateCardInDeck(payload.card, payload.saltScore)}
				/>
			)}

			{sections.map((section) => (
				<div key={section.type}>
					<h2>{`${label[section.type]} (${section.items.length})`}</h2>
					<ul>
						{section.items.map(({ line, card }) => (
							<li key={line.scryfallId} className="flex gap-2">
								<span className="w-10 text-right font-mono">{line.qty}x</span>
								<button
									type="button"
									onClick={() => setCardOpen(line.scryfallId)}
									className="text-left hover:underline hover:cursor-pointer">
									{card?.name ?? 'Unknown card'}
								</button>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}
