import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowRightLeft, Vault, Landmark } from 'lucide-react';
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                            
                            {/* Header */}
                            <div className="p-6 border-b flex justify-between items-center bg-blue-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                        <ArrowRightLeft className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">تحويل رصيد</h2>
                                        <p className="text-sm text-blue-600">نقل الأموال بين الحسابات</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                <form id="transfer-form" onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ المراد تحويله</label>
                                        <input
                                            type="number" step="0.01"
                                            name="amount"
                                            value={formData.amount} onChange={handleChange}
                                            className="w-full text-center p-4 text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    {/* Transfer Path */}
                                    <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                                        
                                        {/* From */}
                                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                                            <div className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-1">
                                                <ArrowRightLeft className="w-3 h-3 rotate-180" /> من حساب
                                            </div>
                                            <div className="space-y-2">
                                                <select
                                                    name="from_type"
                                                    value={formData.from_type} onChange={handleChange}
                                                    className="w-full p-2 bg-white text-sm border-none rounded-lg shadow-sm outline-none"
                                                >
                                                    <option value="safe">خزينة</option>
                                                    <option value="bank">بنك</option>
                                                </select>
                                                <select
                                                    name="from_id"
                                                    value={formData.from_id} onChange={handleChange}
                                                    className="w-full p-2 bg-white text-sm border-none rounded-lg shadow-sm outline-none"
                                                    required
                                                >
                                                    <option value="">-- اختر --</option>
                                                    {(formData.from_type === 'safe' ? safes : banks).map(acc => (
                                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <ArrowRightLeft className="w-5 h-5 text-slate-300" />

                                        {/* To */}
                                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                            <div className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1">
                                                <ArrowRightLeft className="w-3 h-3" /> إلى حساب
                                            </div>
                                            <div className="space-y-2">
                                                <select
                                                    name="to_type"
                                                    value={formData.to_type} onChange={handleChange}
                                                    className="w-full p-2 bg-white text-sm border-none rounded-lg shadow-sm outline-none"
                                                >
                                                    <option value="safe">خزينة</option>
                                                    <option value="bank">بنك</option>
                                                </select>
                                                <select
                                                    name="to_id"
                                                    value={formData.to_id} onChange={handleChange}
                                                    className="w-full p-2 bg-white text-sm border-none rounded-lg shadow-sm outline-none"
                                                    required
                                                >
                                                    <option value="">-- اختر --</option>
                                                    {(formData.to_type === 'safe' ? safes : banks).map(acc => (
                                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات التحويل</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description} onChange={handleChange}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="سبب التحويل..."
                                        />
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t bg-slate-50 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    form="transfer-form"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
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
