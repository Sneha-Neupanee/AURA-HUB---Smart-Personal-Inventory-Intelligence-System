import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Package, ArrowRight, Activity, ShieldBox } from 'lucide-react'
import toast from 'react-hot-toast'

const LandingPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' })

    const { login, register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isLogin) {
                await login(formData.email, formData.password)
                toast.success('Welcome back!')
            } else {
                await register(formData.username, formData.email, formData.password, formData.password2)
                toast.success('Account created successfully!')
            }
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left side — Marketing */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-brand-900 to-slate-950 border-r border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                            <Package size={18} className="text-white" />
                        </div>
                        AURA HUB
                    </h1>
                    <div className="mt-24 space-y-6 max-w-lg">
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Smart Personal Inventory <br /> Intelligence System.
                        </h2>
                        <p className="text-lg text-slate-300">
                            Manage, track, and gain insights from your personal assets with a powerful, modern platform designed for clarity.
                        </p>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl bg-slate-900/50 backdrop-blur border border-slate-800">
                            <Activity className="text-brand-400 mb-3" size={24} />
                            <h3 className="text-white font-semibold mb-1">Audit Trail</h3>
                            <p className="text-sm text-slate-400">Append-only activity logs for every action.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/50 backdrop-blur border border-slate-800">
                            <ShieldBox className="text-brand-400 mb-3" size={24} />
                            <h3 className="text-white font-semibold mb-1">Secure & Isolated</h3>
                            <p className="text-sm text-slate-400">Your data is strictly scoped to your account.</p>
                        </div>
                    </div>
                </div>
                <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Aura Hub. All rights reserved.</p>
            </div>

            {/* Right side — Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 relative">
                <div className="w-full max-w-md animate-slide-in">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-slate-400 mt-2">
                            {isLogin ? 'Enter your details to access your dashboard' : 'Start managing your inventory today'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                        {!isLogin && (
                            <div>
                                <label className="label">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        )}
                        <div>
                            <label className="label">Email address</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        {!isLogin && (
                            <div>
                                <label className="label">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={formData.password2}
                                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                                />
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6 py-2.5">
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setFormData({ username: '', email: '', password: '', password2: '' })
                            }}
                            className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
