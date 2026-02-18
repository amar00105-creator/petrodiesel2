import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowRightLeft, Vault, Landmark, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function TransferModal({ isOpen, onClose, safes, banks }) {
    const [formData, setFormData] = useState({
        amount: '',
        from_type: 'safe',
        from_id: '',
        to_type: 'bank',
        to_id: '',
        description: 'تحويل مالي'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const form = new FormData();
            Object.keys(formData).forEach(key => form.append(key, formData[key]));

            const response = await fetch('/PETRODIESEL2/public/finance/transfer', {
                method: 'POST',
                body: form,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                 if (response.redirected || response.status === 200) {
                     toast.success('تم التحويل بنجاح');
                     onClose();
                     setTimeout(() => window.location.reload(), 500);
                     return;
                 }
                 throw new Error('Invalid server response');
            }

            if (data.success) {
                toast.success('تم التحويل بنجاح');
                onClose();
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message || 'حدث خطأ ما');
            }

        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال بالخادم');
        }
    };

    const selectClasses = "w-full p-2.5 bg-white/80 dark:bg-white/10 text-sm border border-white/10 dark:border-white/[0.06] rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/30 dark:text-white backdrop-blur-sm transition-all";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white/95 dark:bg-[#1e293b]/90 dark:backdrop-blur-2xl pointer-events-auto rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-lg overflow-hidden flex flex-col ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
                            
                            {/* Header - Gradient */}
                            <div className="p-6 flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
                                        <ArrowRightLeft className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-orange-800 dark:text-orange-300">تحويل رصيد</h2>
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400/70">نقل الأموال بين الحسابات</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                <form id="transfer-form" onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المبلغ المراد تحويله</label>
                                        <input
                                            type="number" step="0.01"
                                            name="amount"
                                            value={formData.amount} onChange={handleChange}
                                            className="w-full text-center p-4 text-2xl font-black bg-white/80 dark:bg-white/5 border-2 border-orange-200/50 dark:border-orange-500/20 rounded-xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/60 dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    {/* Transfer Path */}
                                    <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-center">
                                        
                                        {/* From */}
                                        <div className="bg-rose-50/80 dark:bg-rose-500/5 p-4 rounded-xl ring-1 ring-rose-200/30 dark:ring-rose-500/10 backdrop-blur-sm">
                                            <div className="text-xs font-black text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                                                    <ArrowRightLeft className="w-3 h-3 text-white rotate-180" />
                                                </div>
                                                من حساب
                                            </div>
                                            <div className="space-y-2">
                                                <select
                                                    name="from_type"
                                                    value={formData.from_type} onChange={handleChange}
                                                    className={selectClasses}
                                                >
                                                    <option value="safe" className="dark:bg-slate-800">خزينة</option>
                                                    <option value="bank" className="dark:bg-slate-800">بنك</option>
                                                </select>
                                                <select
                                                    name="from_id"
                                                    value={formData.from_id} onChange={handleChange}
                                                    className={selectClasses}
                                                    required
                                                >
                                                    <option value="" className="dark:bg-slate-800">-- اختر --</option>
                                                    {(formData.from_type === 'safe' ? safes : banks).map(acc => (
                                                        <option key={acc.id} value={acc.id} className="dark:bg-slate-800">{acc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                                <ArrowDown className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        {/* To */}
                                        <div className="bg-emerald-50/80 dark:bg-emerald-500/5 p-4 rounded-xl ring-1 ring-emerald-200/30 dark:ring-emerald-500/10 backdrop-blur-sm">
                                            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
                                                    <ArrowRightLeft className="w-3 h-3 text-white" />
                                                </div>
                                                إلى حساب
                                            </div>
                                            <div className="space-y-2">
                                                <select
                                                    name="to_type"
                                                    value={formData.to_type} onChange={handleChange}
                                                    className={selectClasses}
                                                >
                                                    <option value="safe" className="dark:bg-slate-800">خزينة</option>
                                                    <option value="bank" className="dark:bg-slate-800">بنك</option>
                                                </select>
                                                <select
                                                    name="to_id"
                                                    value={formData.to_id} onChange={handleChange}
                                                    className={selectClasses}
                                                    required
                                                >
                                                    <option value="" className="dark:bg-slate-800">-- اختر --</option>
                                                    {(formData.to_type === 'safe' ? safes : banks).map(acc => (
                                                        <option key={acc.id} value={acc.id} className="dark:bg-slate-800">{acc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ملاحظات التحويل</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description} onChange={handleChange}
                                            className="w-full p-3 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-transparent dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                            placeholder="سبب التحويل..."
                                        />
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-5 bg-slate-50/80 dark:bg-white/5 flex gap-3 backdrop-blur-sm">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 bg-white/80 dark:bg-white/10 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-white/15 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    form="transfer-form"
                                    className="flex-1 px-4 py-2.5 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600"
                                >
                                    <Save className="w-5 h-5" /> إتمام التحويل
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
