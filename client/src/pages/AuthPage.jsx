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
		} catch (e2) {
			setError(e2.message)
		} finally {
			setLoading(false)
			navigate('/')
		}
	}

	return (
		<div className='border-4 rounded-3xl bg-mtg-blk border-r-mtg-blu border-l-mtg-grn border-t-red-900 border-b-mtg-wht shadow-[0_15px_25px_#F8F6D8,15px_0_25px_#0E68AB,-15px_0_25px_#00733E,0_-15px_25px_#D3202A] mt-16 max-w-3/4 lg:max-w-3/5 mx-auto flex flex-col items-center justify-between'>
			<div className='flex w-full'>
				<Link to="/login" className='w-1/2'>
					<Button className={`w-full rounded-tl-2xl ${mode === 'login' ? 'bg-red-900 hover:bg-red-900' : 'bg-bg hover:bg-surface2'}`}>Login</Button>
				</Link>
				<Link to="/signup" className='w-1/2'>
					<Button className={`w-full rounded-tr-2xl ${mode === 'signup' ? 'bg-red-900 hover:bg-red-900' : 'bg-bg hover:bg-surface2'}`}>Sign Up</Button>
				</Link>
			</div>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3 p-8">
				<div className='flex flex-col'>
					<label htmlFor="email">Email: </label>
					<input
						type="text"
						name="email"
						value={formData.email}
						onChange={handleFormChange}
						className="border border-white px-1"
					/>
				</div>
				<div className='flex flex-col'>
					<label htmlFor="password">Password: </label>
					<input
						type="text"
						name="password"
						value={formData.password}
						onChange={handleFormChange}
						className="border border-white px-1"
					/>
				</div>
				{mode === 'signup' && (
					<div className='flex flex-col'>
						<label htmlFor="displayName">Select a display name:</label>
						<input
							type="text"
							name="displayName"
							value={formData.displayName}
							onChange={handleFormChange}
							className="border border-white px-1"
						/>
					</div>
				)}
				<Button type="submit" disabled={loading} variant='secondary'>
					{loading
						? 'Working...'
						: mode === 'signup'
							? 'Create account'
							: 'Log in'}
				</Button>
			</form>
		</div>
	)
}
