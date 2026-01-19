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
      console.log(e2.details)
    } finally {
      setLoading(false)
    }


  }

	return (
		<div>
			<h2>Submit a Deck</h2>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<label htmlFor="name">Deck Name: </label>
				<input
					type="text"
					name="name"
					value={formData.name}
					onChange={handleFormChange}
					className="border border-white"
				/>
				<label htmlFor="deckText">Moxfield Deck Export Text: </label>
				<textarea
					type="text"
					name="deckText"
					value={formData.deckText}
					onChange={handleFormChange}
					className="border border-white"
				/>
				<Button type="submit" disabled={loading}>
					{loading ? 'Working...' : 'Submit'}
				</Button>
			</form>
		</div>
	)
}
