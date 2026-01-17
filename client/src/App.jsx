import React from "react"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { DeckOverview } from "./components/DeckOverview.jsx"
import { DeckList } from "./components/DeckList.jsx"

function Layout() {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <div className="mx-auto flex max-w-6xl">
        <aside className="w-60 border-r border-slate-800 p-4">
          <div className="text-lg font-semibold">MTG Tracker </div>
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
  {/* <DeckOverview /> */}
  </>
  )

}

function SaltPage() {
  return <div>Salt page</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/decks" replace />} />
          <Route path="decks" element={<DecksPage />} />
          <Route path="salt" element={<SaltPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
