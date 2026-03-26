import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://bookmark-backend-uuch.onrender.com',
  timeout: 10000,
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('bm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bm_token')
      localStorage.removeItem('bm_user')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export const register = (data) => API.post('/register', data)
export const login = (data) => API.post('/login', data)
export const getBookmarks = (page = 0, size = 10, search = '') => 
  API.get('/bookmarks', { params: { page, size, search } })
export const createBookmark = (data) => API.post('/bookmarks', data)
export const updateBookmark = (id, data) => API.put(`/bookmarks/${id}`, data)
export const deleteBookmark = (id) => API.delete(`/bookmarks/${id}`)

export default API
