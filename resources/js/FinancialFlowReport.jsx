import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Filter, ArrowUp, ArrowDown, RefreshCw, Layers, Droplets, Briefcase, DollarSign, Wallet, FileDown, FileSpreadsheet, TrendingUp, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Title, Text, Metric, Select, SelectItem, DateRangePicker } from '@tremor/react';
import { toast } from 'sonner';

export default function FinancialFlowReport() {
    // --- State ---
    const [filters, setFilters] = useState({
        source_type: 'safe', // safe | bank
        source_id: '',
        start_date: new Date().toISOString().slice(0, 10).substring(0, 8) + '01', // First day of current month
        end_date: new Date().toISOString().slice(0, 10), // Today
        group_sales: 'none' // none | daily | fuel
    });

    const [sources, setSources] = useState({ safes: [], banks: [] });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Init ---
    useEffect(() => {
        fetchSources();
    }, []);

    // Validate inputs before fetching
    useEffect(() => {
        if (filters.source_id) {
            // Encode dates to prevent swapped range issues
            if (filters.start_date > filters.end_date) {
               toast.warning('تم تصحيح التاريخ: تاريخ البداية لا يمكن أن يكون بعد النهاية');
               setFilters(prev => ({ ...prev, start_date: prev.end_date, end_date: prev.start_date }));
               return; // Will re-trigger effect with corrected dates
            }
            fetchReport();
        }
    }, [filters.source_id, filters.group_sales, filters.start_date, filters.end_date]); // Auto-fetch when filters change

    const fetchSources = async () => {
        try {
            const response = await fetch(`${window.BASE_URL || ''}/reports?action=get_sources`);
            const result = await response.json();
            
            if (result.success) {
                setSources({ safes: result.safes || [], banks: result.banks || [] });
                // Auto-select first safe if available and nothing selected
                if (!filters.source_id && result.safes && result.safes.length > 0) {
                     setFilters(prev => ({ ...prev, source_type: 'safe', source_id: result.safes[0].id }));
                }
            }
        } catch (e) {
            console.error('Failed to fetch sources:', e);
            toast.error('فشل تحميل قائمة الحسابات');
        }
    };

    const fetchReport = async () => {
        if (!filters.source_id) return;
        setLoading(true);
        try {
            const query = new URLSearchParams({
                action: 'financial_flow',
                ...filters
            }).toString();

            const response = await fetch(`${window.BASE_URL || ''}/reports?${query}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();

            if (result.success) {
                setData(result);
            } else {
                toast.error(result.message || 'فشل تحميل التقرير');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(`خطأ في الاتصال: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        // If changing source_type, reset source_id or pick first available
        if (key === 'source_type') {
            const firstSource = value === 'safe' ? (sources.safes[0]?.id || '') : (sources.banks[0]?.id || '');
            setFilters(prev => ({ ...prev, source_type: value, source_id: firstSource }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    // Get current account list based on source type
    const getCurrentAccounts = () => {
        return filters.source_type === 'safe' ? sources.safes : sources.banks;
    };

    // --- Helper Functions ---
    const handleExport = (format) => {
        const query = new URLSearchParams(filters).toString();
        const url = `${window.BASE_URL || ''}/export/financial-flow-${format}?${query}`;
        window.open(url, '_blank');
        toast.success(`جاري تحميل التقرير بصيغة ${format.toUpperCase()}...`);
    };

    const formatCurrency = (amount) => parseFloat(amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '') + ' SDG';
    const formatNumber = (num) => {
        if (!num) return '0';
        return parseFloat(num).toLocaleString('en-US');
    };

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    // --- Render ---
    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 w-full"
        >
            {/* Header & Controls Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Filters Row */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white">
                    {/* Source Type Selector */}
                    <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">نوع الحساب</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => handleFilterChange('source_type', 'safe')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                    filters.source_type === 'safe' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Wallet className="w-4 h-4" />
                                <span>خزنة</span>
                            </button>
                            <button
                                onClick={() => handleFilterChange('source_type', 'bank')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                    filters.source_type === 'bank' 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                <span>بنك</span>
                            </button>
                        </div>
                    </div>

                    {/* Account Selector */}
                    <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اختر الحساب</label>
                        <select 
                            value={filters.source_id}
                            onChange={(e) => handleFilterChange('source_id', e.target.value)}
                            className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="">-- اختر --</option>
                            {getCurrentAccounts().map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="md:col-span-4 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الفترة الزمنية</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                            <span className="text-slate-400 font-bold">إلى</span>
                            <div className="relative flex-1">
                                <input 
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grouping */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">تجميع</label>
                        <select 
                            value={filters.group_sales}
                            onChange={(e) => handleFilterChange('group_sales', e.target.value)}
                            className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="none">تفصيلي</option>
                            <option value="daily">يومي</option>
                            <option value="fuel">وقود</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {data ? (
                    <motion.div 
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Summary Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <motion.div variants={itemVariants} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <p className="text-slate-500 text-xs font-bold mb-1">الرصيد الافتتاحي</p>
                                    <p className="text-2xl font-black text-slate-700">{formatCurrency(data.summary.opening_balance)}</p>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-colors"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 bg-emerald-200/50 rounded-lg text-emerald-700"><ArrowDown className="w-3 h-3" /></div>
                                            <p className="text-emerald-800 text-xs font-bold">إجمالي الوارد</p>
                                        </div>
                                        <p className="text-2xl font-black text-emerald-700 mt-2">
                                            {formatCurrency(data.summary.total_sales + data.summary.total_other_income + data.summary.total_transfers_in)}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex gap-2 text-[10px] font-bold text-emerald-600/80">
                                        <span>+{formatNumber(data.summary.total_sales)} مبيعات</span>
                                        <span>+{formatNumber(data.summary.total_transfers_in)} تحويلات</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="p-5 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-100/50 rounded-full blur-xl group-hover:bg-rose-200/50 transition-colors"></div>
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 bg-rose-200/50 rounded-lg text-rose-700"><ArrowUp className="w-3 h-3" /></div>
                                            <p className="text-rose-800 text-xs font-bold">إجمالي المنصرف</p>
                                        </div>
                                        <p className="text-2xl font-black text-rose-700 mt-2">
                                            {formatCurrency(data.summary.total_expenses + data.summary.total_transfers_out)}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex gap-2 text-[10px] font-bold text-rose-600/80">
                                        <span>-{formatNumber(data.summary.total_expenses)} مصروفات</span>
                                        <span>-{formatNumber(data.summary.total_transfers_out)} تحويلات</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="p-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="relative z-10">
                                    <p className="text-indigo-100 text-xs font-bold mb-1">الرصيد الختامي</p>
                                    <p className="text-3xl font-black tracking-tight">{formatCurrency(data.summary.closing_balance)}</p>
                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-indigo-200" />
                                        <span className="text-xs font-medium text-indigo-100">رصيد فعلي متاح</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Transaction Table */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider w-32">التاريخ</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider w-24">رقم الحركة</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider w-32">نوع العملية</th>
                                            <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">البيان</th>
                                            <th className="p-4 text-xs font-black text-emerald-600 uppercase tracking-wider w-32 text-left">وارد (+)</th>
                                            <th className="p-4 text-xs font-black text-rose-600 uppercase tracking-wider w-32 text-left">منصرف (-)</th>
                                            <th className="p-4 text-xs font-black text-blue-600 uppercase tracking-wider w-32 text-left bg-slate-100/50">الرصيد</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {/* Opening Balance Row */}
                                        <tr className="bg-blue-50/30">
                                            <td className="p-4 text-slate-400 font-mono text-xs">-</td>
                                            <td className="p-4 text-slate-400 font-mono text-xs">-</td>
                                            <td className="p-4"><span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">افتتاحي</span></td>
                                            <td className="p-4 text-slate-600 font-bold">رصيد ما قبل الفترة</td>
                                            <td className="p-4 text-left text-slate-300 font-mono">-</td>
                                            <td className="p-4 text-left text-slate-300 font-mono">-</td>
                                            <td className="p-4 text-left font-black font-mono text-blue-700 bg-blue-50/50">{formatNumber(data.summary.opening_balance)}</td>
                                        </tr>

                                        {data.movements.map((row, idx) => (
                                            <motion.tr 
                                                key={idx}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className={`group hover:bg-slate-50 transition-colors ${
                                                    row.is_group ? 'bg-indigo-50/40' : ''
                                                }`}
                                            >
                                                <td className="p-4 font-mono text-slate-600 text-xs font-bold whitespace-nowrap">{row.date}</td>
                                                <td className="p-4 font-mono text-slate-400 text-xs">#{row.id}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                        row.type === 'income' ? 'bg-emerald-100 text-emerald-700' :
                                                        row.type === 'expense' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {row.category}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {row.fuel_color && (
                                                            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: row.fuel_color }}></div>
                                                        )}
                                                        <span className="text-slate-700 font-medium text-sm line-clamp-1 group-hover:line-clamp-none transition-all">
                                                            {row.description}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-left font-mono font-bold text-emerald-600 text-xs">
                                                    {row.amount_in > 0 ? formatNumber(row.amount_in) : <span className="text-slate-200">-</span>}
                                                </td>
                                                <td className="p-4 text-left font-mono font-bold text-rose-600 text-xs">
                                                    {row.amount_out > 0 ? formatNumber(row.amount_out) : <span className="text-slate-200">-</span>}
                                                </td>
                                                <td className="p-4 text-left font-mono font-black text-slate-700 bg-slate-50/50 group-hover:bg-slate-100 transition-colors text-xs">
                                                    {formatNumber(row.balance)}
                                                </td>
                                            </motion.tr>
                                        ))}
                                        
                                        {data.movements.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="p-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <AlertCircle className="w-8 h-8 text-slate-300" />
                                                        <p>لا توجد حركات مالية في هذه الفترة</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
                    >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600">جاهز للعرض</h3>
                        <p className="text-slate-400 mt-1">اختر الحساب والفترة الزمنية أعلاه لعرض التدفق المالي</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

