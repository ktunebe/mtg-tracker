export function getToken() {
  return localStorage.getItem("mtg_token")
}

export function setToken(token) {
  localStorage.setItem("mtg_token", token)
}

export function clearToken() {
  localStorage.removeItem("mtg_token")
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}
