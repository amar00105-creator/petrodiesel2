import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Filter, PieChart, TrendingUp, DollarSign, Droplets, Users, FileText, Briefcase, Activity, Truck, CheckCircle, Wallet, BarChart3, Gauge, Calendar } from 'lucide-react';
import { TabGroup, TabList, Tab, Title, Text, Card, Metric, Flex, BadgeDelta, Grid, Badge } from '@tremor/react';
import { toast } from 'sonner';
import DailySalesReconciliation from './DailySalesReconciliation';
import TankSalesReport from './TankSalesReport';
import SupplierReport from './SupplierReport';
import CustomerReport from './CustomerReport';
import FinancialFlowReport from './FinancialFlowReport';
import ProfitLossReport from './ProfitLossReport';
import LossReport from './LossReport';
import PumpPerformanceReport from './PumpPerformanceReport';
import WorkerPerformanceReport from './WorkerPerformanceReport';
import MonthlyComparisonReport from './MonthlyComparisonReport';
import AlertsPanel from './components/AlertsPanel';

export default function Reports({ user }) {
    // --- State ---
    const [activeTab, setActiveTab] = useState(0); // 0: Financial, 1: Warehouse, 2: Sales, 3: Employees
    
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
        period: 'month' // month, quarter, year, custom
    });
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

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

    // Initialize dates from server on mount
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
        initializeDates();
    }, []);

    useEffect(() => {
        // Only fetch if dates are set
        if (filters.start_date && filters.end_date) {
            fetchStats();
        }
    }, [filters.start_date, filters.end_date]); // Fetch when dates are initialized

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

    // Financial Cards - ENHANCED
    const renderFinancial = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Financial Sub-Navigation */}
            <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl w-fit dark:bg-white/5">
                <button
                    onClick={() => setFinancialTab(0)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        financialTab === 0 ? 'bg-white shadow text-blue-700 dark:bg-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                    نظرة عامة
                </button>
                <button
                    onClick={() => setFinancialTab(1)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        financialTab === 1 ? 'bg-white shadow text-blue-700 dark:bg-blue-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                    كشف حساب (خزنة/بنك)
                </button>
            </div>

            {financialTab === 0 ? (
                <>
                {/* Summary Row - 4 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Net Profit */}
                    <Card decoration="top" decorationColor="emerald" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-500/20 dark:text-emerald-400">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                                <Text className="dark:text-slate-400">صافي الربح / الخسارة</Text>
                                <Metric className={stats?.financial?.net_profit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                    {formatCurrency(stats?.financial?.net_profit)}
                                </Metric>
                            </div>
                        </Flex>
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 dark:border-white/10">
                            <div>
                                <Text className="text-xs dark:text-slate-400">الإيرادات</Text>
                                <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.financial?.income)}</div>
                            </div>
                            <div>
                                <Text className="text-xs dark:text-slate-400">المصروفات</Text>
                                <div className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats?.financial?.expense)}</div>
                            </div>
                        </div>
                    </Card>

                    {/* Total Cash (Banks + Safes) */}
                    <Card decoration="top" decorationColor="indigo" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl dark:bg-indigo-500/20 dark:text-indigo-400">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <Text className="dark:text-slate-400">إجمالي النقد المتاح</Text>
                                <Metric className="text-indigo-700 dark:text-indigo-400">
                                    {formatCurrency(stats?.financial?.total_cash)}
                                </Metric>
                            </div>
                        </Flex>
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 dark:border-white/10">
                            <div>
                                <Text className="text-xs dark:text-slate-400">الخزائن ({stats?.financial?.safes?.length || 0})</Text>
                                <div className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats?.financial?.total_safes)}</div>
                            </div>
                            <div>
                                <Text className="text-xs dark:text-slate-400">البنوك ({stats?.financial?.banks?.length || 0})</Text>
                                <div className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(stats?.financial?.total_banks)}</div>
                            </div>
                        </div>
                    </Card>

                    {/* Inventory Valuation */}
                    <Card decoration="top" decorationColor="blue" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-500/20 dark:text-blue-400">
                                <Droplets className="w-8 h-8" />
                            </div>
                            <div>
                                <Text className="dark:text-slate-400">قيمة المخزون اللحظي</Text>
                                <Metric className="dark:text-white">{formatCurrency(stats?.financial?.inventory_value)}</Metric>
                            </div>
                        </Flex>
                        <Text className="mt-2 text-slate-400 text-xs">مجموع (حجم الخزان × السعر الحالي)</Text>
                    </Card>

                    {/* Debts Summary */}
                    <Card decoration="top" decorationColor="amber" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                         <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-500/20 dark:text-amber-400">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <div>
                                <Text className="dark:text-slate-400">الذمم والديون</Text>
                                <div className="text-2xl font-bold text-slate-700 dark:text-white">ملخص الأرصدة</div>
                            </div>
                        </Flex>
                        <div className="mt-4 space-y-3">
                            <Flex className="justify-between">
                                <Text className="dark:text-slate-400">ديون الشركات (لنا)</Text>
                                <Text className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats?.financial?.corporate_debts)}</Text>
                            </Flex>
                            <Flex className="justify-between">
                                <Text className="dark:text-slate-400">التزامات الموردين (علينا)</Text>
                                <Text className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats?.financial?.supplier_debts)}</Text>
                            </Flex>
                        </div>
                    </Card>
                </div>

                {/* Detail Grids */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Banks & Safes Details */}
                    <Card className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Title className="text-slate-800 mb-4 dark:text-white">💰 تفاصيل الأرصدة النقدية</Title>
                        <div className="space-y-4">
                            {/* Safes */}
                            <div>
                                <Text className="font-bold text-blue-600 mb-2 dark:text-blue-400">الخزائن</Text>
                                <div className="space-y-2">
                                    {stats?.financial?.safes?.map((safe, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{safe.name}</span>
                                            <span className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(safe.balance)}</span>
                                        </div>
                                    ))}
                                    {(!stats?.financial?.safes || stats?.financial?.safes.length === 0) && (
                                        <div className="text-slate-400 text-sm text-center py-2">لا توجد خزائن</div>
                                    )}
                                </div>
                            </div>
                            {/* Banks */}
                            <div>
                                <Text className="font-bold text-indigo-600 mb-2 dark:text-indigo-400">البنوك</Text>
                                <div className="space-y-2">
                                    {stats?.financial?.banks?.map((bank, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
                                            <div>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{bank.name}</span>
                                                {bank.account_number && (
                                                    <span className="text-xs text-slate-400 mr-2">({bank.account_number})</span>
                                                )}
                                            </div>
                                            <span className="font-bold text-indigo-700 dark:text-indigo-400">{formatCurrency(bank.balance)}</span>
                                        </div>
                                    ))}
                                    {(!stats?.financial?.banks || stats?.financial?.banks.length === 0) && (
                                        <div className="text-slate-400 text-sm text-center py-2">لا توجد حسابات بنكية</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Expense Breakdown */}
                    <Card className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Title className="text-slate-800 mb-4 dark:text-white">📊 توزيع المصروفات حسب الفئة</Title>
                        <div className="space-y-3">
                            {stats?.financial?.expense_breakdown?.map((cat, idx) => {
                                const percentage = stats?.financial?.expense > 0 
                                    ? (cat.total_amount / stats.financial.expense * 100).toFixed(1) 
                                    : 0;
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category_name}</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(cat.total_amount)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-700">
                                            <div 
                                                className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>{cat.transaction_count} عملية</span>
                                            <span>{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!stats?.financial?.expense_breakdown || stats?.financial?.expense_breakdown.length === 0) && (
                                <div className="text-slate-400 text-sm text-center py-4">لا توجد مصروفات في هذه الفترة</div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Top Customers & Suppliers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Customers (who owe us) */}
                    <Card className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Title className="text-slate-800 mb-4 dark:text-white">👥 أكبر العملاء المدينين (لنا)</Title>
                        <div className="space-y-2">
                            {stats?.financial?.top_customers?.map((customer, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{customer.name}</span>
                                    </div>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(customer.balance)}</span>
                                </div>
                            ))}
                            {(!stats?.financial?.top_customers || stats?.financial?.top_customers.length === 0) && (
                                <div className="text-slate-400 text-sm text-center py-4">لا توجد ديون من العملاء</div>
                            )}
                        </div>
                    </Card>

                    {/* Top Suppliers (we owe them) */}
                    <Card className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Title className="text-slate-800 mb-4 dark:text-white">🚛 أكبر الموردين الدائنين (علينا)</Title>
                        <div className="space-y-2">
                            {stats?.financial?.top_suppliers?.map((supplier, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{supplier.name}</span>
                                    </div>
                                    <span className="font-bold text-rose-700 dark:text-rose-400">{formatCurrency(supplier.balance)}</span>
                                </div>
                            ))}
                            {(!stats?.financial?.top_suppliers || stats?.financial?.top_suppliers.length === 0) && (
                                <div className="text-slate-400 text-sm text-center py-4">لا توجد التزامات للموردين</div>
                            )}
                        </div>
                    </Card>
                </div>
                </>
            ) : (
                <FinancialFlowReport initialGroup={new URLSearchParams(window.location.search).get('group')} />
            )}
        </div>
    );

    // Warehouse Cards
    const renderWarehouse = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card decoration="top" decorationColor="blue" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                    <Text className="dark:text-slate-400">قيمة المخزون الحالي</Text>
                    <Metric className="mt-2 text-blue-700 dark:text-blue-400">{formatCurrency(stats?.financial?.inventory_value)}</Metric>
                </Card>
                <Card decoration="top" decorationColor="cyan" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                    <Text className="dark:text-slate-400">الوارد (مشتريات) للفترة</Text>
                    <Metric className="mt-2 text-cyan-700 dark:text-cyan-400">{formatNumber(stats?.warehouse?.incoming_stock?.total_volume)} <span className="text-sm">لتر</span></Metric>
                    <Text className="mt-2 text-xs text-slate-400">بتكلفة: {formatCurrency(stats?.warehouse?.incoming_stock?.total_cost)}</Text>
                </Card>
                <Card decoration="top" decorationColor="orange" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                     <Text className="dark:text-slate-400">فاقد التبخر (تقديري)</Text>
                     <Metric className="mt-2 text-orange-700 dark:text-orange-400">{formatNumber(stats?.financial?.evaporation_loss)} <span className="text-sm">لتر</span></Metric>
                     <Text className="mt-2 text-xs text-slate-400">حسب التباين بين الأرصدة</Text>
                </Card>
            </div>

            <Title className="text-slate-700 mt-4 mb-2">تفاصيل المستودعات والمعايرة</Title>
            
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

                    const getFuelBg = (fuelName) => {
                        const fuel = (fuelName || '').toLowerCase();
                        if (fuel.includes('diesel') || fuel.includes('ديزل')) return 'bg-amber-50';
                        if (fuel.includes('petrol') || fuel.includes('بنزين') || fuel.includes('91') || fuel.includes('95')) return 'bg-emerald-50';
                        if (fuel.includes('gas') || fuel.includes('غاز')) return 'bg-purple-50';
                        return 'bg-blue-50';
                    };

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 ${
                                isCritical ? 'border-red-300 animate-pulse' : isLow ? 'border-orange-300' : 'border-slate-200'
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
                                <Flex justifyContent="between" alignItems="start" className="relative z-10">
                                    <div>
                                        <Text className="font-bold text-slate-800 text-lg">{tank.name}</Text>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getFuelGradient(tank.fuel)}`} />
                                            <Text className="text-xs text-slate-500">{tank.fuel}</Text>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getFuelGradient(tank.fuel)} text-white shadow-lg`}>
                                        {fillPercentage.toFixed(1)}%
                                    </div>
                                </Flex>
                                
                                {/* Visual Tank Gauge */}
                                <div className="mt-6 mb-4 relative z-10">
                                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${fillPercentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r ${getFuelGradient(tank.fuel)} shadow-lg`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 mt-1.5 font-mono">
                                        <span>0</span>
                                        <span className="font-bold text-slate-600">{formatNumber(tank.volume)} L</span>
                                        <span>{formatNumber(tank.capacity)}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700">
                                        <Text className="text-xs text-slate-500 mb-1 dark:text-slate-400">القيمة الإجمالية</Text>
                                        <div className="font-bold text-emerald-600">{formatCurrency(tank.value)}</div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:bg-slate-800/80 dark:border-slate-700">
                                        <Text className="text-xs text-slate-500 mb-1 dark:text-slate-400">آخر معايرة</Text>
                                        <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {tank.last_calibration === 'N/A' ? 'غير متوفر' : new Date(tank.last_calibration).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Variance Indicator */}
                                <div className={`mt-3 pt-3 border-t border-slate-100 flex justify-between items-center relative z-10 dark:border-white/10`}>
                                    <Text className="text-xs text-slate-500">التباين (Variance)</Text>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-mono font-bold text-sm ${
                                            tank.variance < -50 ? 'text-red-600' : 
                                            tank.variance < 0 ? 'text-orange-600' : 
                                            tank.variance > 50 ? 'text-blue-600' : 
                                            'text-emerald-600'
                                        }`}>
                                            {tank.variance > 0 ? '+' : ''}{formatNumber(tank.variance)} L
                                        </span>
                                        {Math.abs(tank.variance) > 50 && (
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            </Card>
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
            <Card className="bg-white mt-6 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2 dark:text-white dark:border-white/10">تفاصيل حركة المخزون اليومية (مطابقة الأرصدة)</Title>
                {stats?.warehouse?.daily_reconciliation?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold dark:bg-white/5 dark:text-slate-400">
                                <tr>
                                    <th className="p-3">التاريخ</th>
                                    <th className="p-3">الخزان</th>
                                    <th className="p-3">رصيد أول المدة</th>
                                    <th className="p-3 text-cyan-600">وارد (+)</th>
                                    <th className="p-3 text-rose-600">منصرف (-)</th>
                                    <th className="p-3 text-blue-600">رصيد نظري (=)</th>
                                    <th className="p-3 text-purple-600">رصيد فعلي (قياس)</th>
                                    <th className="p-3">الفارق (Variance)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                {stats.warehouse.daily_reconciliation.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                        <td className="p-3 whitespace-nowrap dark:text-slate-300">{row.date}</td>
                                        <td className="p-3 font-bold dark:text-white">{row.tank_name}</td>
                                        <td className="p-3 font-mono">{formatNumber(row.opening)}</td>
                                        <td className="p-3 font-mono text-cyan-600">{formatNumber(row.in)}</td>
                                        <td className="p-3 font-mono text-rose-600">{formatNumber(row.out)}</td>
                                        <td className="p-3 font-mono font-bold text-blue-600">{formatNumber(row.theoretical)}</td>
                                        <td className="p-3 font-mono font-bold text-purple-600">
                                            {row.actual !== null ? formatNumber(row.actual) : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="p-3">
                                            {row.actual !== null ? (
                                                <span className={`font-mono font-bold px-2 py-1 rounded ${row.variance < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {formatNumber(row.variance)}
                                                </span>
                                            ) : <span className="text-slate-300">-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Text className="text-center py-6 text-slate-400">لا توجد حركات مخزون في هذه الفترة</Text>
                )}
            </Card>
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
            {/* Sales Sub-Navigation */}
            <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl w-fit">
                <button
                    onClick={() => setSalesTab(0)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        salesTab === 0 ? 'bg-white shadow text-violet-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    نظرة عامة
                </button>
                <button
                    onClick={() => setSalesTab(1)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        salesTab === 1 ? 'bg-white shadow text-violet-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    التقرير اليومي
                </button>
                <button
                    onClick={() => setSalesTab(2)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        salesTab === 2 ? 'bg-white shadow text-violet-700' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    مبيعات الآبار
                </button>
            </div>

            {/* Sales Content Based on Sub-Tab */}
            {salesTab === 0 ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card decoration="top" decorationColor="violet" className="bg-white">
                            <Text>إجمالي المبيعات (إيراد)</Text>
                            <Metric className="mt-2 text-violet-700">{formatCurrency(stats?.sales?.total_revenue)}</Metric>
                            <Flex className="mt-4 pt-4 border-t border-slate-100">
                                <Text>عدد العمليات</Text>
                                <Text className="font-bold">{stats?.sales?.total_transactions}</Text>
                            </Flex>
                        </Card>
                        
                        <Card decoration="top" decorationColor="indigo" className="bg-white">
                            <Text>الكميات المباعة</Text>
                            <Metric className="mt-2 text-indigo-700">{formatNumber(stats?.sales?.total_liters)} <span className="text-sm">لتر</span></Metric>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Product breakdown */}
                        <Card className="bg-white">
                            <Title className="mb-4">تحليل المبيعات حسب المنتج</Title>
                            <div className="space-y-4">
                                {stats?.sales?.by_product?.length > 0 ? (
                                    stats.sales.by_product.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color_hex || '#94a3b8' }}></div>
                                                <span className="font-bold text-slate-700">{item.product_name}</span>
                                            </div>
                                            <div className="flex gap-6 text-sm">
                                                <div className="text-slate-500">
                                                    <span className="font-bold text-slate-800">{formatNumber(item.total_liters)}</span> لتر
                                                </div>
                                                <div className="text-slate-500 font-mono">
                                                    <span className="font-bold text-slate-800">{formatNumber(item.total_revenue)}</span> SDG
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-400 py-6">لا توجد بيانات مبيعات تفصيلية لهذه الفترة</div>
                                )}
                            </div>
                        </Card>

                        {/* Recent Sales Table (New Feature) */}
                        <Card className="bg-white">
                            <Title className="mb-4">المبيعات الأخيرة (مباشر)</Title>
                            {stats?.sales?.recent_sales?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                            <tr>
                                                <th className="p-2">الوقت</th>
                                                <th className="p-2">المكنة</th>
                                                <th className="p-2">الكمية</th>
                                                <th className="p-2">المبلغ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {stats.sales.recent_sales.map((sale, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50">
                                                    <td className="p-2 whitespace-nowrap text-slate-400 text-xs">
                                                        {new Date(sale.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="p-2 font-medium">
                                                        {sale.pump_name}
                                                        <span className="block text-xs text-slate-400">{sale.fuel_type}</span>
                                                    </td>
                                                    <td className="p-2 font-mono text-blue-600">{formatNumber(sale.volume_sold)}</td>
                                                    <td className="p-2 font-mono font-bold text-emerald-600">{formatNumber(sale.total_amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 py-6">لا توجد مبيعات حديثة</div>
                            )}
                        </Card>
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
                {/* 1. Leaderboard Cards */}
                {empList.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Top Sales */}
                        <Card decoration="top" decorationColor="emerald" className="bg-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-3 opacity-10">
                                 <Users className="w-24 h-24 text-emerald-600" />
                             </div>
                             <Text>الأعلى مبيعاً (إيراد)</Text>
                             <div className="mt-4 flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl border-2 border-emerald-200">
                                     1
                                 </div>
                                 <div>
                                     <div className="text-lg font-bold text-slate-800">{topSales?.worker_name}</div>
                                     <Metric className="text-emerald-600 text-xl">{formatCurrency(topSales?.total_sales)}</Metric>
                                 </div>
                             </div>
                        </Card>

                        {/* Top Volume */}
                        <Card decoration="top" decorationColor="blue" className="bg-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-3 opacity-10">
                                 <Droplets className="w-24 h-24 text-blue-600" />
                             </div>
                             <Text>الأكثر مبيعاً (كمية)</Text>
                             <div className="mt-4 flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl border-2 border-blue-200">
                                     1
                                 </div>
                                 <div>
                                     <div className="text-lg font-bold text-slate-800">{topVolume?.worker_name}</div>
                                     <Metric className="text-blue-600 text-xl">{formatNumber(topVolume?.total_volume)} لتر</Metric>
                                 </div>
                             </div>
                        </Card>

                        {/* Most Shifts */}
                        <Card decoration="top" decorationColor="amber" className="bg-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-3 opacity-10">
                                 <Briefcase className="w-24 h-24 text-amber-600" />
                             </div>
                             <Text>الأكثر حضوراً (ورديات)</Text>
                             <div className="mt-4 flex items-center gap-3">
                                 <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl border-2 border-amber-200">
                                     ★
                                 </div>
                                 <div>
                                     <div className="text-lg font-bold text-slate-800">{mostShifts?.worker_name}</div>
                                     <Metric className="text-amber-600 text-xl">{mostShifts?.shifts_count} وردية</Metric>
                                 </div>
                             </div>
                        </Card>
                     </div>
                )}

                {/* 2. Detailed Performance Table */}
                <Card className="bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <Title className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-500" />
                            سجل الأداء والمستحقات
                        </Title>
                        <Badge className="bg-slate-100 text-slate-600">
                            {empList.length} موظف نشط
                        </Badge>
                    </div>
                    
                    {empList.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm border-separate border-spacing-y-2">
                                <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                                    <tr>
                                        <th className="p-3 rounded-r-lg">الموظف</th>
                                        <th className="p-3">الورديات</th>
                                        <th className="p-3">المبيعات (لتر)</th>
                                        <th className="p-3">المبيعات (إيراد)</th>
                                        <th className="p-3 text-emerald-600">الحوافز (+)</th>
                                        <th className="p-3 text-red-600">الخصومات (-)</th>
                                        <th className="p-3">مؤشر الأداء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {empList.map((emp, idx) => {
                                        // Calculate generic efficiency score (just for visuals)
                                        const maxVol = topVolume?.total_volume || 1;
                                        const efficiency = (emp.total_volume / maxVol) * 100;
                                        
                                        return (
                                            <tr key={idx} className="bg-white hover:bg-slate-50 transition-shadow hover:shadow-sm group">
                                                <td className="p-3 border-y border-r border-slate-100 rounded-r-lg font-bold text-slate-700 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
                                                        {emp.worker_name.charAt(0)}
                                                    </div>
                                                    {emp.worker_name}
                                                    {emp === topSales && <span className="text-emerald-500 text-xs">👑</span>}
                                                </td>
                                                <td className="p-3 border-y border-slate-100 text-slate-500 font-mono">
                                                    {emp.shifts_count}
                                                </td>
                                                <td className="p-3 border-y border-slate-100 font-mono text-blue-600 font-medium">
                                                    {formatNumber(emp.total_volume)}
                                                </td>
                                                <td className="p-3 border-y border-slate-100 font-mono font-bold text-slate-700">
                                                    {formatCurrency(emp.total_sales)}
                                                </td>
                                                <td className="p-3 border-y border-slate-100 font-mono text-emerald-600 bg-emerald-50/50 group-hover:bg-emerald-100/50 transition-colors">
                                                    {emp.bonuses > 0 ? formatNumber(emp.bonuses) : '-'}
                                                </td>
                                                <td className="p-3 border-y border-l border-slate-100 rounded-l-lg font-mono text-red-600 bg-red-50/50 group-hover:bg-red-100/50 transition-colors">
                                                    {emp.deductions > 0 ? formatNumber(emp.deductions) : '-'}
                                                </td>
                                                <td className="p-3 border-y border-l border-slate-100">
                                                     <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                         <div 
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            style={{ width: `${efficiency}%` }}
                                                         ></div>
                                                     </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Users className="w-12 h-12 mb-3 text-slate-200" />
                            <Text>لا توجد بيانات للأداء الوظيفي في هذه الفترة</Text>
                        </div>
                    )}
                </Card>
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
                    {activeTab === 4 && <SupplierReport stationId={filters.station_id} />}
                    {activeTab === 5 && <CustomerReport stationId={filters.station_id} />}
                </div>
            </TabGroup>
        </div>
    );
}
