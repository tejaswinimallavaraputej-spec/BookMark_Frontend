import axios from 'axios'
import { getToken, clearAuth } from '../utils/auth'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://demo-deployment10-l8mp.onrender.com',
  timeout: 60000,
})

API.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export const register = (data) => API.post('/register', data)
export const login = (data) => API.post('/login', data)
export const getBookmarks = (page, size, search, onlyMine = false) =>
  API.get(`/bookmarks?page=${page}&size=${size}&search=${search || ''}&onlyMine=${onlyMine}`)
export const createBookmark = (data) => API.post('/bookmarks', data)
export const updateBookmark = (id, data) => API.put(`/bookmarks/${id}`, data)
export const deleteBookmark = (id) => API.delete(`/bookmarks/${id}`)

export default API
