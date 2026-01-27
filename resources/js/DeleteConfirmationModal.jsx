import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isDeleting }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-200">
                            
                            {/* Header / Icon */}
                            <div className="bg-red-50 p-6 flex justify-center items-center flex-col border-b border-red-100">
                                <motion.div 
                                    initial={{ scale: 0.8, rotate: -10 }}
                                    animate={{ scale: 1.1, rotate: 0 }}
                                    transition={{ 
                                        type: "spring", 
                                        stiffness: 260, 
                                        damping: 20,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        repeatDelay: 2
                                    }}
                                    className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner"
                                >
                                    <Trash2 className="w-10 h-10" />
                                </motion.div>
                                <h3 className="text-xl font-black text-red-900 font-cairo text-center">
                                    {title || 'تأكيد الحذف'}
                                </h3>
                            </div>

                            {/* Body */}
                            <div className="p-6 text-center">
                                <p className="text-slate-600 font-medium text-lg leading-relaxed">
                                    {message || 'هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.'}
                                </p>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                                >
                                    إلغاء الأمر
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            جاري الحذف...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            نعم، احذف
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
