import React from 'react'
import { Button } from '../components/Button.jsx'
import { apiFetch } from '../lib/api.js'
import { useNavigate } from 'react-router-dom'

const initialFormData = {
	name: '',
	deckText: '',
}

export function ImportDeckPage() {
  const navigate = useNavigate()
	const [formData, setFormData] = React.useState(initialFormData)
	const [error, setError] = React.useState('')
	const [loading, setLoading] = React.useState(false)

	const handleFormChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const path = "/api/decks/import"

      const body = {
        name: formData.name,
        deckText: formData.deckText
      }

      const data = await apiFetch(path, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      navigate(`/decks/${data.deck._id}`)
    } catch (e2) {
      setError(e2.message)
    } finally {
      setLoading(false)
    }


  }

	return (
		<div className='border-4 rounded-3xl bg-bg border-r-mtg-blu border-l-mtg-grn border-t-red-900 border-b-mtg-wht shadow-[0_15px_25px_#F8F6D8,15px_0_25px_#0E68AB,-15px_0_25px_#00733E,0_-15px_25px_#D3202A] mt-16 max-w-3/4 lg:max-w-3/5 mx-auto flex flex-col items-center justify-between gap-4 p-6'>
			<h2 className='text-3xl font-bold'>Deck Info</h2>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4 w-2/3">
				<div className='flex flex-col'>
          <label htmlFor="name">Deck Name: </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            className="border border-white"
          />
        </div>
				<div className="flex flex-col">
          <label htmlFor="deckText">Moxfield Deck Export Text: </label>
          <textarea
            type="text"
            name="deckText"
            value={formData.deckText}
            onChange={handleFormChange}
            className="border border-white min-h-32"
          />
        </div>
				<Button type="submit" variant='secondary' disabled={loading}>
					{loading ? 'Working...' : 'Submit'}
				</Button>
			</form>
		</div>
	)
}
