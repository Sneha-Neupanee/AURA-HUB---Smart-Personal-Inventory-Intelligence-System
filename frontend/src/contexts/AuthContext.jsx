import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in on mount
        const checkUser = async () => {
            const token = localStorage.getItem('access')
            const storedUser = localStorage.getItem('user')
            if (token && storedUser) {
                try {
                    // Optionally fetch fresh profile data here, or use stored
                    setUser(JSON.parse(storedUser))
                } catch (e) {
                    console.error("Failed to parse user", e)
                }
            }
            setLoading(false)
        }
        checkUser()
    }, [])

    const login = async (email, password) => {
        const response = await api.post('/auth/login/', { email, password })
        const { access, refresh, user: userData } = response.data

        localStorage.setItem('access', access)
        localStorage.setItem('refresh', refresh)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        return userData
    }

    const register = async (username, email, password, password2) => {
        const response = await api.post('/auth/register/', { username, email, password, password2 })
        const { access, refresh, user: userData } = response.data

        localStorage.setItem('access', access)
        localStorage.setItem('refresh', refresh)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        return userData
    }

    const logout = async () => {
        const refresh = localStorage.getItem('refresh')
        if (refresh) {
            try {
                await api.post('/auth/logout/', { refresh })
            } catch (err) {
                console.error('Logout failed on server', err)
            }
        }
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('user')
        setUser(null)
    }

    const value = {
        user,
        setUser,
        login,
        register,
        logout,
        loading
    }

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
