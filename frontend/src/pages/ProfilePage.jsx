import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react'
import { formatDate } from '../utils/helpers'

const ProfilePage = () => {
    const { user, setUser } = useAuth()
    const [formData, setFormData] = useState({ username: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username })
        }
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await api.put('/users/me/', { username: formData.username })
            setUser(res.data)
            // update local storage
            localStorage.setItem('user', JSON.stringify(res.data))
            toast.success('Profile updated successfully')
        } catch (err) {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Profile Settings</h1>
                <p className="text-slate-400">Manage your account details and preferences.</p>
            </div>

            <div className="card overflow-hidden">
                <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-card">
                        <span className="text-3xl font-bold uppercase">{user.username.charAt(0)}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user.username}</h2>
                        <p className="text-slate-400">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                <ShieldCheck size={12} className="mr-1 inline" /> {user.role.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center">
                                <Calendar size={12} className="mr-1 inline" /> Joined {formatDate(user.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
                    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                        <div>
                            <label className="label">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label text-slate-500">Email Address (Read-only)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    className="input-field pl-10 bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                                    value={user.email}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
