import React from 'react'
import {Button} from './Button.jsx'

export function CardModal({ card, onClose, isOpen }) {
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
			<div className="fixed z-50 left-1/2 top-24 -translate-x-1/2 w-4/5 lg:w-2/3 2xl:w-3/5 rounded-xl shadow-xl flex flex-col gap-4 p-4 bg-mtg-blu">
        <Button size='sm' variant='primary' className='self-end' onClick={onClose}>Close</Button>
				<div className='flex flex-col md:flex-row justify-start w-full gap-4'>
          <img
            className="w-1/3 self-center flex-initial rounded-xl shadow-xl"
            src={card.imageNormal ?? card.imageSmall}
            alt={card.name}
          />
          <div className="md:w-2/3 flex flex-col items-start justify-between">
            <h2 className='font-bold self-center md:self-start text-xl sm:text-2xl md:text-3xl 2xl:text-4xl mb-1'>{card.name}</h2>
            <p className='self-center md:self-start 2xl:text-xl mb-6'>{card.typeLine}</p>
            <p className='whitespace-pre-line mb-6 px-4 md:px-0 md:pr-8'>{card.oracleText}</p>
            <div className='flex flex-col min-[535px]:flex-row gap-2 justify-between mt-auto w-full'>
              <p className='self-center'><strong>Salt Score:<span className='tracking-[-.5rem]'>{card.salt ? '🧂' : '0️⃣'}</span></strong></p>
              <div className='flex flex-col min-[535px]:flex-row gap-1'>
                <Button size='sm' variant='primary' className='self-center'>+🧂</Button>
                <Button size='sm' variant='primary' className='self-center'>++🧂</Button>
                <Button size='sm' variant='primary' className='self-center'>Remove Salt</Button>
              </div>
            </div>
          </div>
        </div>

			</div>
		</>
	)
}
