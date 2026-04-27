import { useAuth } from '../contexts/AuthContext'
import { User } from 'lucide-react'

const Topbar = () => {
    const { user } = useAuth()

    return (
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-end px-8 sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-200">{user?.username || 'User'}</p>
                    <p className="text-xs text-slate-400">{user?.role || 'user'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-card">
                    <User size={20} />
                </div>
            </div>
        </header>
    )
}

export default Topbar
