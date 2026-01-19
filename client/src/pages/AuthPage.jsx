import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { apiFetch } from '../lib/api.js'
import { setToken, setUser } from '../lib/auth.js'

const initialFormData = {
	email: '',
	password: '',
	displayName: '',
}

export function AuthPage({ mode }) {
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

	React.useEffect(() => {
		setError('')
		setFormData(initialFormData)
	}, [mode])

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const path = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'

			const body =
				mode === 'signup'
					? {
							email: formData.email,
							password: formData.password,
							displayName: formData.displayName,
						}
					: {
							email: formData.email,
							password: formData.password,
						}

			const data = await apiFetch(path, {
				method: 'POST',
				body: JSON.stringify(body),
			})

			setToken(data.token)
      setUser(data.user)
			navigate('/')
		} catch (e2) {
			setError(e2.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<Link to="/login">
				<Button>Login</Button>
			</Link>
			<Link to="/signup">
				<Button>Sign Up</Button>
			</Link>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<div>
					<label htmlFor="email">Email: </label>
					<input
						type="text"
						name="email"
						value={formData.email}
						onChange={handleFormChange}
						className="border border-white"
					/>
				</div>
				<div>
					<label htmlFor="password">Password: </label>
					<input
						type="text"
						name="password"
						value={formData.password}
						onChange={handleFormChange}
						className="border border-white"
					/>
				</div>
				{mode === 'signup' && (
					<div>
						<label htmlFor="displayName">Select a display name:</label>
						<input
							type="text"
							name="displayName"
							value={formData.displayName}
							onChange={handleFormChange}
							className="border border-white"
						/>
					</div>
				)}
				<Button type="submit" disabled={loading}>
					{loading
						? 'Working...'
						: mode === 'signup'
							? 'Create account'
							: 'Login'}
				</Button>
			</form>
		</div>
	)
}
