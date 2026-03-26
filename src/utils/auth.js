const TOKEN_KEY = 'bm_token'
const USER_KEY = 'bm_user'
const EXPIRY_KEY = 'bm_expiry'

export const setAuth = (token, user) => {
  const expiry = Date.now() + 2 * 60 * 60 * 1000
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(EXPIRY_KEY, expiry.toString())
}

export const getToken = () => {
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (expiry && Date.now() > parseInt(expiry)) {
    clearAuth()
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

export const isAuthenticated = () => !!getToken()
