import { getToken } from "./auth.js"

const API_BASE = import.meta.env.VITE_API_BASE || ""

export async function apiFetch(path, options = {}) {
  const token = getToken()

  const headers = {
    ...(options.headers || {})
  }

  // Only set JSON header if caller didn't set one
  if (!("Content-Type" in headers) && !("content-type" in headers)) {
    headers["Content-Type"] = "application/json"
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}
