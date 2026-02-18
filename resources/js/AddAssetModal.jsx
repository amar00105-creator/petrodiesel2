import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Vault, Landmark, Hash, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AddAssetModal({ isOpen, onClose, type }) { // type: 'safe' or 'bank'
    const [formData, setFormData] = useState({
        name: '',
        balance: '0',
        account_number: '', // For bank
        bank_name: '',
        account_scope: 'local' // local or global
    });

    const isSafe = type === 'safe';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const endpoint = isSafe ? '/PETRODIESEL2/public/finance/createSafe' : '/PETRODIESEL2/public/finance/createBank';

        try {
            const form = new FormData();
            Object.keys(formData).forEach(key => form.append(key, formData[key]));

            const response = await fetch(endpoint, {
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
                     toast.success(isSafe ? 'تم إضافة الخزينة بنجاح' : 'تم إضافة البنك بنجاح');
                     onClose();
                     setTimeout(() => window.location.reload(), 500);
                     return;
                 }
                 throw new Error('Invalid server response');
            }

            if (data.success) {
                toast.success(isSafe ? 'تم إضافة الخزينة بنجاح' : 'تم إضافة البنك بنجاح');
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

    // Color config
    const colors = isSafe 
        ? { gradient: 'from-blue-500 to-cyan-600', glow: 'shadow-blue-500/30', ring: 'focus:ring-blue-500/30', headerBg: 'from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10', accent: 'blue' }
        : { gradient: 'from-indigo-500 to-purple-600', glow: 'shadow-indigo-500/30', ring: 'focus:ring-indigo-500/30', headerBg: 'from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10', accent: 'indigo' };

    const inputClasses = `w-full p-3 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl outline-none 
        focus:ring-2 ${colors.ring} focus:border-transparent dark:text-white dark:placeholder-slate-500
        backdrop-blur-sm transition-all`;

    const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2";

    if (!isOpen) return null;
    
    return (
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
                <div className="bg-white/95 dark:bg-[#1e293b]/90 dark:backdrop-blur-2xl pointer-events-auto rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden flex flex-col ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
                    
                    {/* Header - Gradient */}
                    <div className={`p-6 flex justify-between items-center bg-gradient-to-r ${colors.headerBg}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.glow}`}>
                                {isSafe ? <Vault className="w-6 h-6 text-white" /> : <Landmark className="w-6 h-6 text-white" />}
                            </div>
                            <div>
                                <h2 className={`text-xl font-black ${isSafe ? 'text-blue-800 dark:text-blue-300' : 'text-indigo-800 dark:text-indigo-300'}`}>
                                    {isSafe ? 'إضافة خزينة جديدة' : 'إضافة حساب بنكي'}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Name */}
                            <div>
                                <label className={labelClasses}>
                                    {isSafe ? 'اسم الخزينة' : 'اسم البنك / الحساب'}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name} onChange={handleChange}
                                    className={inputClasses}
                                    placeholder={isSafe ? 'مثال: الخزينة الرئيسية' : 'مثال: بنك الراجحي - فرع الرياض'}
                                    required
                                />
                            </div>

                            {/* Account Number (Bank Only) */}
                            {!isSafe && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label className={labelClasses}>رقم الحساب / الآيبان</label>
                                    <input
                                        type="text"
                                        name="account_number"
                                        value={formData.account_number} onChange={handleChange}
                                        className={inputClasses + ' font-mono'}
                                        placeholder="SA000000..."
                                    />
                                </motion.div>
                            )}

                            {/* Initial Balance */}
                            <div>
                                <label className={labelClasses}>الرصيد الافتتاحي</label>
                                <input
                                    type="number" step="0.01"
                                    name="balance"
                                    value={formData.balance} onChange={handleChange}
                                    className={inputClasses + ' font-mono text-lg font-bold'}
                                    required
                                />
                            </div>

                            {/* Account Scope */}
                            <div>
                                <label className={labelClasses}>نطاق الحساب</label>
                                <select
                                    name="account_scope"
                                    value={formData.account_scope}
                                    onChange={handleChange}
                                    className={inputClasses}
                                >
                                    <option value="local" className="dark:bg-slate-800">محلي - خاص بالمحطة</option>
                                    <option value="global" className="dark:bg-slate-800">عام - لجميع المحطات</option>
                                </select>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                    الحساب المحلي يظهر فقط للمحطة الحالية، والحساب العام يظهر لجميع المحطات
                                </p>
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
                            form="asset-form"
                            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold shadow-lg ${colors.glow} hover:-translate-y-0.5 hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${colors.gradient}`}
                        >
                            <Save className="w-5 h-5" /> حفظ
                        </button>
                    </div>

                </div>
            </motion.div>
        </>
    );
}
