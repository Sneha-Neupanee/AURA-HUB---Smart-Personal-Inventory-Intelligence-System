import { useState, useEffect } from 'react'
import api from '../api/axios'
import { Plus, Search, Edit2, Trash2, PackageSearch } from 'lucide-react'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../utils/helpers'

const ItemsPage = () => {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({ name: '', category: '', description: '', value: '', status: 'active' })

    const fetchItems = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/items/?search=${search}`)
            setItems(res.data.results || [])
        } catch (err) {
            toast.error('Failed to fetch items')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchItems()
        }, 300)
        return () => clearTimeout(delayDebounceFn)
    }, [search])

    const handleOpenModal = (item = null) => {
        if (item) {
            // Full fetch for edit
            api.get(`/items/${item.id}/`).then(res => {
                setFormData({
                    name: res.data.name,
                    category: res.data.category,
                    description: res.data.description,
                    value: res.data.value || '',
                    status: res.data.status
                })
                setEditingItem(res.data)
                setIsModalOpen(true)
            })
        } else {
            setFormData({ name: '', category: '', description: '', value: '', status: 'active' })
            setEditingItem(null)
            setIsModalOpen(true)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingItem) {
                await api.put(`/items/${editingItem.id}/`, formData)
                toast.success('Item updated')
            } else {
                await api.post('/items/', formData)
                toast.success('Item created')
            }
            setIsModalOpen(false)
            fetchItems()
        } catch (err) {
            toast.error('Failed to save item')
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/items/${id}/`)
                toast.success('Item deleted')
                fetchItems()
            } catch (err) {
                toast.error('Failed to delete item')
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventory Items</h1>
                    <p className="text-slate-400">Manage your assets, track categories and values.</p>
                </div>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Add New Item
                </button>
            </div>

            <div className="card p-0 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search items by name or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading items...</div>
                    ) : items.length === 0 ? (
                        <div className="p-16 flex flex-col items-center justify-center text-slate-500">
                            <PackageSearch size={48} className="text-slate-700 mb-4" />
                            <p>No items found.</p>
                            <button className="text-brand-400 text-sm mt-2 hover:underline" onClick={() => handleOpenModal()}>
                                Create your first item
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Value</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Added</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-200">{item.name}</td>
                                        <td className="px-6 py-4 text-slate-400">{item.category}</td>
                                        <td className="px-6 py-4 text-slate-300 font-mono">{formatCurrency(item.value)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge-${item.status}`}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{formatDate(item.created_at)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-400 hover:text-brand-400 bg-slate-800 rounded">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Item' : 'Add New Item'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Item Name</label>
                        <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Category</label>
                            <input required type="text" className="input-field" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Estimated Value ($)</label>
                            <input type="number" step="0.01" className="input-field" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Description (Optional)</label>
                        <textarea className="input-field min-h-[100px] resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">{editingItem ? 'Save Changes' : 'Create Item'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ItemsPage
