import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/auth" replace />
}

export default ProtectedRoute
