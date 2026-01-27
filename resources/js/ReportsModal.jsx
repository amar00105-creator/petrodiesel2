import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Filter, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsModal({ isOpen, onClose }) {
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
        end_date: new Date().toISOString().split('T')[0],
        type: ''
    });

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        transactions: [],
        totals: { income: 0, expense: 0 }
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`/PETRODIESEL2/public/finance/reports?${query}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await response.json();
            
            if (result.success) {
                setData({
                    transactions: result.transactions,
                    totals: result.totals
                });
            } else {
                toast.error('فشل تحميل التقرير');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchReport();
        }
    }, [isOpen, filters]);

    const handlePrint = () => {
        window.print();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 printable-hidden"
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden printable-content">
                            
                            {/* Header */}
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50 printable-header">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">التقارير المالية</h2>
                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {filters.start_date} - {filters.end_date}
                                    </div>
                                </div>
                                <div className="flex gap-2 printable-hidden">
                                    <button onClick={handlePrint} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                                        <Printer className="w-5 h-5" />
                                    </button>
                                    <button onClick={onClose} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Filters Bar */}
                            <div className="p-4 border-b bg-white flex flex-wrap gap-4 items-end printable-hidden">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">من تاريخ</label>
                                    <input 
                                        type="date" 
                                        name="start_date" 
                                        value={filters.start_date} 
                                        onChange={handleChange}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">إلى تاريخ</label>
                                    <input 
                                        type="date" 
                                        name="end_date" 
                                        value={filters.end_date} 
                                        onChange={handleChange}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" 
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">النوع</label>
                                    <select 
                                        name="type" 
                                        value={filters.type} 
                                        onChange={handleChange}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    >
                                        <option value="">الكل</option>
                                        <option value="income">إيرادات</option>
                                        <option value="expense">مصروفات</option>
                                    </select>
                                </div>
                                <button onClick={fetchReport} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                    <Search className="w-4 h-4 inline-block ml-2" /> بحث
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    <div className="p-6 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                        <div className="text-emerald-100 text-sm mb-1">إجمالي الإيرادات</div>
                                        <div className="text-3xl font-bold font-mono">
                                            {data.totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                                        <div className="text-rose-100 text-sm mb-1">إجمالي المنصرفات</div>
                                        <div className="text-3xl font-bold font-mono">
                                            {data.totals.expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                        <div className="text-blue-100 text-sm mb-1">صافي التدفق</div>
                                        <div className="text-3xl font-bold font-mono">
                                            {(data.totals.income - data.totals.expense).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white border boundary-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="p-4">التاريخ</th>
                                                <th className="p-4">البيان / الوصف</th>
                                                <th className="p-4">النوع</th>
                                                <th className="p-4">التصنيف</th>
                                                <th className="p-4 text-left">المبلغ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                            {loading ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">جاري التحميل...</td></tr>
                                            ) : data.transactions.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">لا توجد سجلات في هذه الفترة</td></tr>
                                            ) : (
                                                data.transactions.map((t, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4 text-slate-500 font-mono">{t.date}</td>
                                                        <td className="p-4 font-medium">{t.description}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                                t.type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                                                                t.type === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                                            }`}>
                                                                {t.type === 'income' ? 'إيراد' : t.type === 'expense' ? 'منصرف' : 'تحويل'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-slate-500">{t.category_name || '-'}</td>
                                                        <td className={`p-4 font-mono font-bold text-left ${
                                                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}>
                                                            {parseFloat(t.amount).toLocaleString('en-US')}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        {data.transactions.length > 0 && (
                                            <tfoot className="bg-slate-50 font-bold border-t">
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-left">المجموع</td>
                                                    <td className="p-4 font-mono text-left dir-ltr">
                                                        {(data.totals.income - data.totals.expense).toLocaleString('en-US')}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
