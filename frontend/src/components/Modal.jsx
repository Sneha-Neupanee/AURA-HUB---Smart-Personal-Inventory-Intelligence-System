import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-modal w-full max-w-md relative z-10 animate-scale-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
