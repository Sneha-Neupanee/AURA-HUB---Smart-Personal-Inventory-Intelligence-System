import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ItemsPage from './pages/ItemsPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return null
    if (!user) return <Navigate to="/" replace />
    return <Layout>{children}</Layout>
}

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return null
    if (user) return <Navigate to="/dashboard" replace />
    return children
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
