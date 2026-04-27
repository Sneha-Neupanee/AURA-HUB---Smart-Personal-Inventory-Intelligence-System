import axios from 'axios'

// Creates an Axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401s and Refresh Token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            const refreshToken = localStorage.getItem('refresh')

            if (refreshToken) {
                try {
                    const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    })

                    const { access } = response.data
                    localStorage.setItem('access', access)

                    originalRequest.headers.Authorization = `Bearer ${access}`
                    return api(originalRequest)
                } catch (refreshError) {
                    // Refresh token failed -> clear all and logout
                    localStorage.removeItem('access')
                    localStorage.removeItem('refresh')
                    localStorage.removeItem('user')
                    window.location.href = '/'
                    return Promise.reject(refreshError)
                }
            }
        }
        return Promise.reject(error)
    }
)

export default api
