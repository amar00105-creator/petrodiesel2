import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, Tag, User, Users, Settings, Plus, Trash2, Edit2, CheckCircle, AlertCircle, Layers, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTransactionModal({ isOpen, onClose, type, categories, safes, banks, suppliers = [], customers = [], baseUrl = '/PETRODIESEL2/public' }) {
    
    // Manage categories locally to avoid reloads
    const [localCategories, setLocalCategories] = useState(categories);
    
    // Sync local state if props change
    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    // Reset management state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsManageCategoriesOpen(false);
            setEditingId(null);
            setEditingName('');
            setDuplicateWarning('');
        }
    }, [isOpen]);

    const initialFormData = {
        amount: '',
        description: '',
        category_id: '',
        account_type: 'safe',
        account_id: '',
        related_entity_type: 'general',
        related_entity_id: '',
        reference_number: '',
        date: new Date().toISOString().split('T')[0]
    };
    const [formData, setFormData] = useState(initialFormData);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    const isIncome = type === 'income';

    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [duplicateWarning, setDuplicateWarning] = useState('');
    const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
    const newCatInputRef = useRef(null);

    // Check for duplicate when typing new category name
    const checkDuplicate = (name) => {
        setNewCategoryName(name);
        if (name.trim()) {
            const exists = localCategories.some(c => 
                c.name.trim().toLowerCase() === name.trim().toLowerCase()
            );
            setDuplicateWarning(exists ? 'هذا التصنيف موجود بالفعل' : '');
        } else {
            setDuplicateWarning('');
        }
    };

    const handleAddCategory = async () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) return;
        
        // Client-side duplicate check
        const exists = localCategories.some(c => 
            c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) {
            setDuplicateWarning('هذا التصنيف موجود بالفعل');
            return;
        }

        setIsSubmittingCategory(true);
        try {
            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('type', type);
            
            const res = await fetch(`${baseUrl}/finance/categories/store`, { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.success) {
                toast.success('تمت إضافة التصنيف بنجاح');
                setNewCategoryName('');
                setDuplicateWarning('');
                
                const newCat = data.category || { id: data.id, name: trimmedName, type: type };
                setLocalCategories(prev => [...prev, newCat]);
                
            } else {
                if (data.duplicate) {
                    setDuplicateWarning(data.message);
                } else {
                    toast.error(data.message || 'حدث خطأ');
                }
            }
        } catch (e) {
            toast.error('حدث خطأ في الاتصال');
        } finally {
            setIsSubmittingCategory(false);
        }
    };

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [editDuplicateWarning, setEditDuplicateWarning] = useState('');

    const startEditing = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
        setEditDuplicateWarning('');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingName('');
        setEditDuplicateWarning('');
    };

    const checkEditDuplicate = (name) => {
        setEditingName(name);
        if (name.trim()) {
            const exists = localCategories.some(c => 
                c.id !== editingId && c.name.trim().toLowerCase() === name.trim().toLowerCase()
            );
            setEditDuplicateWarning(exists ? 'هذا التصنيف موجود بالفعل' : '');
        } else {
            setEditDuplicateWarning('');
        }
    };

    const handleUpdateCategory = async (id) => {
        const trimmedName = editingName.trim();
        if (!trimmedName) return;
        
        // Client-side duplicate check
        const exists = localCategories.some(c => 
            c.id !== id && c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) {
            setEditDuplicateWarning('هذا التصنيف موجود بالفعل');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('name', trimmedName);
            formData.append('type', type);

            const res = await fetch(`${baseUrl}/finance/categories/update`, { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                toast.success('تم تعديل التصنيف بنجاح');
                setEditingId(null);
                setEditingName('');
                setEditDuplicateWarning('');
                setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, name: trimmedName } : c));
            } else {
                if (data.duplicate) {
                    setEditDuplicateWarning(data.message);
                } else {
                    toast.error(data.message || 'حدث خطأ');
                }
            }
        } catch (e) {
            toast.error('حدث خطأ في الاتصال');
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
                toast.error(data.message || 'فشل حذف التصنيف');
            }
        } catch (e) {
            console.error(e);
            toast.error('حدث خطأ في الاتصال');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        if (hasSaved) {
            window.location.reload();
        } else {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const form = new FormData();
            form.append('type', type);
            if (formData.related_entity_type === 'general') {
                form.append('category_id', formData.related_entity_id);
                form.delete('related_entity_id');
                form.append('related_entity_type', '');
            } else {
                form.append('category_id', formData.category_id);
            }

            Object.keys(formData).forEach(key => {
                if(key !== 'category_id' && key !== 'related_entity_type' && key !== 'related_entity_id') {
                     form.append(key, formData[key]);
                }
            });
            
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
            
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                 if (response.redirected || response.status === 200) {
                     setHasSaved(true);
                     setShowSuccess(true);
                     setFormData({ ...initialFormData, date: new Date().toISOString().split('T')[0] });
                     setTimeout(() => setShowSuccess(false), 2000);
                     return;
                 }
                 throw new Error('Invalid server response');
            }

            if (data.success) {
                setHasSaved(true);
                setShowSuccess(true);
                setFormData({ ...initialFormData, date: new Date().toISOString().split('T')[0] });
                setTimeout(() => setShowSuccess(false), 2000);
            } else {
                toast.error(data.message || 'حدث خطأ ما');
            }

        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال بالخادم');
        }
    };

    // Color scheme based on type
    const colors = isIncome 
        ? { accent: 'emerald', gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30', ring: 'focus:ring-emerald-500/30', border: 'border-emerald-500/30', main: '#10b981', mainLight: '#d1fae5', mainDark: '#065f46' }
        : { accent: 'rose', gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/30', ring: 'focus:ring-rose-500/30', border: 'border-rose-500/30', main: '#f43f5e', mainLight: '#ffe4e6', mainDark: '#9f1239' };

    // Shared input classes for dark mode glassmorphism
    const inputClasses = `w-full p-3 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl outline-none 
        focus:ring-2 ${colors.ring} focus:border-transparent dark:text-white dark:placeholder-slate-500
        backdrop-blur-sm transition-all`;

    const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2";

    // Filter categories by type
    const filteredCategories = localCategories.filter(c => !c.type || c.type === type);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50"
                    />

                    {/* Centered Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative bg-white/95 dark:bg-[#1e293b]/90 dark:backdrop-blur-2xl pointer-events-auto rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
                            
                            {/* Header */}
                            <div className={`p-5 flex justify-between items-center 
                                ${isIncome ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10' : 'bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.glow}`}>
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-black ${isIncome ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                                            {isIncome ? 'تسجيل إيراد جديد' : 'تسجيل مصروف جديد'}
                                        </h2>
                                        <p className={`text-sm font-medium ${isIncome ? 'text-emerald-600 dark:text-emerald-400/70' : 'text-rose-600 dark:text-rose-400/70'}`}>أدخل تفاصيل العملية المالية</p>
                                    </div>
                                </div>
                                <button onClick={handleClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                <form id="transaction-form" onSubmit={handleSubmit} className="space-y-5">
                                    
                                    {/* Row: Amount + Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>المبلغ <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="number" step="0.01"
                                                    name="amount"
                                                    value={formData.amount} onChange={handleChange}
                                                    className={`w-full pl-4 pr-10 py-3 text-lg font-bold bg-white/80 dark:bg-white/5 border-2 ${isIncome ? 'border-emerald-200/50 dark:border-emerald-500/20 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10' : 'border-rose-200/50 dark:border-rose-500/20 focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10'} rounded-xl transition-all outline-none dark:text-white dark:placeholder-slate-500 backdrop-blur-sm`}
                                                    placeholder="0.00"
                                                    required
                                                />
                                                <div className={`absolute right-3 top-3.5 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>التاريخ</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date} onChange={handleChange}
                                                    className={inputClasses}
                                                />
                                                <div className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Related Entity / Category Selection */}
                                    <div className="bg-slate-50/80 dark:bg-white/[0.03] p-4 rounded-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06] space-y-3 backdrop-blur-sm">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الجهة / البند <span className="text-red-500">*</span></label>
                                            
                                            {/* Manage Categories Button */}
                                            {formData.related_entity_type === 'general' && (
                                                <motion.button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setIsManageCategoriesOpen(!isManageCategoriesOpen);
                                                        if (!isManageCategoriesOpen) setTimeout(() => newCatInputRef.current?.focus(), 300);
                                                    }}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                                                        isManageCategoriesOpen 
                                                            ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.glow}` 
                                                            : 'text-blue-600 dark:text-blue-400 bg-white dark:bg-white/10 ring-1 ring-blue-200/40 dark:ring-blue-500/20 shadow-sm hover:shadow-md'
                                                    }`}
                                                >
                                                    <Settings className={`w-3.5 h-3.5 transition-transform duration-300 ${isManageCategoriesOpen ? 'rotate-90' : ''}`} />
                                                    {isManageCategoriesOpen ? 'إغلاق' : 'إدارة التصنيفات'}
                                                </motion.button>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            {[
                                                { value: 'general', label: 'عام (بند)', icon: Tag },
                                                { value: 'supplier', label: 'مورد', icon: Users },
                                                { value: 'customer', label: 'عميل', icon: User }
                                            ].map(opt => (
                                                <label key={opt.value} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl transition-all duration-200 ${
                                                    formData.related_entity_type === opt.value 
                                                        ? `bg-white dark:bg-white/10 shadow-md ring-1 ring-black/[0.06] dark:ring-white/[0.1]`
                                                        : 'hover:bg-white/50 dark:hover:bg-white/5'
                                                }`}>
                                                    <input 
                                                        type="radio" name="related_entity_type" value={opt.value} 
                                                        checked={formData.related_entity_type === opt.value} onChange={handleChange}
                                                        className={`w-4 h-4 ${isIncome ? 'text-emerald-600 focus:ring-emerald-500' : 'text-rose-600 focus:ring-rose-500'}`}
                                                    />
                                                    <opt.icon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* ═══ Manage Categories Panel ═══ */}
                                        <AnimatePresence>
                                            {isManageCategoriesOpen && formData.related_entity_type === 'general' && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-white/90 dark:bg-[#0f172a]/60 ring-1 ring-black/[0.06] dark:ring-white/[0.08] rounded-2xl p-5 space-y-4 mb-3 backdrop-blur-xl shadow-lg dark:shadow-black/20">
                                                        
                                                        {/* Title */}
                                                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors.gradient}`}>
                                                                <Layers className="w-3.5 h-3.5 text-white" />
                                                            </div>
                                                            <h4 className="text-sm font-black text-slate-800 dark:text-white">
                                                                إدارة تصنيفات {isIncome ? 'الإيرادات' : 'المصروفات'}
                                                            </h4>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 mr-auto">
                                                                {filteredCategories.length} تصنيف
                                                            </span>
                                                        </div>

                                                        {/* Add New Category */}
                                                        <div className="space-y-2">
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 relative">
                                                                    <input 
                                                                        ref={newCatInputRef}
                                                                        type="text" 
                                                                        placeholder="أدخل اسم التصنيف الجديد..."
                                                                        className={`w-full p-2.5 pr-9 bg-white dark:bg-white/[0.06] border-2 rounded-xl text-sm outline-none dark:text-white dark:placeholder-slate-500 transition-all ${
                                                                            duplicateWarning 
                                                                                ? 'border-amber-400/60 dark:border-amber-500/30 focus:ring-2 focus:ring-amber-500/20' 
                                                                                : 'border-slate-200/50 dark:border-white/[0.08] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/60'
                                                                        }`}
                                                                        value={newCategoryName}
                                                                        onChange={(e) => checkDuplicate(e.target.value)}
                                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                                                    />
                                                                    <Tag className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                                                </div>
                                                                <motion.button 
                                                                    type="button"
                                                                    onClick={handleAddCategory}
                                                                    disabled={isSubmittingCategory || !!duplicateWarning || !newCategoryName.trim()}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all duration-200 ${
                                                                        isSubmittingCategory || duplicateWarning || !newCategoryName.trim()
                                                                            ? 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                                                                            : `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.glow} hover:shadow-xl`
                                                                    }`}
                                                                >
                                                                    {isSubmittingCategory ? (
                                                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                                    ) : (
                                                                        <Plus className="w-4 h-4" />
                                                                    )}
                                                                    إضافة
                                                                </motion.button>
                                                            </div>

                                                            {/* Duplicate Warning */}
                                                            <AnimatePresence>
                                                                {duplicateWarning && (
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, y: -5 }} 
                                                                        animate={{ opacity: 1, y: 0 }} 
                                                                        exit={{ opacity: 0, y: -5 }}
                                                                        className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-500/10 px-3 py-2 rounded-lg ring-1 ring-amber-200/50 dark:ring-amber-500/20"
                                                                    >
                                                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                                        <span className="text-xs font-bold">{duplicateWarning}</span>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>

                                                        {/* Categories List */}
                                                        <div className="max-h-52 overflow-y-auto space-y-1.5 scrollbar-thin">
                                                            {filteredCategories.length === 0 ? (
                                                                <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                                                                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                                                    <p className="text-sm font-medium">لا توجد تصنيفات بعد</p>
                                                                    <p className="text-xs mt-1">أضف أول تصنيف باستخدام الحقل أعلاه</p>
                                                                </div>
                                                            ) : (
                                                                filteredCategories.map((cat, idx) => (
                                                                    <motion.div 
                                                                        key={cat.id} 
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.03 }}
                                                                        className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                                                                            editingId === cat.id 
                                                                                ? 'bg-blue-50/80 dark:bg-blue-500/10 ring-1 ring-blue-200/50 dark:ring-blue-500/20' 
                                                                                : 'bg-slate-50/60 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.06] ring-1 ring-black/[0.03] dark:ring-white/[0.04]'
                                                                        }`}
                                                                    >
                                                                        {editingId === cat.id ? (
                                                                            /* Editing Mode */
                                                                            <div className="flex-1 flex gap-2 items-center">
                                                                                <div className="flex-1 relative">
                                                                                    <input 
                                                                                        type="text" 
                                                                                        value={editingName}
                                                                                        onChange={(e) => checkEditDuplicate(e.target.value)}
                                                                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateCategory(cat.id))}
                                                                                        className={`w-full p-2 text-sm bg-white dark:bg-white/10 border-2 rounded-lg outline-none dark:text-white transition-all ${
                                                                                            editDuplicateWarning 
                                                                                                ? 'border-amber-400/60' 
                                                                                                : 'border-blue-300/60 dark:border-blue-500/30 focus:ring-2 focus:ring-blue-500/20'
                                                                                        }`}
                                                                                        autoFocus
                                                                                    />
                                                                                    {editDuplicateWarning && (
                                                                                        <p className="text-[10px] font-bold text-amber-500 mt-1 flex items-center gap-1">
                                                                                            <AlertCircle className="w-3 h-3" />
                                                                                            {editDuplicateWarning}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <button 
                                                                                    type="button"
                                                                                    onClick={() => handleUpdateCategory(cat.id)} 
                                                                                    disabled={!!editDuplicateWarning}
                                                                                    className={`p-2 rounded-lg transition-all ${editDuplicateWarning ? 'text-slate-300 cursor-not-allowed' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4" />
                                                                                </button>
                                                                                <button type="button" onClick={cancelEditing} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                                                                    <X className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            /* View Mode */
                                                                            <>
                                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ background: colors.main }}></div>
                                                                                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-bold">{cat.name}</span>
                                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                                    <button 
                                                                                        type="button"
                                                                                        onClick={() => startEditing(cat)}
                                                                                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                                                        title="تعديل"
                                                                                    >
                                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                    <button 
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                                                        title="حذف"
                                                                                    >
                                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </motion.div>
                                                                ))
                                                            )}
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
                                                className={`w-full pl-4 pr-10 py-3 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl outline-none focus:ring-2 ${colors.ring} font-bold dark:text-white backdrop-blur-sm transition-all`}
                                                required
                                            >
                                                <option value="" className="dark:bg-slate-800">
                                                    {formData.related_entity_type === 'general' ? 'اختر البند / التصنيف...' : 
                                                     formData.related_entity_type === 'supplier' ? 'اختر المورد...' : 
                                                     'اختر العميل...'}
                                                </option>
                                                
                                                {formData.related_entity_type === 'general' && filteredCategories.map(c => (
                                                    <option key={c.id} value={c.id} className="dark:bg-slate-800">{c.name}</option>
                                                ))}

                                                {formData.related_entity_type === 'supplier' && (
                                                    (Array.isArray(suppliers) && suppliers.length > 0) ? (
                                                        suppliers.map(s => (
                                                            <option key={s.id} value={s.id} className="dark:bg-slate-800">{s.name}</option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled className="dark:bg-slate-800">لا يوجد موردين مسجلين</option>
                                                    )
                                                )}

                                                {formData.related_entity_type === 'customer' && (
                                                    (Array.isArray(customers) && customers.length > 0) ? (
                                                        customers.map(c => (
                                                            <option key={c.id} value={c.id} className="dark:bg-slate-800">{c.name}</option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled className="dark:bg-slate-800">لا يوجد عملاء مسجلين</option>
                                                    )
                                                )}
                                            </select>
                                            <div className="absolute right-3 top-3.5 text-slate-400 dark:text-slate-500">
                                                {formData.related_entity_type === 'general' ? <Tag className="w-5 h-5"/> : 
                                                 formData.related_entity_type === 'supplier' ? <Users className="w-5 h-5"/> : 
                                                 <User className="w-5 h-5"/>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>نوع الحساب</label>
                                            <select
                                                name="account_type"
                                                value={formData.account_type} onChange={handleChange}
                                                className={inputClasses}
                                            >
                                                <option value="safe" className="dark:bg-slate-800">خزنة نقدية</option>
                                                <option value="bank" className="dark:bg-slate-800">حساب بنكي</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>اختر الحساب</label>
                                            <select
                                                name="account_id"
                                                value={formData.account_id} onChange={handleChange}
                                                className={inputClasses}
                                                required
                                            >
                                                <option value="" className="dark:bg-slate-800">-- اختر --</option>
                                                {(formData.account_type === 'safe' ? safes : banks).map(acc => (
                                                    <option key={acc.id} value={acc.id} className="dark:bg-slate-800">{acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bank Reference Number */}
                                    {formData.account_type === 'bank' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-blue-50/50 dark:bg-blue-500/5 p-3 rounded-xl ring-1 ring-blue-200/30 dark:ring-blue-500/10 backdrop-blur-sm"
                                        >
                                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">رقم العملية (اختياري)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="reference_number"
                                                    value={formData.reference_number}
                                                    onChange={handleChange}
                                                    className="w-full pl-4 pr-10 py-2 bg-white/80 dark:bg-white/5 border border-blue-200/40 dark:border-blue-500/10 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-sm dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                                    placeholder="أدخل رقم التحويل أو الشيك..."
                                                />
                                                <div className="absolute right-3 top-2.5 text-blue-400">
                                                    <Tag className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <label className={labelClasses}>الوصف / البيان</label>
                                        <textarea
                                            name="description"
                                            value={formData.description} onChange={handleChange}
                                            rows="3"
                                            className={inputClasses}
                                            placeholder="اكتب تفاصيل العملية هنا..."
                                            required
                                        ></textarea>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-5 bg-slate-50/80 dark:bg-white/[0.03] border-t border-slate-100/50 dark:border-white/[0.04] flex gap-3 backdrop-blur-sm">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-6 py-3 bg-white/80 dark:bg-white/10 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-white/15 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    form="transaction-form"
                                    className={`flex-1 px-6 py-3 text-white rounded-xl font-bold shadow-lg ${colors.glow} hover:-translate-y-0.5 hover:shadow-xl transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${colors.gradient}`}
                                >
                                    <Save className="w-5 h-5" /> حفظ العملية
                                </button>
                            </div>

                            {/* Success Overlay */}
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm rounded-2xl"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                                            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 mx-4"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.1, type: 'spring', damping: 10 }}
                                                className={`p-4 rounded-full ${isIncome ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/20'}`}
                                            >
                                                <CheckCircle className={`w-12 h-12 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                                            </motion.div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white">
                                                {isIncome ? 'تم تسجيل الإيراد بنجاح ✓' : 'تم تسجيل المصروف بنجاح ✓'}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                يمكنك إدخال عملية جديدة أو الضغط على إلغاء
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
