import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Filter, Fuel, Banknote, UserCircle } from 'lucide-react';
import { Card, Title, Text, Metric, Select, SelectItem, Grid } from '@tremor/react';
import { toast } from 'sonner';

export default function CustomerReport({ stationId }) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({
        customer_id: '',
        period: 'all',
        start_date: '2000-01-01',
        end_date: new Date().toISOString().split('T')[0]
    });

    // --- Initial Load: Get Customers ---
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${window.BASE_URL}/reports?action=get_sources&type=customer`);
            const result = await response.json();
            if (result.customers) {
                setCustomers(result.customers);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
        }
    };

    // --- Main Data Fetch ---
    const fetchReport = async () => {
        if (!filters.customer_id) return;
        
        setLoading(true);
        try {
            const query = new URLSearchParams({
                action: 'get_customer_report',
                station_id: stationId,
                ...filters
            }).toString();

            const response = await fetch(`${window.BASE_URL}/reports?${query}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await response.json();
            
            if (result.success) {
                setData(result.data); 
            } else {
                toast.error(result.message || 'فشل تحميل التقرير');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when filters change
    useEffect(() => {
        if (filters.customer_id) {
            fetchReport();
        }
    }, [filters.customer_id, filters.period, filters.start_date, filters.end_date]);

    // --- Handlers ---
    const handlePeriodChange = (val) => {
        const now = new Date();
        let start = new Date();
        const end = new Date();

        if (val === 'day') {
            // Today
        } else if (val === 'week') {
            start.setDate(now.getDate() - 7);
        } else if (val === 'month') {
            start.setDate(1);
        } else if (val === 'year') {
            start.setMonth(0, 1);
        } else if (val === 'all') {
             start = new Date('2000-01-01');
        }
        
        setFilters(prev => ({
            ...prev,
            period: val,
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0]
        }));
    };

    // --- Helpers ---
    const formatCurrency = (val) => formatNumber(val) + ' SDG';
    const formatNumber = (val) => parseFloat(val || 0).toLocaleString('en-US');

    const periods = [
        { id: 'day', label: 'اليوم' },
        { id: 'week', label: 'أسبوع' },
        { id: 'month', label: 'شهر' },
        { id: 'year', label: 'سنة' },
        { id: 'all', label: 'الكل' },
        { id: 'custom', label: 'مخصص' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header / Filters Bar */}
            <Card className="bg-white/80 backdrop-blur-md p-4 shadow-sm rounded-2xl border border-slate-100/50 sticky top-0 z-20 dark:bg-white/5 dark:border-white/10 dark:ring-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Right Side: Period Buttons */}
                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start w-full md:w-auto order-2 md:order-1">
                        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 dark:bg-slate-800">
                            {periods.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handlePeriodChange(p.id)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                                        filters.period === p.id 
                                        ? 'bg-white text-blue-600 shadow-sm scale-105 dark:bg-blue-600 dark:text-white' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Left Side: Customer Dropdown & Title */}
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto order-1 md:order-2">
                        
                         {/* Report Title */}
                         <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-xl text-white shadow-lg shadow-emerald-200">
                            <UserCircle className="w-5 h-5" />
                            <span className="font-bold text-lg whitespace-nowrap">كشف حساب عميل</span>
                        </div>

                        {/* Customer Selector */}
                        <div className="w-full md:w-64 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                            <select 
                                value={filters.customer_id} 
                                onChange={(e) => setFilters(prev => ({ ...prev, customer_id: e.target.value }))}
                                className="w-full h-10 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            >
                                <option value="">اختر العميل...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>

                {/* Custom Date Inputs (Conditional) */}
                <AnimatePresence>
                    {filters.period === 'custom' && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-start gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 ml-2">من تاريخ</label>
                                    <input 
                                        type="date" 
                                        value={filters.start_date}
                                        onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                    />
                                </div>
                                <div className="flex items-center self-end pb-2">
                                    <span className="text-slate-300">-----</span>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 ml-2">إلى تاريخ</label>
                                    <input 
                                        type="date" 
                                        value={filters.end_date}
                                        onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Report Content */}
            {!filters.customer_id ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10"
                >
                    <Search className="w-20 h-20 text-slate-200 mx-auto mb-4 dark:text-slate-600" />
                    <Title className="text-slate-700 text-xl font-bold dark:text-white">حدد العميل لعرض التقرير</Title>
                    <Text className="text-slate-400">يمكنك اختيار العميل من القائمة أعلاه</Text>
                </motion.div>
            ) : !data && loading ? (
                 <div className="text-center py-24">
                     <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4 shadow-xl shadow-emerald-200"></div>
                     <Text className="text-emerald-600 font-bold animate-pulse">جاري جلب البيانات...</Text>
                 </div>
            ) : data ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                            <Card decoration="top" decorationColor="emerald" className="bg-white hover:shadow-lg transition-shadow dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <Text className="dark:text-slate-400">إجمالي المبيعات (لهم)</Text>
                                <Metric className="mt-2 text-emerald-600 drop-shadow-sm dark:text-emerald-400">{formatCurrency(data.totals.total_sales)}</Metric>
                            </Card>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Card decoration="top" decorationColor="blue" className="bg-white hover:shadow-lg transition-shadow dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <Text className="dark:text-slate-400">إجمالي المدفوعات (لنا)</Text>
                                <Metric className="mt-2 text-blue-600 drop-shadow-sm dark:text-blue-400">{formatCurrency(data.totals.total_paid)}</Metric>
                            </Card>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                            <Card decoration="top" decorationColor={data.totals.net_balance > 0 ? 'teal' : 'rose'} className="bg-white hover:shadow-lg transition-shadow dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <Text className="dark:text-slate-400">صافي الرصيد النهائي</Text>
                                <Metric className={`mt-2 ${data.totals.net_balance > 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'} drop-shadow-sm`}>
                                    {formatCurrency(data.totals.net_balance)}
                                </Metric>
                                <Text className="text-xs text-slate-400 mt-1">
                                    {data.totals.net_balance > 0 ? 'لنا (ديون العميل)' : 'دفعة زائدة'}
                                </Text>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Transactions Table */}
                    <Card className="px-0 py-0 overflow-hidden bg-white shadow-lg rounded-2xl border border-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <div className="overflow-x-auto min-h-[400px]">
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                                </div>
                            )}
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10">
                                    <tr>
                                        <th className="p-4 whitespace-nowrap">التاريخ</th>
                                        <th className="p-4 whitespace-nowrap">البيان</th>
                                        <th className="p-4 whitespace-nowrap">التصنيف</th>
                                        <th className="p-4 whitespace-nowrap">الكمية</th>
                                        <th className="p-4 whitespace-nowrap">السعر</th>
                                        <th className="p-4 whitespace-nowrap text-emerald-600">قيمة المبيعات</th>
                                        <th className="p-4 whitespace-nowrap text-blue-600">المدفوع</th>
                                        <th className="p-4 whitespace-nowrap">الإجمالي (تراكمي)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                    <AnimatePresence mode="wait">
                                        {data.transactions.length > 0 ? (
                                            data.transactions.map((row, idx) => (
                                                    <motion.tr 
                                                        key={idx} 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.98 }}
                                                        transition={{ delay: idx * 0.02 }}
                                                        className="hover:bg-emerald-50/50 transition-colors group dark:hover:bg-white/5"
                                                    >
                                                        <td className="p-4 whitespace-nowrap text-slate-500 font-mono text-xs dark:text-slate-400">{row.date}</td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-800 dark:text-white">{row.statement_title}</div>
                                                            <div className="text-[10px] text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400">{row.statement_subtitle}</div>
                                                        </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                                            row.type === 'sale' 
                                                            ? 'bg-emerald-100 text-emerald-700' 
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {row.type === 'sale' ? <Fuel className="w-3 h-3"/> : <Banknote className="w-3 h-3"/>}
                                                            {row.category}
                                                        </span>
                                                    </td>
                                                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                                                            {row.quantity ? formatNumber(row.quantity) : '-'}
                                                        </td>
                                                        <td className="p-4 font-mono text-slate-400 text-xs dark:text-slate-500">
                                                            {row.price ? formatNumber(row.price) : '-'}
                                                        </td>
                                                        <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                            {row.sale_value ? formatNumber(row.sale_value) : '-'}
                                                        </td>
                                                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                                            {row.amount_paid ? formatNumber(row.amount_paid) : '-'}
                                                        </td>
                                                        <td className="p-4 font-bold" dir="ltr">
                                                            <span className={row.running_balance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}>
                                                                {formatNumber(row.running_balance)}
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="p-12 text-center text-slate-400">
                                                    لا توجد حركات في هذه الفترة
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                                    <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-200">
                                        <tr>
                                            <td colSpan="5" className="p-4 text-left">الإجماليات الكلية:</td>
                                            <td className="p-4 text-emerald-400">{formatNumber(data.totals.total_sales)}</td>
                                            <td className="p-4 text-blue-400">{formatNumber(data.totals.total_paid)}</td>
                                            <td className="p-4" dir="ltr">
                                                <span className={data.totals.net_balance >= 0 ? 'text-teal-400' : 'text-rose-400'}>
                                                    {formatNumber(data.totals.net_balance)}
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                            </table>
                        </div>
                    </Card>
                </>
            ) : null}
        </div>
    );
}
