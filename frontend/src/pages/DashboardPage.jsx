import { useState, useEffect } from 'react'
import api from '../api/axios'
import { Package, Archive, CheckCircle, Activity } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const StatCard = ({ title, value, icon, gradient }) => (
    <div className="card-hover p-6 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${gradient}`}>
            {icon}
        </div>
        <h3 className="text-slate-400 font-medium text-sm mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
)

const DashboardPage = () => {
    const [data, setData] = useState({
        total_items: 0,
        active_items: 0,
        archived_items: 0,
        recent_activities: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await api.get('/dashboard/summary/')
                setData(response.data)
            } catch (error) {
                toast.error('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchSummary()
    }, [])

    if (loading) return <div className="text-slate-400 animate-pulse">Loading dashboard...</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Overview</h1>
                <p className="text-slate-400">Here's what's happening with your inventory today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Items"
                    value={data.total_items}
                    icon={<Package size={120} className="-mt-4 -mr-4 text-brand-500" />}
                />
                <StatCard
                    title="Active Items"
                    value={data.active_items}
                    icon={<CheckCircle size={120} className="-mt-4 -mr-4 text-emerald-500" />}
                />
                <StatCard
                    title="Archived"
                    value={data.archived_items}
                    icon={<Archive size={120} className="-mt-4 -mr-4 text-amber-500" />}
                />
            </div>

            {/* Recent Activity Feed */}
            <div className="card p-0 mt-8">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity size={20} className="text-brand-500" />
                        Recent Activity
                    </h2>
                </div>
                <div className="p-6">
                    {data.recent_activities.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No recent activity found.</p>
                    ) : (
                        <div className="space-y-6 shrink-0 relative
              before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">

                            {data.recent_activities.map((activity, idx) => (
                                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    {/* Timeline icon dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <div className={`w-2 h-2 rounded-full ${activity.action_type === 'CREATED_ITEM' ? 'bg-emerald-500' :
                                            activity.action_type === 'DELETED_ITEM' ? 'bg-rose-500' :
                                                activity.action_type === 'ARCHIVED_ITEM' ? 'bg-amber-500' : 'bg-brand-500'
                                            }`} />
                                    </div>

                                    {/* Content box */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900/50 shadow-sm ml-4 md:ml-0 md:mr-0 group-hover:border-slate-700 transition">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-slate-200">{activity.action_type.replace('_', ' ')}</span>
                                            <time className="text-xs text-slate-500">{formatDate(activity.timestamp)}</time>
                                        </div>
                                        {activity.item_name && (
                                            <p className="text-sm text-slate-400 truncate">
                                                Item: <span className="text-slate-300 font-medium">{activity.item_name}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
