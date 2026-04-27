import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = () => {
    const { logout } = useAuth()

    const links = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/items', icon: <Package size={20} />, label: 'Inventory' },
        { to: '/profile', icon: <User size={20} />, label: 'Profile' },
    ]

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                        <Package size={18} className="text-white" />
                    </div>
                    AURA HUB
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
