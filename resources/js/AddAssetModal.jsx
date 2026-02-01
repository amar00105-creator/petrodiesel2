import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Vault, Landmark, Hash, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AddAssetModal({ isOpen, onClose, type }) { // type: 'safe' or 'bank'
    const [formData, setFormData] = useState({
        name: '',
        balance: '0',
        account_number: '', // For bank
        bank_name: '', // For bank display name if separate from internal name? usually just 'name' is enough.
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

    if (!isOpen) return null;
    
    return (
        <>
            {/* Backdrop */}
            <div 
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Modal Content */}
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
                <div className="bg-white pointer-events-auto rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-up">
                    
                    {/* Header */}
                    <div className={`p-6 border-b flex justify-between items-center ${isSafe ? 'bg-blue-50' : 'bg-indigo-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSafe ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {isSafe ? <Vault className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {isSafe ? 'إضافة خزينة جديدة' : 'إضافة حساب بنكي'}
                                </h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {isSafe ? 'اسم الخزينة' : 'اسم البنك / الحساب'}
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name} onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder={isSafe ? 'مثال: الخزينة الرئيسية' : 'مثال: بنك الراجحي - فرع الرياض'}
                                    required
                                />
                            </div>

                            {/* Account Number (Bank Only) */}
                            {!isSafe && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">رقم الحساب / الآيبان</label>
                                    <input
                                        type="text"
                                        name="account_number"
                                        value={formData.account_number} onChange={handleChange}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="SA000000..."
                                    />
                                </div>
                            )}

                            {/* Initial Balance */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">الرصيد الافتتاحي</label>
                                <input
                                    type="number" step="0.01"
                                    name="balance"
                                    value={formData.balance} onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            {/* Account Scope */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">نطاق الحساب</label>
                                <select
                                    name="account_scope"
                                    value={formData.account_scope}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="local">محلي - خاص بالمحطة</option>
                                    <option value="global">عام - لجميع المحطات</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    الحساب المحلي يظهر فقط للمحطة الحالية، والحساب العام يظهر لجميع المحطات
                                </p>
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
                            form="asset-form"
                            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isSafe ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                            }`}
                        >
                            <Save className="w-5 h-5" /> حفظ
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
