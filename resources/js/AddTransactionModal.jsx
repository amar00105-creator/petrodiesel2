import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, Tag, User, Users, Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTransactionModal({ isOpen, onClose, type, categories, safes, banks, suppliers = [], customers = [], baseUrl = '/PETRODIESEL2/public' }) {
    
    // Manage categories locally to avoid reloads
    const [localCategories, setLocalCategories] = useState(categories);
    
    // Sync local state if props change (though usually props won't change without parent reload)
    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    // Reset management state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsManageCategoriesOpen(false);
            setEditingId(null);
            setEditingName('');
        }
    }, [isOpen]);

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

    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const formData = new FormData();
            formData.append('name', newCategoryName);
            formData.append('type', type);
            // Even though we unified list, we should probably save with the current transaction type or 'general'
            // But since user asked to unify, maybe type doesn't matter as much, but we stuck to 'type'
            
            const res = await fetch(`${baseUrl}/finance/categories/store`, { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.success) {
                toast.success('تمت إضافة التصنيف بنجاح');
                setNewCategoryName('');
                
                // Add to local list immediately
                const newCat = data.category || { id: data.id, name: newCategoryName, type: type };
                setLocalCategories(prev => [...prev, newCat]);
                
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('حدث خطأ');
        }
    };

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const startEditing = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleUpdateCategory = async (id) => {
        if (!editingName.trim()) return;
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', editingName);
            formData.append('type', type);

            const res = await fetch(`${baseUrl}/finance/categories/update`, { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                toast.success('تم تعديل التصنيف بنجاح');
                setEditingId(null);
                setEditingName('');
                
                // Update local list
                setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, name: editingName } : c));
                
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('حدث خطأ');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('حذف هذا التصنيف؟')) return;
        try {
            const formData = new FormData();
            formData.append('id', id);
            const res = await fetch(`${baseUrl}/finance/categories/delete`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                toast.success('تم حذف التصنيف بنجاح');
                setLocalCategories(prev => prev.filter(c => c.id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error('حدث خطأ');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const form = new FormData();
            form.append('type', type);
            // If general, the 'related_entity_id' IS the category_id
            if (formData.related_entity_type === 'general') {
                form.append('category_id', formData.related_entity_id);
                form.delete('related_entity_id'); // It's not a relation, it's a category
                form.append('related_entity_type', ''); // Clear it or keep as null
            } else {
                form.append('category_id', formData.category_id); // If supplier/customer, maybe we still want a category?
                // The user said "Remove redundant category field". 
                // Currently if Supplier/Customer is selected, the Category field was HIDDEN anyway in my previous understanding? 
                // Let's re-read the code. 
                // Line 367: {formData.related_entity_type === 'general' && ( <Category Block> )}
                // So Category Block was ONLY shown for General.
                // If Type is Supplier/Customer, we typically don't categorize? 
                // Or do we? The prompt says "delete category selection, keep select item (add manage button)".
                // For General: Select Item IS the category.
                // For Supplier: Select Item is Supplier. Do we categorize?
                // The current code only showed Category dropdown if Type == General.
                // So for Supplier, category_id was empty? 
                // Let's assume for now we only care about General mapping.
            }

            Object.keys(formData).forEach(key => {
                if(key !== 'category_id' && key !== 'related_entity_type' && key !== 'related_entity_id') {
                     form.append(key, formData[key]);
                }
            });
            
            // Re-append keys we might have skipped if not handled above logic
            if (formData.related_entity_type !== 'general') {
                 form.append('related_entity_type', formData.related_entity_type);
                 form.append('related_entity_id', formData.related_entity_id);
            }

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
                        <div className="bg-white pointer-events-auto rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                            
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

                                    {/* Related Entity / Category Selection */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-bold text-slate-700">الجهة / البند <span className="text-red-500">*</span></label>
                                            
                                            {/* Show Manage Categories ONLY if General */}
                                            {formData.related_entity_type === 'general' && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsManageCategoriesOpen(!isManageCategoriesOpen)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-blue-100 shadow-sm"
                                                >
                                                    <Settings className="w-3 h-3" /> إدارة التصنيفات
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                                                <input 
                                                    type="radio" name="related_entity_type" value="general" 
                                                    checked={formData.related_entity_type === 'general'} onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">عام (بند)</span>
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

                                        {/* Manage Categories Panel */}
                                        <AnimatePresence>
                                            {isManageCategoriesOpen && formData.related_entity_type === 'general' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 mb-4">
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                placeholder="اسم التصنيف الجديد..."
                                                                className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                                                value={newCategoryName}
                                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                            />
                                                            <button 
                                                                type="button"
                                                                onClick={handleAddCategory}
                                                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                                            {localCategories.map(cat => (
                                                                <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                                    {editingId === cat.id ? (
                                                                        <div className="flex flex-1 gap-2 items-center">
                                                                            <input 
                                                                                type="text" 
                                                                                value={editingName}
                                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                                className="flex-1 p-1 text-sm border rounded outline-none focus:ring-1 focus:ring-blue-500"
                                                                                autoFocus
                                                                            />
                                                                            <button onClick={() => handleUpdateCategory(cat.id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Save className="w-3 h-3" /></button>
                                                                            <button onClick={cancelEditing} className="text-slate-400 hover:bg-slate-50 p-1 rounded"><X className="w-3 h-3" /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-sm text-slate-700 font-medium">{cat.name}</span>
                                                                            <div className="flex gap-1">
                                                                                <button 
                                                                                    type="button"
                                                                                    onClick={() => startEditing(cat)}
                                                                                    className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                                                >
                                                                                    <Edit2 className="w-3 h-3" />
                                                                                </button>
                                                                                <button 
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                                                >
                                                                                    <Trash2 className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="relative animate-in fade-in slide-in-from-top-2">
                                            <select
                                                name="related_entity_id"
                                                value={formData.related_entity_id} 
                                                onChange={handleChange}
                                                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                                                required
                                            >
                                                <option value="">
                                                    {formData.related_entity_type === 'general' ? 'اختر البند / التصنيف...' : 
                                                     formData.related_entity_type === 'supplier' ? 'اختر المورد...' : 
                                                     'اختر العميل...'}
                                                </option>
                                                
                                                {formData.related_entity_type === 'general' && localCategories.map(c => (
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
                                            <div className="absolute right-3 top-3.5 text-slate-400">
                                                {formData.related_entity_type === 'general' ? <Tag className="w-5 h-5"/> : 
                                                 formData.related_entity_type === 'supplier' ? <Users className="w-5 h-5"/> : 
                                                 <User className="w-5 h-5"/>}
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
                                    {/* Category - Only show if Type is General */}


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
