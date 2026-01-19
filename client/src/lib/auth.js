const KEY = "mtg_token"
const USER_KEY = "mtg_user"

export function getToken() {
  return localStorage.getItem(KEY)
}

export function setToken(token) {
  localStorage.setItem(KEY, token)
}

export function clearToken() {
  localStorage.removeItem(KEY)
}

export function logout() {
  clearToken()
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}
