import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, Tag, User, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTransactionModal({ isOpen, onClose, type, categories, safes, banks, suppliers = [], customers = [], baseUrl = '/PETRODIESEL2/public' }) {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category_id: '',
        account_type: 'safe',
        account_id: '',
        related_entity_type: 'general', // Default to general
        related_entity_id: '',
        reference_number: '',
        date: new Date().toISOString().split('T')[0]
    });

    const isIncome = type === 'income';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const form = new FormData();
            form.append('type', type);
            // If general, we might want to ensure standard handling
            Object.keys(formData).forEach(key => form.append(key, formData[key]));

            const response = await fetch(`${baseUrl}/finance/storeTransaction`, {
                method: 'POST',
                body: form,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            // Check if response is valid JSON
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                 // Fallback if controller returns redirect/html
                 if (response.redirected || response.status === 200) {
                     toast.success(isIncome ? 'تم تسجيل الإيراد بنجاح' : 'تم تسجيل المصروف بنجاح');
                     setTimeout(() => window.location.reload(), 500);
                     return;
                 }
                 throw new Error('Invalid server response');
            }

            if (data.success) {
                toast.success(isIncome ? 'تم تسجيل الإيراد بنجاح' : 'تم تسجيل المصروف بنجاح');
                onClose();
                setTimeout(() => window.location.reload(), 500); // Reload to update dashboard
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

                    {/* Centered Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            
                            {/* Header */}
                            <div className={`p-6 border-b flex justify-between items-center ${isIncome ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                <div>
                                    <h2 className={`text-xl font-bold ${isIncome ? 'text-emerald-800' : 'text-rose-800'}`}>
                                        {isIncome ? 'تسجيل إيراد جديد' : 'تسجيل مصروف جديد'}
                                    </h2>
                                    <p className={`text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>أدخل تفاصيل العملية المالية</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <form id="transaction-form" onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ</label>
                                        <div className="relative">
                                            <input
                                                type="number" step="0.01"
                                                name="amount"
                                                value={formData.amount} onChange={handleChange}
                                                className="w-full pl-4 pr-10 py-3 text-lg font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                                placeholder="0.00"
                                                required
                                            />
                                            <div className="absolute right-3 top-3.5 text-slate-400">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Relation Selection */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                        <label className="block text-sm font-bold text-slate-700">الجهة المرتبطة <span className="text-red-500">*</span></label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                                <input 
                                                    type="radio" name="related_entity_type" value="general" 
                                                    checked={formData.related_entity_type === 'general'} onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">عام</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                                <input 
                                                    type="radio" name="related_entity_type" value="supplier" 
                                                    checked={formData.related_entity_type === 'supplier'} onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">مورد</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                                <input 
                                                    type="radio" name="related_entity_type" value="customer" 
                                                    checked={formData.related_entity_type === 'customer'} onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">عميل</span>
                                            </label>
                                        </div>

                                        <div className="relative animate-in fade-in slide-in-from-top-2">
                                            <select
                                                name="related_entity_id"
                                                value={formData.related_entity_id} 
                                                onChange={handleChange}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                                                required
                                            >
                                                <option value="">
                                                    {formData.related_entity_type === 'general' ? 'اختر بند المصروف...' : 
                                                     formData.related_entity_type === 'supplier' ? 'اختر المورد...' : 
                                                     'اختر العميل...'}
                                                </option>
                                                
                                                {formData.related_entity_type === 'general' && categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}

                                                {formData.related_entity_type === 'supplier' && (
                                                    (Array.isArray(suppliers) && suppliers.length > 0) ? (
                                                        suppliers.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>لا يوجد موردين مسجلين</option>
                                                    )
                                                )}

                                                {formData.related_entity_type === 'customer' && (
                                                    (Array.isArray(customers) && customers.length > 0) ? (
                                                        customers.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>لا يوجد عملاء مسجلين</option>
                                                    )
                                                )}
                                            </select>
                                            <div className="absolute right-3 top-3 text-slate-400">
                                                {formData.related_entity_type === 'general' ? <Tag className="w-4 h-4"/> : 
                                                 formData.related_entity_type === 'supplier' ? <Users className="w-4 h-4"/> : 
                                                 <User className="w-4 h-4"/>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">نوع الحساب</label>
                                            <select
                                                name="account_type"
                                                value={formData.account_type} onChange={handleChange}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="safe">خزنة نقدية</option>
                                                <option value="bank">حساب بنكي</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">اختر الحساب</label>
                                            <select
                                                name="account_id"
                                                value={formData.account_id} onChange={handleChange}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                                required
                                            >
                                                <option value="">-- اختر --</option>
                                                {(formData.account_type === 'safe' ? safes : banks).map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bank Reference Number - Optional, only for Bank Account */}
                                    {formData.account_type === 'bank' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-50/50 p-3 rounded-xl border border-blue-100"
                                        >
                                            <label className="block text-xs font-bold text-blue-700 mb-2">رقم العملية (اختياري)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="reference_number"
                                                    value={formData.reference_number}
                                                    onChange={handleChange}
                                                    className="w-full pl-4 pr-10 py-2 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm"
                                                    placeholder="أدخل رقم التحويل أو الشيك..."
                                                />
                                                <div className="absolute right-3 top-2.5 text-blue-400">
                                                    <Tag className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Category - Only show if Type is General */}
                                    {/* If Supplier/Customer, we assume the 'Related Entity ID' is effectively the category/payee logic */}
                                    {formData.related_entity_type === 'general' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">التصنيف</label>
                                        <div className="relative">
                                            <select
                                                name="category_id"
                                                value={formData.category_id} onChange={handleChange}
                                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                                required
                                            >
                                                <option value="">اختر تصنيف العملية...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-3.5 text-slate-400">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">الوصف / البيان</label>
                                        <textarea
                                            name="description"
                                            value={formData.description} onChange={handleChange}
                                            rows="3"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="اكتب تفاصيل العملية هنا..."
                                            required
                                        ></textarea>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t bg-slate-50 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    form="transaction-form"
                                    className={`flex-1 px-6 py-3 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${
                                        isIncome ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-rose-500 to-rose-600'
                                    }`}
                                >
                                    <Save className="w-5 h-5" /> حفظ العملية
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
