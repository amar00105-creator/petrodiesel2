import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Search, Plus, Trash2, Edit, Truck, CheckCircle, AlertTriangle, User, X, Save, Loader2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';
import { can } from './utils/permissions';

const DriverList = forwardRef(({ drivers = [], search = '', user }, ref) => {
    const [driverList, setDriverList] = useState(Array.isArray(drivers) ? drivers : []);

    React.useEffect(() => {
        setDriverList(Array.isArray(drivers) ? drivers : []);
    }, [drivers]);

    // const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentDriver, setCurrentDriver] = useState(null);

    useImperativeHandle(ref, () => ({
        openAddModal: handleAdd
    }));

    // Filter Logic
    const normalizeText = (text) => {
        if (!text) return "";
        return text
            .toLowerCase()
            .replace(/[أإآ]/g, 'ا')
            .replace(/[ى]/g, 'ي')
            .replace(/[ة]/g, 'ه');
    };

    const filteredDrivers = driverList.filter(d => {
        const term = normalizeText(search);
        return (
            normalizeText(d.name).includes(term) || 
            (d.phone && d.phone.includes(term)) || // Phone is numeric, no norm needed usually but safe
            normalizeText(d.truck_number).includes(term)
        );
    });

    const handleAdd = () => {
        setModalMode('add');
        setCurrentDriver(null);
        setIsModalOpen(true);
    };

    const handleEdit = (driver) => {
        setModalMode('edit');
        setCurrentDriver(driver);
        setIsModalOpen(true);
    };

    const handleSuccess = async (updatedDriver) => {
        if (updatedDriver && updatedDriver.id) {
            // Direct update
            if (modalMode === 'add') {
                setDriverList(prev => [...prev, updatedDriver]);
            } else {
                setDriverList(prev => prev.map(d => d.id == updatedDriver.id ? updatedDriver : d));
            }
            setIsModalOpen(false);
            return;
        }

        try {
            // Timestamp to prevent caching
            const res = await fetch(`/PETRODIESEL2/public/hr/api?entity=driver&action=list&_t=${Date.now()}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                setDriverList(data.data);
                setIsModalOpen(false);
            }
        } catch (e) {
            console.error('Failed to refresh drivers', e);
            // Fallback
            if (modalMode === 'add') window.location.reload();
        }
    };

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (driver) => {
        setItemToDelete(driver);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const fd = new FormData();
        fd.append('id', itemToDelete.id);

        try {
            const res = await fetch('/PETRODIESEL2/public/hr/api?entity=driver&action=delete', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم الحذف بنجاح');
                setDriverList(prev => prev.filter(d => d.id !== itemToDelete.id));
            } else {
                toast.error(data.message || 'فشل الحذف');
            }
        } catch (e) {
            toast.error('خطأ في الاتصال');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف سائق"
                message={`سيتم حذف السائق "${itemToDelete?.name}". هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.`}
                isDeleting={isDeleting}
            />
            {/* Header Removed */}

            {/* Debug & Fix Removed */}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                    <motion.div 
                        key={driver.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                    {driver.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy-900 dark:text-white">{driver.name}</h3>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Truck className="w-3 h-3" />
                                        {driver.truck_number || 'بدون شاحنة'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {can(user, 'hr.edit') && (
                                <button onClick={() => handleEdit(driver)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300">
                                    <Edit className="w-4 h-4" />
                                </button>
                                )}
                                {can(user, 'hr.delete') && (
                                <button onClick={() => openDeleteModal(driver)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                            <div className="text-slate-500 dark:text-slate-400">{driver.phone || 'لا يوجد هاتف'}</div>
                            <Badge size="xs" color="slate">سائق</Badge>
                        </div>
                    </motion.div>
                ))}

                {filteredDrivers.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-400">
                        لا توجد نتائج
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <DriverModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    mode={modalMode}
                    driver={currentDriver}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
});

function DriverModal({ isOpen, onClose, mode, driver, onSuccess }) {
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'duplicate' | 'error', message: string }
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const fd = new FormData(e.target);
        if (mode === 'edit' && driver) {
            fd.append('id', driver.id);
        }

        try {
            const action = mode === 'add' ? 'store' : 'update';
            const res = await fetch(`/PETRODIESEL2/public/hr/api?entity=driver&action=${action}`, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            
            if (data.success) {
                // Check if it's a duplicate (existing driver returned)
                if (data.message && data.message.includes('مسبقاً')) {
                    setFeedback({ type: 'duplicate', message: 'هذا السائق مسجل بالفعل في النظام' });
                    setTimeout(() => { setFeedback(null); }, 2500);
                } else {
                    setFeedback({ type: 'success', message: mode === 'add' ? 'تمت إضافة السائق بنجاح' : 'تم تحديث البيانات بنجاح' });
                    setTimeout(() => {
                        setFeedback(null);
                        onSuccess(null);
                    }, 2000);
                }
            } else {
                setFeedback({ type: 'error', message: data.message || 'حدث خطأ غير متوقع' });
                setTimeout(() => { setFeedback(null); }, 2500);
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'خطأ في الاتصال بالخادم' });
            setTimeout(() => { setFeedback(null); }, 2500);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Modal Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-md"
            />

            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white/95 dark:bg-[#0F172A]/95 dark:backdrop-blur-2xl pointer-events-auto rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden ring-1 ring-black/[0.05] dark:ring-white/[0.08]"
                >
                    {/* Header */}
                    <div className="p-5 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                                    {mode === 'add' ? 'إضافة سائق جديد' : 'تعديل بيانات سائق'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">أدخل بيانات السائق</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-500 dark:text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم <span className="text-red-500">*</span></label>
                            <input type="text" name="name" required defaultValue={driver?.name}
                                className="w-full px-4 py-2.5 border border-slate-200/60 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none bg-white dark:bg-white/5 dark:text-white dark:placeholder-slate-500 transition-all" 
                                placeholder="اسم السائق"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الهاتف</label>
                            <input type="text" name="phone" defaultValue={driver?.phone}
                                className="w-full px-4 py-2.5 border border-slate-200/60 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none bg-white dark:bg-white/5 dark:text-white dark:placeholder-slate-500 transition-all" 
                                placeholder="رقم الهاتف"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الشاحنة / اللوحة</label>
                            <input type="text" name="truck_number" defaultValue={driver?.truck_number}
                                className="w-full px-4 py-2.5 border border-slate-200/60 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none bg-white dark:bg-white/5 dark:text-white dark:placeholder-slate-500 transition-all" 
                                placeholder="رقم الشاحنة"
                            />
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex justify-end gap-3 text-sm font-bold">
                            <button type="button" onClick={onClose} 
                                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all ring-1 ring-slate-200/50 dark:ring-white/[0.06]">
                                إلغاء
                            </button>
                            <button type="submit" disabled={submitting}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                حفظ البيانات
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Animated Center-Screen Feedback Overlay */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xl pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 15, stiffness: 300 }}
                            className="flex flex-col items-center gap-5"
                        >
                            {/* Icon */}
                            {feedback.type === 'success' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1, damping: 12 }}
                                    className="p-6 rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30 shadow-2xl shadow-emerald-500/40"
                                >
                                    <CheckCircle className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                                </motion.div>
                            )}
                            {feedback.type === 'duplicate' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1, damping: 12 }}
                                    className="p-6 rounded-full bg-amber-500/20 ring-4 ring-amber-500/30 shadow-2xl shadow-amber-500/40"
                                >
                                    <AlertTriangle className="w-20 h-20 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                                </motion.div>
                            )}
                            {feedback.type === 'error' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1, damping: 12 }}
                                    className="p-6 rounded-full bg-red-500/20 ring-4 ring-red-500/30 shadow-2xl shadow-red-500/40"
                                >
                                    <X className="w-20 h-20 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
                                </motion.div>
                            )}

                            {/* Text */}
                            <motion.h2
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`text-3xl font-black text-center px-4 ${
                                    feedback.type === 'success' ? 'text-emerald-300' :
                                    feedback.type === 'duplicate' ? 'text-amber-300' :
                                    'text-red-300'
                                }`}
                            >
                                {feedback.message}
                            </motion.h2>

                            {/* Subtitle for duplicate */}
                            {feedback.type === 'duplicate' && (
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.35 }}
                                    className="text-lg text-amber-200/70 font-medium"
                                >
                                    يرجى استخدام اسم مختلف
                                </motion.p>
                            )}

                            {/* Progress bar */}
                            <motion.div
                                className={`h-1 rounded-full w-48 mt-2 ${
                                    feedback.type === 'success' ? 'bg-emerald-500/50' :
                                    feedback.type === 'duplicate' ? 'bg-amber-500/50' :
                                    'bg-red-500/50'
                                }`}
                            >
                                <motion.div
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: feedback.type === 'success' ? 2 : 2.5, ease: 'linear' }}
                                    className={`h-full rounded-full ${
                                        feedback.type === 'success' ? 'bg-emerald-400' :
                                        feedback.type === 'duplicate' ? 'bg-amber-400' :
                                        'bg-red-400'
                                    }`}
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default DriverList;
