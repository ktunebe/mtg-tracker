import React from 'react'
import { Button } from './Button.jsx'
import { apiFetch } from '../lib/api.js'
import {range} from '../lib/utils.js'

export function CardModal({ card, onClose, isOpen, onVoteApplied }) {
	const [mySaltScore, setMySaltScore] = React.useState(0)
	const [error, setError] = React.useState('')
	const [loading, setLoading] = React.useState(false)

	React.useEffect(() => {
		if (!isOpen || !card?.scryfallId) return

		let alive = true

		apiFetch(`/api/salt/${card.scryfallId}/me`)
			.then((d) => {
				if (!alive) return
				setMySaltScore(d.value ?? 0)
			})
			.catch((e) => {
				if (!alive) return
				setError(e.message)
			})

		return () => {
			alive = false
		}
	}, [isOpen, card?.scryfallId])

	const setVote = async (value) => {
		setError('')
		setLoading(true)
		try {
			const data = await apiFetch(`/api/salt/${card.scryfallId}`, {
				method: 'PUT',
				body: JSON.stringify({ value }),
			})
			setMySaltScore(data.vote?.value ?? value)
      // tell parent to update the card map
      onVoteApplied?.(data)
		} catch (e) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	// Use escape key to close modal
	React.useEffect(() => {
		if (!isOpen) return
		function onKeyDown(e) {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [isOpen])
	// Return nothing if isOpen is false or there is no card
	if (!isOpen || !card) return null

	return (
		<>
			{/* Full screen button overlay to close modal, instead of just listening for click off */}
			<button
				type="button"
				onClick={onClose}
				className="fixed inset-0 z-40 bg-bg opacity-50"
				aria-label="Close card preview"
			/>
			<div className="fixed z-50 left-1/2 top-24 -translate-x-1/2 w-9/10 lg:w-2/3 2xl:w-3/5 rounded-xl shadow-xl flex flex-col gap-4 p-4 bg-mtg-blu">
				<Button
					size="sm"
					variant="primary"
					className="self-end"
					onClick={onClose}>
					Close
				</Button>
				<div className="flex flex-col md:flex-row justify-start w-full gap-4">
					<img
						className="w-1/3 self-center flex-initial rounded-xl shadow-xl"
						src={card.imageNormal ?? card.imageSmall}
						alt={card.name}
					/>
					<div className="md:w-2/3 flex flex-col items-start justify-between">
						<h2 className="font-bold self-center md:self-start text-xl sm:text-2xl md:text-3xl 2xl:text-4xl mb-1">
							{card.name}
						</h2>
						<p className="self-center md:self-start 2xl:text-xl mb-6">
							{card.typeLine}
						</p>
						<p className="whitespace-pre-line mb-6 px-4 md:px-0 md:pr-8">
							{card.oracleText}
						</p>
						<div className="flex flex-col gap-2 mt-auto w-full">
							<div className="">
								<span className='font-bold'>
									Salt Score:
                  {' '}
									{card.saltScore > 0 ? 
                  range(Math.ceil(card.saltScore)).map((salt) => (
                    <span key={salt} className="tracking-[-.4rem]">🧂</span>
                  ))
                  : <span>0️⃣</span>
                }
								</span>
							</div>
							<div className="flex items-center gap-1">
                <span className='self-start font-bold'>
                  My Vote: 
                </span>
								<Button
									size="sm"
									variant="primary"
									className={`${mySaltScore === 1 ? "border border-red-500" : ""} self-start`}
									disabled={loading}
									onClick={() => setVote(1)}>
									🧂
								</Button>
								<Button
									size="sm"
									variant="primary"
									className={`${mySaltScore === 2 ? "border border-red-500" : ""} self-start`}
									disabled={loading}
									onClick={() => setVote(2)}>
									🧂🧂
								</Button>
								<Button
									size="sm"
									variant="primary"
									className={`${mySaltScore === 0 ? "border border-red-500" : ""} self-start`}
									disabled={loading}
									onClick={() => setVote(0)}>
									0️⃣
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
