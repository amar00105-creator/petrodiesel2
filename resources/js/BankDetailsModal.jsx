import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, ArrowUpRight, ArrowDownRight, ArrowRightLeft, CreditCard, Calendar, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function BankDetailsModal({ isOpen, onClose, bankId, currency = 'SDG' }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        bank: null,
        transactions: []
    });
    
    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', account_number: '' });

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchDetails = async () => {
        if (!bankId) return;
        setLoading(true);
        try {
            const response = await fetch(`/PETRODIESEL2/public/finance/getBankDetails?id=${bankId}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await response.json();
            
            if (result.success) {
                setData({
                    bank: result.bank,
                    transactions: result.transactions
                });
                setEditForm({ name: result.bank.name, account_number: result.bank.account_number });
            } else {
                toast.error(result.message || 'فشل تحميل بيانات البنك');
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && bankId) {
            fetchDetails();
            setIsEditing(false);
        }
    }, [isOpen, bankId]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('id', bankId);
            formData.append('name', editForm.name);
            formData.append('account_number', editForm.account_number);

            const response = await fetch('/PETRODIESEL2/public/finance/updateBank', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await response.json();

            if (result.success) {
                toast.success('تم تحديث بيانات البنك بنجاح');
                setIsEditing(false);
                fetchDetails(); // Reload details
                // Optional: Trigger parent reload if needed, but for now local update is good
                setTimeout(() => window.location.reload(), 1000); 
            } else {
                toast.error('فشل التحديث');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال');
        }
    };

    const handleDelete = async () => {
        try {
             const formData = new FormData();
             formData.append('id', bankId);

             const response = await fetch('/PETRODIESEL2/public/finance/deleteBank', {
                 method: 'POST',
                 body: formData,
                 headers: { 'X-Requested-With': 'XMLHttpRequest' }
             });
             const result = await response.json();

             if (result.success) {
                 toast.success('تم حذف البنك بنجاح');
                 setIsDeleteModalOpen(false);
                 onClose();
                 setTimeout(() => window.location.reload(), 500); 
             } else {
                 toast.error('فشل الحذف');
             }
         } catch (error) {
             toast.error('خطأ في الاتصال');
         }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                    />

                     {/* Delete Confirmation */}
                     <DeleteConfirmationModal 
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        title="حذف البنك"
                        message="هل أنت متأكد من حذف هذا البنك؟ سيتم حذف جميع السجلات المرتبطة به."
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-900/5">
                            
                            {/* Header / Banner */}
                            <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white overflow-hidden shrink-0">
                                {/* Decorative Circles */}
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl"></div>

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="flex gap-4 items-center w-full">
                                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
                                            <Landmark className="w-8 h-8 text-white" />
                                        </div>
                                        
                                        {isEditing ? (
                                            <div className="flex-1 ml-8 space-y-2">
                                                 <input 
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 outline-none focus:bg-white/20"
                                                    placeholder="اسم البنك"
                                                />
                                                <input 
                                                    value={editForm.account_number}
                                                    onChange={(e) => setEditForm({...editForm, account_number: e.target.value})}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 outline-none focus:bg-white/20 font-mono"
                                                    placeholder="رقم الحساب"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                {loading ? (
                                                    <div className="h-8 w-48 bg-white/20 rounded animate-pulse mb-2"></div>
                                                ) : (
                                                    <h2 className="text-3xl font-bold">{data.bank?.name}</h2>
                                                )}
                                                <div className="flex items-center gap-2 text-indigo-100 opacity-90">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="font-mono tracking-wider">{data.bank?.account_number || '....'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isEditing ? (
                                            <>
                                                <button onClick={() => setIsEditing(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md group" title="تعديل">
                                                    <Edit className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-full transition-colors backdrop-blur-md group" title="حذف">
                                                    <Trash2 className="w-5 h-5 text-rose-200 group-hover:text-white transition-colors" />
                                                </button>
                                            </>
                                        ) : (
                                             <div className="flex gap-2">
                                                <button onClick={handleEditSubmit} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-bold text-sm transition-colors">حفظ</button>
                                                <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">إلغاء</button>
                                             </div>
                                        )}
                                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md mr-2">
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <div className="text-indigo-200 text-sm mb-1 uppercase tracking-wider font-semibold">الرصيد الحالي</div>
                                    {loading ? (
                                        <div className="h-12 w-64 bg-white/20 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="text-5xl font-bold font-mono tracking-tight">
                                            {parseFloat(data.bank?.balance || 0).toLocaleString('en-US')} <span className="text-2xl opacity-60">{currency}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Transactions List */}
                            <div className="flex-1 overflow-y-auto bg-slate-50">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                        سجل العمليات
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        {loading ? (
                                            [1,2,3].map(i => (
                                                <div key={i} className="h-20 bg-white rounded-xl animate-pulse shadow-sm"></div>
                                            ))
                                        ) : data.transactions.length === 0 ? (
                                            <div className="p-12 text-center text-slate-400">
                                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Landmark className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p>لا توجد عمليات مسجلة لهذا الحساب</p>
                                            </div>
                                        ) : (
                                            data.transactions.map((t, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl ${
                                                            t.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                                                            t.type === 'expense' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            {t.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : 
                                                             t.type === 'expense' ? <ArrowUpRight className="w-5 h-5" /> : 
                                                             <ArrowRightLeft className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-lg">{t.description}</div>
                                                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.created_at}</span>
                                                                <span>•</span>
                                                                <span className={`${
                                                                    t.type === 'income' ? 'text-emerald-600' : 'text-slate-500'
                                                                }`}>{t.category_name}</span>
                                                                {t.user_name && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-slate-400 text-xs">بواسطة: {t.user_name}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-xl font-bold font-mono ${
                                                        t.type === 'income' || (t.type === 'transfer' && t.to_id == bankId) ? 'text-emerald-600' :
                                                        'text-rose-600'
                                                    }`}>
                                                        {t.type === 'expense' || (t.type === 'transfer' && t.from_id == bankId) ? '-' : '+'}
                                                        {parseFloat(t.amount).toLocaleString('en-US')}
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-white border-t text-center text-xs text-slate-400">
                                عرض آخر {data.transactions.length} عملية
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
