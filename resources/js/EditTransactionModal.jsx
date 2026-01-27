import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
    const [formData, setFormData] = useState({
        id: '',
        amount: '',
        description: '',
        date: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setFormData({
                id: transaction.id,
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.date
            });
        }
    }, [transaction]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const form = new FormData();
            form.append('id', formData.id);
            form.append('amount', formData.amount);
            form.append('description', formData.description);
            form.append('date', formData.date);

            const response = await fetch('/PETRODIESEL2/public/finance/updateTransaction', {
                method: 'POST',
                body: form,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('تم تحديث العملية بنجاح');
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء التحديث');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg text-slate-800">تعديل العملية</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                                تنبيه: تعديل المبلغ سيؤثر تلقائياً على رصيد الخزنة أو البنك المرتبط بهذه العملية.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">وصف العملية</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-700"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">المبلغ</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-700"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">التاريخ</label>
                            <input
                                type="date"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-700"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 font-bold flex items-center gap-2"
                            >
                                {loading ? 'جاري الحفظ...' : <><Save className="w-4 h-4" /> حفظ التعديلات</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
