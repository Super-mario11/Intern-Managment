
import React from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import InternListPage from './pages/InternListPage'

const linkBase =
  'text-sm font-semibold px-3 py-2 rounded-full border transition'
const inactive =
  `${linkBase} border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 bg-white`
const active = `${linkBase} border-indigo-600 text-indigo-600 bg-indigo-50`

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-white/80 backdrop-blur border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-zinc-900">
              Internship Portal
            </div>
            <div className="text-xs text-zinc-500">
              Admin controls and intern directory
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              Admin
            </NavLink>
            <NavLink
              to="/interns"
              className={({ isActive }) => (isActive ? active : inactive)}
            >
              Interns
            </NavLink>
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<InternListPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/interns" element={<InternListPage />} />
      </Routes>
    </BrowserRouter>
  )
}
