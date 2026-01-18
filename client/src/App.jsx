import React from 'react'
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Outlet,
} from 'react-router-dom'
import { DeckList } from './components/DeckList.jsx'
import { DeckView } from './components/DeckView.jsx'
import { Link } from 'react-router-dom'

function Layout() {
	return (
		<div className="min-h-screen bg-bg text-slate-100">
			<div className="mx-auto flex max-w-6xl">
				<aside className="w-60 border-r border-slate-800 p-4">
					<div className="text-lg font-semibold">MTG Tracker </div>
					<ul>
						<li>
							<Link to={`/decks/`}>Decks</Link>
						</li>
						<li>
							<Link to={`/import/`}>Import a Deck</Link>
						</li>
					</ul>
				</aside>

				<main className="flex-1 p-6">
					<Outlet />
				</main>
			</div>
		</div>
	)
}

function DecksPage() {
	return (
		<>
			<div>Decks page</div>
			<DeckList />
		</>
	)
}

function DeckPage() {
	return (
		<>
			<div>Decks page</div>
			<DeckView />
		</>
	)
}

function SaltPage() {
	return <div>Salt page</div>
}

function ImportDeckPage() {
	return (
		<>
			<div>Import page</div>
		</>
	)
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Navigate to="/decks" replace />} />
					<Route path="decks" element={<DecksPage />} />
					<Route path="decks/:id" element={<DeckPage />} />
					<Route path="salt" element={<SaltPage />} />
					<Route path="import" element={<ImportDeckPage />} />
					<Route path="login" element={<AuthPage mode="login" />} />
					<Route path="signup" element={<AuthPage mode="signup" />} />
				</Route>
			</Routes>
		</BrowserRouter>
	)
}
