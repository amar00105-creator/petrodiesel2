import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Filter, PieChart, TrendingUp, DollarSign, Droplets, Users, FileText, Briefcase, Activity, Truck, CheckCircle, Wallet, BarChart3, Gauge, Calendar, Brain } from 'lucide-react';
import { TabGroup, TabList, Tab, Title, Text, Card, Metric, Flex, BadgeDelta, Grid, Badge } from '@tremor/react';
import { toast } from 'sonner';
import DailySalesReconciliation from './DailySalesReconciliation';
import TankSalesReport from './TankSalesReport';
import TankTransactionReport from './components/reports/TankTransactionReport';
import SupplierReport from './SupplierReport';
import CustomerReport from './CustomerReport';
import FinancialFlowReport from './FinancialFlowReport';
import ProfitLossReport from './ProfitLossReport';
import LossReport from './LossReport';
import PumpPerformanceReport from './PumpPerformanceReport';
import WorkerPerformanceReport from './WorkerPerformanceReport';
import MonthlyComparisonReport from './MonthlyComparisonReport';
import AlertsPanel from './components/AlertsPanel';
import DailyClosingReport from './DailyClosingReport';

export default function Reports({ user }) {
    // --- State ---
    const [activeTab, setActiveTab] = useState(0); // 0: Financial, 1: Warehouse, 2: Sales, 3: Employees
    
    // Warehouse Sub-tabs
    const [warehouseTab, setWarehouseTab] = useState(0); // 0: Overview, 1: Sales Report, 2: Transaction Report

    // Check URL params for tab selection
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const subtab = params.get('subtab');
        
        if (tab === 'sales') {
            setActiveTab(2);
        } else if (tab === 'financial') {
            setActiveTab(0);
            if (subtab === 'statement') {
                setFinancialTab(1);
            }
        } else if (tab === 'warehouse') {
            setActiveTab(1);
        }
    }, []);

    const [filters, setFilters] = useState({
        station_id: user?.station_id || 'all',
        start_date: null, // Will be set from server date
        end_date: null,   // Will be set from server date
        period: 'month', // month, quarter, year, custom
        category_id: ''
    });
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // --- Data Fetching ---
    const fetchStats = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                action: 'get_stats',
                ...filters
            }).toString();
            
            const response = await fetch(`${window.BASE_URL || ''}/reports?${query}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await response.json();
            
            if (result.success) {
                console.log('📊 Reports Data:', result);
                console.log('📦 Warehouse Readings:', result?.warehouse?.readings);
                setStats(result);
            } else {
                toast.error('فشل تحميل البيانات');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    // Initialize dates and fetch categories
    useEffect(() => {
        const initializeDates = async () => {
            try {
                const res = await fetch(`${window.BASE_URL || ''}/api/server-time`);
                const data = await res.json();
                if (data.success) {
                    const serverDate = data.date; // "YYYY-MM-DD"
                    const [year, month, day] = serverDate.split('-');
                    
                    // Set start date to first day of current month
                    const startDate = `${year}-${month}-01`;
                    
                    setFilters(prev => ({
                        ...prev,
                        start_date: startDate,
                        end_date: serverDate
                    }));
                }
            } catch (err) {
                console.warn('Failed to get server date, using client date');
                // Fallback to client date
                const now = new Date();
                setFilters(prev => ({
                    ...prev,
                    start_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
                    end_date: now.toISOString().split('T')[0]
                }));
            }
        };

        const fetchCategories = async () => {
             try {
                const response = await fetch(`${window.BASE_URL || ''}/reports?action=get_categories`);
                const result = await response.json();
                if (result.success) {
                    setCategories(result.categories || []);
                }
             } catch (e) {
                 console.error('Failed to fetch categories:', e);
             }
        };

        initializeDates();
        fetchCategories();
    }, []);

    useEffect(() => {
        // Only fetch if dates are set
        if (filters.start_date && filters.end_date) {
            fetchStats();
        }
    }, [filters.start_date, filters.end_date, filters.category_id]); // Fetch when dates or filters change

    // --- Handlers ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePeriodChange = async (period) => {
        // Get server date to ensure consistency with timezone
        let serverDateStr;
        try {
            const res = await fetch(`${window.BASE_URL || ''}/api/server-time`);
            const data = await res.json();
            if (data.success) {
                serverDateStr = data.date; // "YYYY-MM-DD"
            }
        } catch (err) {
            console.warn('Failed to get server date, using client date');
        }
        
        // Parse server date or fallback to client date
        const [year, month, day] = (serverDateStr || new Date().toISOString().split('T')[0]).split('-');
        const now = new Date(year, month - 1, day);
        
        let start = new Date(now);
        const end = new Date(now);

        if (period === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === 'quarter') {
            const quarter = Math.floor((now.getMonth() + 3) / 3);
            start = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        } else if (period === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
        }

        setFilters(prev => ({
            ...prev,
            period,
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0]
        }));
    };

    // --- Components ---
    const formatCurrency = (amount) => parseFloat(amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '') + ' SDG';
    const formatNumber = (num) => parseFloat(num || 0).toLocaleString('en-US');

    // Financial Cards - ENHANCED
    // Financial Sub-tabs
    const [financialTab, setFinancialTab] = useState(0); // 0: Usage, 1: Statement

    const renderFinancial = () => {
        console.log('[DEBUG-REPORTS] renderFinancial called, financialTab:', financialTab);
        return (
        <div className="space-y-6 animate-fade-in">
            {/* Filter Bar - Glassmorphism */}
            <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-lg p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Period Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">الفترة</label>
                        <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-slate-200/50 dark:bg-white/5 dark:border-white/10">
                            <button 
                                onClick={() => handlePeriodChange('month')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filters.period === 'month' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'}`}
                            >
                                شهري
                            </button>
                            <button 
                                onClick={() => handlePeriodChange('quarter')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filters.period === 'quarter' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'}`}
                            >
                                ربع سنوي
                            </button>
                            <button 
                                onClick={() => handlePeriodChange('year')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${filters.period === 'year' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'}`}
                            >
                                سنوي
                            </button>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">من تاريخ</label>
                        <input 
                            type="date" 
                            name="start_date"
                            value={filters.start_date || ''}
                            onChange={handleFilterChange}
                            className="w-full h-10 px-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none dark:bg-white/5 dark:border-white/10 dark:text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">إلى تاريخ</label>
                        <input 
                            type="date" 
                            name="end_date"
                            value={filters.end_date || ''}
                            onChange={handleFilterChange}
                            className="w-full h-10 px-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none dark:bg-white/5 dark:border-white/10 dark:text-white"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">تصنيف المصروفات</label>
                        <select 
                            name="category_id"
                            value={filters.category_id || ''}
                            onChange={handleFilterChange}
                            className="w-full h-10 px-3 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none dark:bg-white/5 dark:border-white/10 dark:text-white"
                        >
                            <option value="">الكل</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Financial Sub-Navigation - Glassmorphism */}
            <div className="flex gap-2 p-1.5 bg-white/50 backdrop-blur-xl rounded-xl w-fit border border-slate-200/50 shadow-sm dark:bg-white/5 dark:border-white/10 mb-6">
                <button
                    onClick={() => setFinancialTab(0)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        financialTab === 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    نظرة عامة
                </button>
                <button
                    onClick={() => setFinancialTab(1)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        financialTab === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    كشف حساب (خزنة/بنك)
                </button>
            </div>

            {financialTab === 0 ? (
                <>
                {/* Summary Row - 4 Cards Glassmorphism */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Net Profit */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                        <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-emerald-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-emerald-500/30 dark:shadow-emerald-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">صافي الربح / الخسارة</div>
                                    <div className={`text-2xl font-black ${stats?.financial?.net_profit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {formatCurrency(stats?.financial?.net_profit)}
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 mt-4 pt-4 border-t border-emerald-100/50 dark:border-emerald-500/20 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">الإيرادات</div>
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.financial?.income)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">المصروفات</div>
                                    <div className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats?.financial?.expense)}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Total Cash (Banks + Safes) */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-indigo-500/30 dark:shadow-indigo-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 dark:from-indigo-500/10 dark:to-violet-500/10" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                    <Wallet className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">إجمالي النقد المتاح</div>
                                    <div className="text-2xl font-black text-indigo-700 dark:text-white">{formatCurrency(stats?.financial?.total_cash)}</div>
                                </div>
                            </div>
                            <div className="relative z-10 mt-4 pt-4 border-t border-indigo-100/50 dark:border-indigo-500/20 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">الخزائن ({stats?.financial?.safes?.length || 0})</div>
                                    <div className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats?.financial?.total_safes)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">البنوك ({stats?.financial?.banks?.length || 0})</div>
                                    <div className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(stats?.financial?.total_banks)}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Inventory Valuation */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-blue-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-blue-500/30 dark:shadow-blue-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <Droplets className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">قيمة المخزون اللحظي</div>
                                    <div className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(stats?.financial?.inventory_value)}</div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">مجموع (حجم الخزان × السعر الحالي)</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Debts Summary */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-amber-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-amber-500/30 dark:shadow-amber-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">الذمم والديون</div>
                                    <div className="text-2xl font-black text-slate-700 dark:text-white">ملخص الأرصدة</div>
                                </div>
                            </div>
                            <div className="relative z-10 mt-4 space-y-3">
                                <div className="flex justify-between items-center p-2 bg-white/60 backdrop-blur-sm rounded-lg dark:bg-white/5">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">ديون الشركات (لنا)</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.financial?.corporate_debts)}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white/60 backdrop-blur-sm rounded-lg dark:bg-white/5">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">التزامات الموردين (علينا)</span>
                                    <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats?.financial?.supplier_debts)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Detail Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Banks & Safes Details */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-blue-500/30 dark:shadow-blue-500/10 dark:shadow-lg">
                            <div className="px-6 py-4 border-b border-blue-100/50 dark:border-blue-500/20 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-500/10 dark:to-indigo-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Wallet className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-base font-black text-slate-800 dark:text-white">تفاصيل الأرصدة النقدية</div>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Safes */}
                                <div>
                                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-2">الخزائن</div>
                                    <div className="space-y-2">
                                        {stats?.financial?.safes?.map((safe, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:bg-white/90 hover:shadow-md transition-all dark:bg-white/5 dark:border-blue-500/10 dark:hover:bg-white/10">
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{safe.name}</span>
                                                <span className="font-bold font-mono text-blue-700 dark:text-blue-400">{formatCurrency(safe.balance)}</span>
                                            </div>
                                        ))}
                                        {(!stats?.financial?.safes || stats?.financial?.safes.length === 0) && (
                                            <div className="text-slate-400 dark:text-slate-500 text-sm text-center py-2">لا توجد خزائن</div>
                                        )}
                                    </div>
                                </div>
                                {/* Banks */}
                                <div>
                                    <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm mb-2">البنوك</div>
                                    <div className="space-y-2">
                                        {stats?.financial?.banks?.map((bank, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-100/50 hover:bg-white/90 hover:shadow-md transition-all dark:bg-white/5 dark:border-indigo-500/10 dark:hover:bg-white/10">
                                                <div>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{bank.name}</span>
                                                    {bank.account_number && (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">({bank.account_number})</span>
                                                    )}
                                                </div>
                                                <span className="font-bold font-mono text-indigo-700 dark:text-indigo-400">{formatCurrency(bank.balance)}</span>
                                            </div>
                                        ))}
                                        {(!stats?.financial?.banks || stats?.financial?.banks.length === 0) && (
                                            <div className="text-slate-400 dark:text-slate-500 text-sm text-center py-2">لا توجد حسابات بنكية</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Expense Breakdown */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-rose-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-rose-500/30 dark:shadow-rose-500/10 dark:shadow-lg">
                            <div className="px-6 py-4 border-b border-rose-100/50 dark:border-rose-500/20 bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-500/10 dark:to-pink-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-base font-black text-slate-800 dark:text-white">توزيع المصروفات حسب الفئة</div>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                {stats?.financial?.expense_breakdown?.map((cat, idx) => {
                                    const percentage = stats?.financial?.expense > 0 
                                        ? (cat.total_amount / stats.financial.expense * 100).toFixed(1) 
                                        : 0;
                                    return (
                                        <div key={idx} className="p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-100/80 dark:bg-white/5 dark:border-white/10 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-700 dark:text-white">{cat.category_name}</span>
                                                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">{formatCurrency(cat.total_amount)}</span>
                                            </div>
                                            <div className="h-2 bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-rose-400 to-pink-600 rounded-full shadow-sm"
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                                                <span>{cat.transaction_count} عملية</span>
                                                <span className="font-mono">{percentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!stats?.financial?.expense_breakdown || stats?.financial?.expense_breakdown.length === 0) && (
                                    <div className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">لا توجد مصروفات في هذه الفترة</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Top Customers & Suppliers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Customers (who owe us) */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-emerald-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-emerald-500/30 dark:shadow-emerald-500/10 dark:shadow-lg">
                            <div className="px-6 py-4 border-b border-emerald-100/50 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-500/10 dark:to-green-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-base font-black text-slate-800 dark:text-white">أكبر العملاء المدينين (لنا)</div>
                                </div>
                            </div>
                            <div className="p-5 space-y-2">
                                {stats?.financial?.top_customers?.map((customer, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100/50 hover:bg-white/90 hover:shadow-md transition-all dark:bg-white/5 dark:border-emerald-500/10 dark:hover:bg-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">
                                                {idx + 1}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-white">{customer.name}</span>
                                        </div>
                                        <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(customer.balance)}</span>
                                    </div>
                                ))}
                                {(!stats?.financial?.top_customers || stats?.financial?.top_customers.length === 0) && (
                                    <div className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">لا توجد ديون من العملاء</div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Suppliers (we owe them) */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-rose-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-rose-500/30 dark:shadow-rose-500/10 dark:shadow-lg">
                            <div className="px-6 py-4 border-b border-rose-100/50 dark:border-rose-500/20 bg-gradient-to-r from-rose-50/80 to-red-50/80 dark:from-rose-500/10 dark:to-red-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                        <Truck className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-base font-black text-slate-800 dark:text-white">أكبر الموردين الدائنين (علينا)</div>
                                </div>
                            </div>
                            <div className="p-5 space-y-2">
                                {stats?.financial?.top_suppliers?.map((supplier, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-rose-100/50 hover:bg-white/90 hover:shadow-md transition-all dark:bg-white/5 dark:border-rose-500/10 dark:hover:bg-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-rose-500/20">
                                                {idx + 1}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-white">{supplier.name}</span>
                                        </div>
                                        <span className="font-bold font-mono text-rose-700 dark:text-rose-400">{formatCurrency(supplier.balance)}</span>
                                    </div>
                                ))}
                                {(!stats?.financial?.top_suppliers || stats?.financial?.top_suppliers.length === 0) && (
                                    <div className="text-slate-400 dark:text-slate-500 text-sm text-center py-6">لا توجد التزامات للموردين</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
                </>
            ) : (
                <FinancialFlowReport initialGroup={new URLSearchParams(window.location.search).get('group')} />
            )}
        </div>
    );
    }

    // Warehouse Cards
    const renderWarehouse = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Warehouse Sub-Navigation */}
            <div className="flex gap-2 p-1.5 bg-white/50 backdrop-blur-xl rounded-xl w-fit border border-slate-200/50 shadow-sm dark:bg-white/5 dark:border-white/10 mb-6">
                <button
                    onClick={() => setWarehouseTab(0)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        warehouseTab === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    نظرة عامة
                </button>
                <button
                    onClick={() => setWarehouseTab(1)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        warehouseTab === 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    تقرير مبيعات يومية
                </button>
                <button
                    onClick={() => setWarehouseTab(2)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        warehouseTab === 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    تقرير حركة تفصيلية
                </button>
            </div>

            {warehouseTab === 0 ? (
                <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-blue-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-blue-500/30 dark:shadow-blue-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <Droplets className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">قيمة المخزون الحالي</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(stats?.financial?.inventory_value)}</div>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-cyan-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-cyan-500/30 dark:shadow-cyan-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 dark:from-cyan-500/10 dark:to-teal-500/10" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">الوارد (مشتريات) للفترة</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{formatNumber(stats?.warehouse?.incoming_stock?.total_volume)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">لتر</span></div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">بتكلفة: {formatCurrency(stats?.warehouse?.incoming_stock?.total_cost)}</div>
                        </div>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-orange-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-orange-500/30 dark:shadow-orange-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                            <Activity className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">فاقد التبخر (تقديري)</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{formatNumber(stats?.financial?.evaporation_loss)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">لتر</span></div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">حسب التباين بين الأرصدة</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-lg font-black text-slate-700 dark:text-white mt-4 mb-2">تفاصيل المستودعات والمعايرة</div>
            
            {/* Tanks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats?.warehouse?.tanks.map((tank, idx) => {
                    const fillPercentage = (tank.volume / (tank.capacity || 1)) * 100;
                    const isLow = fillPercentage < 20;
                    const isCritical = fillPercentage < 10;
                    
                    // Determine fuel color
                    const getFuelGradient = (fuelName) => {
                        const fuel = (fuelName || '').toLowerCase();
                        if (fuel.includes('diesel') || fuel.includes('ديزل')) return 'from-amber-400 to-orange-500';
                        if (fuel.includes('petrol') || fuel.includes('بنزين') || fuel.includes('91') || fuel.includes('95')) return 'from-emerald-400 to-teal-500';
                        if (fuel.includes('gas') || fuel.includes('غاز')) return 'from-purple-400 to-pink-500';
                        return 'from-blue-400 to-indigo-500';
                    };

                    const getFuelBorderColor = (fuelName) => {
                        const fuel = (fuelName || '').toLowerCase();
                        if (fuel.includes('diesel') || fuel.includes('ديزل')) return 'border-amber-300/60 dark:border-amber-500/40 dark:shadow-amber-500/10';
                        if (fuel.includes('petrol') || fuel.includes('بنزين') || fuel.includes('91') || fuel.includes('95')) return 'border-emerald-300/60 dark:border-emerald-500/40 dark:shadow-emerald-500/10';
                        if (fuel.includes('gas') || fuel.includes('غاز')) return 'border-purple-300/60 dark:border-purple-500/40 dark:shadow-purple-500/10';
                        return 'border-blue-300/60 dark:border-blue-500/40 dark:shadow-blue-500/10';
                    };

                    const getFuelBg = (fuelName) => {
                        const fuel = (fuelName || '').toLowerCase();
                        if (fuel.includes('diesel') || fuel.includes('ديزل')) return 'bg-amber-50 dark:bg-amber-500/10';
                        if (fuel.includes('petrol') || fuel.includes('بنزين') || fuel.includes('91') || fuel.includes('95')) return 'bg-emerald-50 dark:bg-emerald-500/10';
                        if (fuel.includes('gas') || fuel.includes('غاز')) return 'bg-purple-50 dark:bg-purple-500/10';
                        return 'bg-blue-50 dark:bg-blue-500/10';
                    };

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className={`relative overflow-hidden rounded-2xl p-5 bg-white/90 backdrop-blur-xl border-2 shadow-lg transition-all duration-300 hover:shadow-xl group dark:bg-white/5 dark:backdrop-blur-xl dark:shadow-lg ${getFuelBorderColor(tank.fuel)} ${
                                isCritical ? 'ring-2 ring-red-400/50 animate-pulse' : isLow ? 'ring-2 ring-orange-400/50' : ''
                            }`}>
                                {/* Animated Fill Background */}
                                <div 
                                   className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${getFuelBg(tank.fuel)}`}
                                   style={{ height: `${fillPercentage}%`, opacity: 0.4 }}
                                />
                                
                                {/* Warning Badge */}
                                {(isLow || isCritical) && (
                                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20 ${
                                        isCritical ? 'bg-red-500 text-white animate-bounce' : 'bg-orange-500 text-white'
                                    }`}>
                                        <Activity className="w-3 h-3" />
                                        {isCritical ? 'حرج!' : 'منخفض'}
                                    </div>
                                )}
                                
                                {/* Header */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="font-bold text-slate-800 text-lg dark:text-white">{tank.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getFuelGradient(tank.fuel)}`} />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{tank.fuel}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getFuelGradient(tank.fuel)} text-white shadow-lg`}>
                                        {fillPercentage.toFixed(1)}%
                                    </div>
                                </div>
                                
                                {/* Visual Tank Gauge */}
                                <div className="mt-6 mb-4 relative z-10">
                                    <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${fillPercentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r ${getFuelGradient(tank.fuel)} shadow-lg`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                                        <span>0</span>
                                        <span className="font-bold text-slate-600 dark:text-slate-300">{formatNumber(tank.volume)} L</span>
                                        <span>{formatNumber(tank.capacity)}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
                                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-slate-100/80 dark:bg-white/5 dark:border-white/10">
                                        <div className="text-xs text-slate-500 mb-1 dark:text-slate-400">القيمة الإجمالية</div>
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(tank.value)}</div>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-slate-100/80 dark:bg-white/5 dark:border-white/10">
                                        <div className="text-xs text-slate-500 mb-1 dark:text-slate-400">آخر معايرة</div>
                                        <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {tank.last_calibration === 'N/A' ? 'غير متوفر' : new Date(tank.last_calibration).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Variance Indicator */}
                                <div className={`mt-3 pt-3 border-t border-slate-100/50 flex justify-between items-center relative z-10 dark:border-white/10`}>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">التباين (Variance)</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono font-bold text-sm ${
                                            tank.variance < -50 ? 'text-red-600 dark:text-red-400' : 
                                            tank.variance < 0 ? 'text-orange-600 dark:text-orange-400' : 
                                            tank.variance > 50 ? 'text-blue-600 dark:text-blue-400' : 
                                            'text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                            {tank.variance > 0 ? '+' : ''}{formatNumber(tank.variance)} L
                                        </span>
                                        {Math.abs(tank.variance) > 50 && (
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Detailed Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Incoming Stock Log */}
                <Card className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                    <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2 dark:text-white dark:border-white/10">سجل الوارد (المشتريات)</Title>
                    {stats?.warehouse?.incoming_stock?.list?.length > 0 ? (
                        <div className="overflow-x-auto max-h-80 overflow-y-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 dark:bg-white/5 dark:text-slate-400">
                                    <tr>
                                        <th className="p-3">التاريخ</th>
                                        <th className="p-3">المورد</th>
                                        <th className="p-3">الخزان</th>
                                        <th className="p-3">الكمية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                    {stats.warehouse.incoming_stock.list.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                            <td className="p-3 whitespace-nowrap dark:text-slate-300">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold dark:text-white">{item.supplier_name}</td>
                                            <td className="p-3 text-xs dark:text-slate-400">{item.tank_name}</td>
                                            <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{formatNumber(item.volume_received)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Text className="text-center py-6 text-slate-400">لا توجد عمليات واردة في هذه الفترة</Text>
                    )}
                </Card>

                {/* Tank Readings Log */}
                <Card className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                    <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2 dark:text-white dark:border-white/10">سجل قراءات الخزانات (المعايرة والقياس)</Title>
                    {stats?.warehouse?.readings?.length > 0 ? (
                        <div className="overflow-x-auto max-h-80 overflow-y-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 dark:bg-white/5 dark:text-slate-400">
                                    <tr>
                                        <th className="p-3">التاريخ</th>
                                        <th className="p-3">وقت المعايرة</th>
                                        <th className="p-3">الخزان</th>
                                        <th className="p-3">مشرف الوردية</th>
                                        <th className="p-3">القراءة السابقة</th>
                                        <th className="p-3">القراءة الحالية</th>
                                        <th className="p-3">عجز وزيادة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                    {stats.warehouse.readings.map((reading, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                            <td className="p-3 whitespace-nowrap dark:text-slate-300">
                                                {new Date(reading.created_at).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="p-3 whitespace-nowrap dark:text-slate-300 font-mono text-xs">
                                                {new Date(reading.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </td>
                                            <td className="p-3 font-bold dark:text-white">{reading.tank_name}</td>
                                            <td className="p-3 text-xs text-slate-600 dark:text-slate-400">{reading.user_name || '-'}</td>
                                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                                                {reading.previous_quantity ? formatNumber(reading.previous_quantity) : '-'}
                                            </td>
                                            <td className="p-3 font-mono font-bold text-slate-700 dark:text-white">
                                                {formatNumber(reading.volume_liters)}
                                            </td>
                                            <td className={`p-3 font-mono font-bold ${
                                                parseFloat(reading.variance) < 0 ? 'text-red-600 dark:text-red-400' : 
                                                parseFloat(reading.variance) > 0 ? 'text-lime-600 dark:text-lime-400' : 
                                                'text-slate-400'
                                            }`}>
                                                {parseFloat(reading.variance) > 0 && '+'}
                                                {formatNumber(reading.variance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Text className="text-center py-6 text-slate-400">لا توجد قراءات مسجلة في هذه الفترة</Text>
                    )}
                </Card>
            </div>

            {/* NEW: Calibration Logs Table */}
            {stats?.warehouse?.calibration_logs && stats.warehouse.calibration_logs.length > 0 && (
                <Card className="bg-white mt-6 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                    <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2 dark:text-white dark:border-white/10">سجل المعايرة</Title>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 dark:bg-white/5 dark:text-slate-400">
                                <tr>
                                    <th className="p-3">التاريخ</th>
                                    <th className="p-3">الخزان</th>
                                    <th className="p-3">المستخدم</th>
                                    <th className="p-3">الرصيد السابق</th>
                                    <th className="p-3">الكمية الفعلية</th>
                                    <th className="p-3">الفرق</th>
                                    <th className="p-3">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {stats.warehouse.calibration_logs.map((log, idx) => (
                                    <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-white/5 ${log.tank_updated ? 'bg-amber-50/30' : ''}`}>
                                        <td className="p-3 whitespace-nowrap text-xs dark:text-slate-300">
                                            {new Date(log.created_at).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-3 font-bold text-slate-700 dark:text-white">{log.tank_name}</td>
                                        <td className="p-3 text-xs text-slate-600 dark:text-slate-400">{log.user_name || 'غير معروف'}</td>
                                        <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{formatNumber(log.previous_quantity)} L</td>
                                        <td className="p-3 font-mono text-indigo-600 font-bold dark:text-indigo-400">{formatNumber(log.actual_quantity)} L</td>
                                        <td className={`p-3 font-mono font-bold ${
                                            parseFloat(log.variance) > 0 ? 'text-green-600' : 
                                            parseFloat(log.variance) < 0 ? 'text-red-600' : 
                                            'text-gray-600'
                                        }`}>
                                            {parseFloat(log.variance) > 0 && '+'}{formatNumber(log.variance)} L
                                            <span className="text-xs ml-2">
                                                {parseFloat(log.variance) > 0 ? '(زيادة)' : 
                                                 parseFloat(log.variance) < 0 ? '(عجز)' : 
                                                 '(متطابق)'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        💡 السجلات ذات الخلفية الصفراء تشير إلى تحديث رصيد الخزان مباشرة من المعايرة
                    </div>
                </Card>
            )}

            {/* Pending Shipments Section - NEW */}
            <Card className="bg-white mt-6 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-white/10">
                    <Title className="text-slate-700 flex items-center gap-2 dark:text-white">
                        <Truck className="w-5 h-5 text-orange-500" />
                        تناكر شاحنة
                    </Title>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        {stats?.warehouse?.pending_shipments?.length || 0} تنكر معلق
                    </Badge>
                </div>
                
                {stats?.warehouse?.pending_shipments?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.warehouse.pending_shipments.map((shipment, idx) => {
                            const daysAgo = Math.floor((new Date() - new Date(shipment.created_at)) / (1000 * 60 * 60 * 24));
                            const isDelayed = daysAgo > 3;
                            
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md dark:bg-white/5 ${
                                        isDelayed 
                                        ? 'border-red-200 bg-red-50/50 hover:border-red-300 dark:border-red-900/50 dark:bg-red-900/20' 
                                        : 'border-orange-200 bg-orange-50/30 hover:border-orange-300 dark:border-orange-900/50 dark:bg-orange-900/20'
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                isDelayed ? 'bg-red-500' : 'bg-orange-500'
                                            }`}>
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">#{shipment.invoice_number}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{shipment.supplier_name}</div>
                                            </div>
                                        {isDelayed && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                                                تأخير!
                                            </span>
                                        )}
                                    </div>
                                </div>
                                    
                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">نوع الوقود:</span>
                                            <span className="font-bold text-slate-700 flex items-center gap-1 dark:text-slate-200">
                                                <span 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: shipment.fuel_color || '#94a3b8' }}
                                                ></span>
                                                {shipment.fuel_type || 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">الكمية:</span>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                                {formatNumber(shipment.volume_ordered)} L
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">السائق:</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-200">
                                                {shipment.driver_name_resolved || shipment.driver_name || 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">التاريخ:</span>
                                            <span className="font-mono text-slate-600 text-xs dark:text-slate-400">
                                                {new Date(shipment.created_at).toLocaleDateString('ar-EG')}
                                                <span className={`mr-1 ${isDelayed ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                    ({daysAgo} {daysAgo === 1 ? 'يوم' : 'أيام'})
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Status Banner */}
                                    <div className={`mt-3 pt-3 border-t ${isDelayed ? 'border-red-200 dark:border-red-900/50' : 'border-orange-200 dark:border-orange-900/50'} text-center`}>
                                        <span className={`text-xs font-bold ${isDelayed ? 'text-red-700' : 'text-orange-700'}`}>
                                            {shipment.status === 'ordered' && '📦 تم الطلب'}
                                            {shipment.status === 'in_transit' && '🚚 في الطريق'}
                                            {shipment.status === 'arrived' && '✅ وصلت - بانتظار التفريغ'}
                                            {shipment.status === 'offloading' && '⏳ جاري التفريغ'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="flex flex-col items-center text-slate-400">
                            <CheckCircle className="w-16 h-16 mb-3 text-emerald-400" />
                            <Text className="font-bold text-slate-600">ممتاز! جميع التناكر تم تفريغها</Text>
                            <Text className="text-sm mt-1">لا توجد تناكر شاحنة في الوقت الحالي</Text>
                        </div>
                    </div>
                )}
            </Card>

            {/* Daily Stock Reconciliation Table */}
            <div className="mt-6 relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-indigo-200/50 shadow-xl dark:bg-white/5 dark:backdrop-blur-xl dark:border-indigo-500/30 dark:shadow-indigo-500/10 dark:shadow-xl">
                {/* Gradient Header */}
                <div className="px-6 py-4 border-b border-indigo-100/50 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-500/10 dark:to-purple-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-800 dark:text-white">تفاصيل حركة المخزون اليومية</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">مطابقة الأرصدة</div>
                        </div>
                    </div>
                </div>
                
                {stats?.warehouse?.daily_reconciliation?.length > 0 ? (
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="border-b-2 border-indigo-100/50 dark:border-indigo-500/20">
                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">التاريخ</th>
                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">الخزان</th>
                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">رصيد أول المدة</th>
                                    <th className="p-3 text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">وارد (+)</th>
                                    <th className="p-3 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">منصرف (-)</th>
                                    <th className="p-3 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">رصيد نظري (=)</th>
                                    <th className="p-3 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">رصيد فعلي (قياس)</th>
                                    <th className="p-3 text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">الفارق</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.warehouse.daily_reconciliation.map((row, idx) => {
                                    const hasVariance = row.actual !== null && row.variance !== 0;
                                    const isNegativeVariance = row.variance < 0;
                                    return (
                                    <tr key={idx} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors group">
                                        <td className="p-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">{row.date}</td>
                                        <td className="p-3 font-bold text-slate-800 dark:text-white">{row.tank_name}</td>
                                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                                            {parseFloat(row.opening) !== 0 ? formatNumber(row.opening) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="p-3 font-mono font-bold">
                                            {parseFloat(row.in) !== 0 ? (
                                                <span className="text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md">+{formatNumber(row.in)}</span>
                                            ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="p-3 font-mono font-bold">
                                            {parseFloat(row.out) !== 0 ? (
                                                <span className="text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-500/10 px-2 py-0.5 rounded-md">-{formatNumber(row.out)}</span>
                                            ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="p-3 font-mono font-black text-blue-700 dark:text-blue-400">{formatNumber(row.theoretical)}</td>
                                        <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-400">
                                            {row.actual !== null ? formatNumber(row.actual) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                        <td className="p-3">
                                            {row.actual !== null ? (
                                                hasVariance ? (
                                                    <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-lg text-xs shadow-sm ${
                                                        isNegativeVariance 
                                                        ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200/50 dark:from-red-500/20 dark:to-red-600/20 dark:text-red-400 dark:border-red-500/30' 
                                                        : 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200/50 dark:from-emerald-500/20 dark:to-green-600/20 dark:text-emerald-400 dark:border-emerald-500/30'
                                                    }`}>
                                                        {isNegativeVariance ? '▼' : '▲'} {formatNumber(row.variance)}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-lg text-xs bg-slate-50 text-slate-500 border border-slate-200/50 dark:bg-white/5 dark:text-slate-400 dark:border-white/10">
                                                        ✓ متطابق
                                                    </span>
                                                )
                                            ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <div className="font-medium">لا توجد حركات مخزون في هذه الفترة</div>
                    </div>
                )}
            </div>
            </>
        ) : warehouseTab === 1 ? (
            <TankSalesReport stationId={user?.station_id} />
        ) : (
            <TankTransactionReport stationId={user?.station_id} />
        )}
    </div>
    );
    
    // Sales Cards - REFACTORED
    const [salesTab, setSalesTab] = useState(0); // 0: Overview, 1: Daily Report, 2: Tank Report
    
    // Check subtab param for sales
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') === 'sales' && params.get('subtab') === 'tank_sales') {
            setSalesTab(2);
        }
    }, []);

    const renderSales = () => (
        <div className="animate-fade-in space-y-6">
            {/* Sales Sub-Navigation - Glassmorphism style matching warehouse */}
            <div className="flex gap-2 p-1.5 bg-white/50 backdrop-blur-xl rounded-xl w-fit border border-slate-200/50 shadow-sm dark:bg-white/5 dark:border-white/10 mb-6">
                <button
                    onClick={() => setSalesTab(0)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        salesTab === 0 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    نظرة عامة
                </button>
                <button
                    onClick={() => setSalesTab(1)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        salesTab === 1 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    التقرير اليومي
                </button>
                <button
                    onClick={() => setSalesTab(2)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        salesTab === 2 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'
                    }`}
                >
                    مبيعات الآبار
                </button>
            </div>

            {/* Sales Content Based on Sub-Tab */}
            {salesTab === 0 ? (
                <div className="space-y-6">
                    {/* Summary Cards - Glassmorphism */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                            <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-violet-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-violet-500/30 dark:shadow-violet-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">إجمالي المبيعات (إيراد)</div>
                                        <div className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(stats?.sales?.total_revenue)}</div>
                                    </div>
                                </div>
                                <div className="relative z-10 mt-4 pt-4 border-t border-violet-100/50 dark:border-violet-500/20 flex justify-between items-center">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">عدد العمليات</span>
                                    <span className="font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-50/80 dark:bg-violet-500/10 px-3 py-1 rounded-lg">{stats?.sales?.total_transactions}</span>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-indigo-500/30 dark:shadow-indigo-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                        <Droplets className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">الكميات المباعة</div>
                                        <div className="text-2xl font-black text-slate-800 dark:text-white">{formatNumber(stats?.sales?.total_liters)} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">لتر</span></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Product breakdown - Glassmorphism */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-purple-500/30 dark:shadow-purple-500/10 dark:shadow-lg">
                                {/* Gradient Header */}
                                <div className="px-6 py-4 border-b border-purple-100/50 dark:border-purple-500/20 bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-500/10 dark:to-violet-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                            <Activity className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-base font-black text-slate-800 dark:text-white">تحليل المبيعات حسب المنتج</div>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    {stats?.sales?.by_product?.length > 0 ? (
                                        stats.sales.by_product.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-100/80 hover:bg-white/90 hover:shadow-md transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-800" style={{ backgroundColor: item.color_hex || '#94a3b8' }}></div>
                                                    <span className="font-bold text-slate-700 dark:text-white">{item.product_name}</span>
                                                </div>
                                                <div className="flex gap-4 text-sm">
                                                    <div className="text-slate-500 dark:text-slate-400">
                                                        <span className="font-bold font-mono text-blue-700 dark:text-blue-400">{formatNumber(item.total_liters)}</span> لتر
                                                    </div>
                                                    <div className="text-slate-500 dark:text-slate-400 font-mono">
                                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatNumber(item.total_revenue)}</span> SDG
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-slate-400 dark:text-slate-500 py-8">لا توجد بيانات مبيعات تفصيلية لهذه الفترة</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Sales Table - Glassmorphism */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-emerald-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-emerald-500/30 dark:shadow-emerald-500/10 dark:shadow-lg">
                                {/* Gradient Header */}
                                <div className="px-6 py-4 border-b border-emerald-100/50 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-500/10 dark:to-teal-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-base font-black text-slate-800 dark:text-white">المبيعات الأخيرة (مباشر)</div>
                                    </div>
                                </div>
                                {stats?.sales?.recent_sales?.length > 0 ? (
                                    <div className="overflow-x-auto p-4">
                                        <table className="w-full text-right text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-emerald-100/50 dark:border-emerald-500/20">
                                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">الوقت</th>
                                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">المكنة</th>
                                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">الكمية</th>
                                                    <th className="p-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">المبلغ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.sales.recent_sales.map((sale, idx) => (
                                                    <tr key={idx} className="border-b border-slate-100/50 dark:border-white/5 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-colors">
                                                        <td className="p-3 whitespace-nowrap text-slate-400 dark:text-slate-500 text-xs font-mono">
                                                            {new Date(sale.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="font-bold text-slate-700 dark:text-white">{sale.pump_name}</span>
                                                            <span className="block text-xs text-slate-400 dark:text-slate-500">{sale.fuel_type}</span>
                                                        </td>
                                                        <td className="p-3 font-mono font-bold">
                                                            <span className="text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">{formatNumber(sale.volume_sold)}</span>
                                                        </td>
                                                        <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(sale.total_amount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400 dark:text-slate-500 py-10">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <div className="font-medium">لا توجد مبيعات حديثة</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            ) : salesTab === 1 ? (
                <DailySalesReconciliation stationId={filters.station_id} />
            ) : (
                <TankSalesReport stationId={filters.station_id} />
            )}
        </div>
    );
    
    // Employee Cards - REFACTORED
    const renderEmployees = () => {
        const empList = stats?.employees?.list || [];
        
        // Find top performers
        const topSales = [...empList].sort((a, b) => b.total_sales - a.total_sales)[0];
        const topVolume = [...empList].sort((a, b) => b.total_volume - a.total_volume)[0];
        const mostShifts = [...empList].sort((a, b) => b.shifts_count - a.shifts_count)[0];

        return (
            <div className="space-y-6 animate-fade-in">
                {/* 1. Leaderboard Cards - Glassmorphism */}
                {empList.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Top Sales */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                            <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-emerald-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-emerald-500/30 dark:shadow-emerald-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10" />
                                <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10">
                                    <Users className="w-24 h-24 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">الأعلى مبيعاً (إيراد)</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                            1
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-slate-800 dark:text-white">{topSales?.worker_name}</div>
                                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(topSales?.total_sales)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Top Volume */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-blue-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-blue-500/30 dark:shadow-blue-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10" />
                                <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10">
                                    <Droplets className="w-24 h-24 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">الأكثر مبيعاً (كمية)</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            1
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-slate-800 dark:text-white">{topVolume?.worker_name}</div>
                                            <div className="text-xl font-black text-blue-600 dark:text-blue-400">{formatNumber(topVolume?.total_volume)} لتر</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Most Shifts */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 backdrop-blur-xl border border-amber-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-amber-500/30 dark:shadow-amber-500/10 dark:shadow-lg transition-all hover:shadow-xl group">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                                <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10">
                                    <Briefcase className="w-24 h-24 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">الأكثر حضوراً (ورديات)</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                                            ★
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-slate-800 dark:text-white">{mostShifts?.worker_name}</div>
                                            <div className="text-xl font-black text-amber-600 dark:text-amber-400">{mostShifts?.shifts_count} وردية</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                     </div>
                )}

                {/* 2. Detailed Performance Table - Glassmorphism */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-amber-200/50 shadow-lg dark:bg-white/5 dark:backdrop-blur-xl dark:border-amber-500/30 dark:shadow-amber-500/10 dark:shadow-lg">
                        <div className="px-6 py-4 border-b border-amber-100/50 dark:border-amber-500/20 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-500/10 dark:to-orange-500/10">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-base font-black text-slate-800 dark:text-white">سجل الأداء والمستحقات</div>
                                </div>
                                <span className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-amber-200/50 text-sm font-bold text-amber-700 dark:bg-white/10 dark:border-amber-500/20 dark:text-amber-400">
                                    {empList.length} موظف نشط
                                </span>
                            </div>
                        </div>
                    
                        <div className="p-5">
                            {empList.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm border-separate border-spacing-y-2">
                                        <thead>
                                            <tr>
                                                <th className="p-3 rounded-r-lg bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-500/15 dark:to-orange-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase">الموظف</th>
                                                <th className="p-3 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-500/15 dark:to-orange-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase">الورديات</th>
                                                <th className="p-3 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-500/15 dark:to-orange-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase">المبيعات (لتر)</th>
                                                <th className="p-3 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-500/15 dark:to-orange-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase">المبيعات (إيراد)</th>
                                                <th className="p-3 bg-gradient-to-r from-emerald-100/80 to-green-100/80 dark:from-emerald-500/15 dark:to-green-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase">الحوافز (+)</th>
                                                <th className="p-3 bg-gradient-to-r from-rose-100/80 to-red-100/80 dark:from-rose-500/15 dark:to-red-500/15 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase">الخصومات (-)</th>
                                                <th className="p-3 rounded-l-lg bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-500/15 dark:to-orange-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase">مؤشر الأداء</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empList.map((emp, idx) => {
                                                const maxVol = topVolume?.total_volume || 1;
                                                const efficiency = (emp.total_volume / maxVol) * 100;
                                                
                                                return (
                                                    <tr key={idx} className="bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:shadow-md transition-all group dark:bg-white/5 dark:hover:bg-white/10">
                                                        <td className="p-3 border-y border-r border-slate-100/50 dark:border-white/10 rounded-r-xl font-bold text-slate-700 dark:text-white">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 text-xs font-black">
                                                                    {emp.worker_name.charAt(0)}
                                                                </div>
                                                                {emp.worker_name}
                                                                {emp === topSales && <span className="text-emerald-500 text-xs">👑</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 border-y border-slate-100/50 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono">
                                                            {emp.shifts_count}
                                                        </td>
                                                        <td className="p-3 border-y border-slate-100/50 dark:border-white/10 font-mono text-blue-600 dark:text-blue-400 font-medium">
                                                            {formatNumber(emp.total_volume)}
                                                        </td>
                                                        <td className="p-3 border-y border-slate-100/50 dark:border-white/10 font-mono font-bold text-slate-700 dark:text-white">
                                                            {formatCurrency(emp.total_sales)}
                                                        </td>
                                                        <td className="p-3 border-y border-slate-100/50 dark:border-white/10 font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/5 group-hover:bg-emerald-100/50 dark:group-hover:bg-emerald-500/10 transition-colors">
                                                            {emp.bonuses > 0 ? formatNumber(emp.bonuses) : '-'}
                                                        </td>
                                                        <td className="p-3 border-y border-l border-slate-100/50 dark:border-white/10 font-mono text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-500/5 group-hover:bg-red-100/50 dark:group-hover:bg-red-500/10 transition-colors">
                                                            {emp.deductions > 0 ? formatNumber(emp.deductions) : '-'}
                                                        </td>
                                                        <td className="p-3 border-y border-l border-slate-100/50 dark:border-white/10 rounded-l-xl">
                                                             <div className="w-24 h-2 bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                                                                 <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${efficiency}%` }}
                                                                    transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                                                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full shadow-sm"
                                                                 />
                                                             </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                                    <Users className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-600" />
                                    <div className="text-sm">لا توجد بيانات للأداء الوظيفي في هذه الفترة</div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto min-h-screen space-y-6">
            


            {/* Sub Navigation */}
            <TabGroup index={activeTab} onIndexChange={setActiveTab}>
                <TabList variant="solid" className="bg-white/80 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:ring-white/10">
                    {/* LOCAL REPORTS SECTION */}
                    <div className="hidden md:inline-flex items-center px-3 py-1 bg-slate-100/50 rounded-lg mr-2 dark:bg-white/5 mx-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">📍 تقارير محلية</span>
                    </div>
                    
                     <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-emerald-600 ui-selected:text-white ui-selected:shadow-md transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5"/> <span>المالية</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-blue-600 ui-selected:text-white ui-selected:shadow-md transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                             <Droplets className="w-5 h-5"/> <span>المستودعات</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-violet-600 ui-selected:text-white ui-selected:shadow-md transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                             <TrendingUp className="w-5 h-5"/> <span>المبيعات</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-amber-500 ui-selected:text-white ui-selected:shadow-md transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                             <Users className="w-5 h-5"/> <span>الموظفين</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-gradient-to-r ui-selected:from-indigo-600 ui-selected:to-purple-600 ui-selected:text-white ui-selected:shadow-lg transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                             <Brain className="w-5 h-5"/> <span>تقفيل اليوم</span>
                        </div>
                    </Tab>

                    {/* DIVIDER */}
                    <div className="hidden md:inline-block w-px h-8 bg-slate-200 mx-3 dark:bg-white/10"></div>

                    {/* GLOBAL REPORTS SECTION */}
                    <div className="hidden md:inline-flex items-center px-3 py-1 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 rounded-lg mr-2 dark:from-cyan-900/20 dark:to-blue-900/20">
                        <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider dark:text-cyan-400">🌍 تقارير عامة</span>
                    </div>
                    
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-gradient-to-r ui-selected:from-cyan-600 ui-selected:to-blue-600 ui-selected:text-white ui-selected:shadow-lg transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                             <Truck className="w-5 h-5"/> <span>تقرير مورد</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-gradient-to-r ui-selected:from-emerald-600 ui-selected:to-green-600 ui-selected:text-white ui-selected:shadow-lg transition-all dark:text-slate-400 dark:ui-selected:text-white">
                        <div className="flex items-center gap-2">
                             <Users className="w-5 h-5"/> <span>تقرير عميل</span>
                        </div>
                    </Tab>
                </TabList>

                {/* Content Grid */}
                <div className="mt-8">
                    {activeTab === 0 && renderFinancial()}
                    {activeTab === 1 && renderWarehouse()}
                    {activeTab === 2 && renderSales()}
                    {activeTab === 3 && renderEmployees()}
                    {/* GLOBAL REPORTS */}
                    {activeTab === 4 && <DailyClosingReport stationId={filters.station_id} />}
                    {/* GLOBAL REPORTS */}
                    {activeTab === 5 && <SupplierReport stationId={filters.station_id} />}
                    {activeTab === 6 && <CustomerReport stationId={filters.station_id} />}
                </div>
            </TabGroup>
        </div>
    );
}
