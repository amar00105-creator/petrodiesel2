import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Filter, ArrowUp, ArrowDown, RefreshCw, Layers, Droplets, Briefcase, DollarSign, Wallet, FileDown, FileSpreadsheet, TrendingUp, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Title, Text, Metric, Select, SelectItem, DateRangePicker } from '@tremor/react';
import { toast } from 'sonner';

export default function FinancialFlowReport() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');
    const todayStr = today.toLocaleDateString('en-CA');
    
    const [filters, setFilters] = useState({
        source_type: 'safe',
        source_id: '',
        start_date: null,
        end_date: null,
        group_sales: 'none'
    });

    const [period, setPeriod] = useState('month'); // Default to month
    const [sources, setSources] = useState({ safes: [], banks: [] });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSources();
    }, []);

    useEffect(() => {
        if (filters.source_id) {
            if (filters.start_date > filters.end_date) {
               toast.warning('تم تصحيح التاريخ: تاريخ البداية لا يمكن أن يكون بعد النهاية');
               setFilters(prev => ({ ...prev, start_date: prev.end_date, end_date: prev.start_date }));
               return;
            }
            fetchReport();
        }
    }, [filters.source_id, filters.source_type, filters.start_date, filters.end_date, filters.group_sales]);

    const fetchSources = async () => {
        try {
            const response = await fetch(`${window.BASE_URL || ''}/reports?action=get_sources`);
            const result = await response.json();
            
            if (result.success) {
                setSources({ safes: result.safes || [], banks: result.banks || [] });
                
                if (!filters.source_id) {
                    if (result.safes && result.safes.length > 0) {
                        setFilters(prev => ({ ...prev, source_type: 'safe', source_id: result.safes[0].id }));
                    } else if (result.banks && result.banks.length > 0) {
                        setFilters(prev => ({ ...prev, source_type: 'bank', source_id: result.banks[0].id }));
                    }
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
            // Build URL with date filters
            const params = new URLSearchParams({
                id: filters.source_id,
                start_date: filters.start_date,
                end_date: filters.end_date
            });
            
            const endpoint = filters.source_type === 'safe' 
                ? `${window.BASE_URL || ''}/finance/getSafeDetails?${params.toString()}`
                : `${window.BASE_URL || ''}/finance/getBankDetails?${params.toString()}`;

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();

            if (result.success) {
                let rawTransactions = result.transactions || [];
                
                // --- Grouping Logic ---
                if (filters.group_sales === 'fuel_type') {
                    const groups = {};
                    const others = [];

                    rawTransactions.forEach(t => {
                        // Normalize fuel name or infer from description
                        let fuelName = t.fuel_name;
                        if (!fuelName && t.description) {
                            if (t.description.includes('جاز') || t.description.toLowerCase().includes('diesel')) fuelName = 'جاز';
                            else if (t.description.includes('بنزين') || t.description.toLowerCase().includes('benzene')) fuelName = 'بنزين';
                        }

                        // Normalize description and category for better matching
                        const desc = (t.description || '').toLowerCase();
                        const cat = (t.category_name || '').toLowerCase();
                        const tank = (t.tank_name || '').toLowerCase();
                        
                        // Infer fuel name from ALL possible sources
                        if (!fuelName) {
                            if (desc.includes('جاز') || desc.includes('diesel') || cat.includes('جاز') || cat.includes('diesel') || tank.includes('جاز') || tank.includes('diesel')) fuelName = 'جاز';
                            else if (desc.includes('بنزين') || desc.includes('benzene') || cat.includes('بنزين') || cat.includes('benzene') || tank.includes('بنزين') || tank.includes('benzene')) fuelName = 'بنزين';
                        }

                        // Identify if it is a sale transaction - Catch ALL variations
                        const isSale = ['sales', 'sale'].includes(t.related_entity_type) 
                            || cat.includes('مبيعات') 
                            || desc.includes('مبيعات')
                            || desc.includes('محروقات')
                            || desc.includes('عملية')
                            || desc.includes('sale')
                            || desc.includes('fuel');

                        // If it's a sale but no fuel name found, default it to force grouping
                        if (isSale && !fuelName) {
                            fuelName = 'وقود (غير محدد)';
                        }
                        
                        if (isSale && fuelName) {
                            // Use created_at for accurate date grouping
                            const date = t.created_at ? t.created_at.split(' ')[0] : t.date;
                            const key = `${date}_${fuelName}`;
                            
                            if (!groups[key]) {
                                groups[key] = {
                                    ...t,
                                    id: `group_${Math.random()}`, // Temporary ID
                                    description: `إجمالي مبيعات ${fuelName}`,
                                    fuel_name: fuelName, // Ensure mapped fuel name is used
                                    original_amount: 0, 
                                    amount: 0,
                                    user_name: '-', // Hide user for grouped
                                    created_at: t.created_at || t.date // Preserve date for display logic
                                };
                            }
                            
                            // Sum amounts
                            groups[key].amount = (parseFloat(groups[key].amount) + parseFloat(t.amount)).toString();
                        } else {
                            others.push(t);
                        }
                    });
                    
                    // Combine and Sort: Grouped items first (sorted by Amount DESC), then others (sorted by Date DESC)
                    rawTransactions = [...Object.values(groups), ...others].sort((a, b) => {
                        const isGroupA = a.id.toString().startsWith('group_');
                        const isGroupB = b.id.toString().startsWith('group_');

                        if (isGroupA && isGroupB) {
                            return parseFloat(b.amount) - parseFloat(a.amount);
                        }

                        if (isGroupA) return -1;
                        if (isGroupB) return 1;

                        const dateA = a.created_at || a.date;
                        const dateB = b.created_at || b.date;
                        return new Date(dateB) - new Date(dateA);
                    });
                }
                // --- End Grouping Logic ---

                const transformedMovements = rawTransactions.map(t => {
                    const isIncoming = (t.to_type === filters.source_type && t.to_id == filters.source_id);
                    
                    // Use created_at for date display to ensure consistency with timezones
                    // created_at comes from DB which respects the session timezone we set
                    const dateDisplay = t.created_at ? t.created_at.split(' ')[0] : t.date;
                    
                    return {
                        date: dateDisplay,
                        id: t.id,
                        type: t.type,
                        category: t.category_name || 'عام',
                        description: t.description,
                        user_name: t.user_name || null,
                        beneficiary: t.beneficiary_name || null,
                        fuel_name: t.fuel_name || null,
                        amount_in: isIncoming ? parseFloat(t.amount) : 0,
                        amount_out: !isIncoming ? parseFloat(t.amount) : 0,
                        balance: 0,
                        is_sale: t.related_entity_type === 'sales'
                    };
                });

                let runningBalance = 0;
                // ... rest of calculation ...
                transformedMovements.forEach(movement => {
                    runningBalance += movement.amount_in;
                    runningBalance -= movement.amount_out;
                    movement.balance = runningBalance;
                });

                setData({
                    success: true,
                    summary: {
                        opening_balance: 0,
                        closing_balance: runningBalance,
                        total_sales: 0,
                        total_other_income: 0,
                        total_expenses: 0,
                        total_transfers_in: 0,
                        total_transfers_out: 0
                    },
                    movements: transformedMovements
                });
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
        if (key === 'source_type') {
            const firstSource = value === 'safe' ? (sources.safes[0]?.id || '') : (sources.banks[0]?.id || '');
            setFilters(prev => ({ ...prev, source_type: value, source_id: firstSource }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    // Initialize dates from server
    useEffect(() => {
        const initializeDates = async () => {
            try {
                const res = await fetch(`${window.BASE_URL || ''}/api/server-time`);
                const data = await res.json();
                if (data.success) {
                    const serverDate = data.date; // "YYYY-MM-DD"
                    const [year, month, day] = serverDate.split('-');
                    
                    // Set default to current month
                    const startDate = `${year}-${month}-01`;
                    
                    setFilters(prev => ({
                        ...prev,
                        start_date: startDate,
                        end_date: serverDate
                    }));
                }
            } catch (err) {
                console.warn('Using client date fallback');
                const today = new Date();
                const todayStr = today.toLocaleDateString('en-CA');
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');
                setFilters(prev => ({ ...prev, start_date: firstDay, end_date: todayStr }));
            }
        };
        initializeDates();
    }, []);

    const handlePeriodChange = async (newPeriod) => {
        setPeriod(newPeriod);
        
        let serverDateStr;
        try {
            const res = await fetch(`${window.BASE_URL || ''}/api/server-time`);
            const data = await res.json();
            if (data.success) {
                serverDateStr = data.date;
            }
        } catch (e) { console.warn('Server date fetch failed'); }

        // Use server date or fallback
        const todayStr = serverDateStr || new Date().toISOString().split('T')[0];
        const [year, month, day] = todayStr.split('-');
        const today = new Date(year, month - 1, day);
        
        let start, end;

        switch(newPeriod) {
            case 'today':
                start = end = todayStr;
                break;
            case 'week':
                // Last 7 days using string manipulation
                const d = new Date(todayStr);
                d.setDate(d.getDate() - 6);
                start = d.toISOString().split('T')[0];
                end = todayStr;
                break;
            case 'month':
                // Current month
                start = `${year}-${month}-01`;
                end = todayStr;
                break;
            case 'quarter':
                const q = Math.floor((parseInt(month) + 2) / 3);
                const qStartMonth = String((q - 1) * 3 + 1).padStart(2, '0');
                start = `${year}-${qStartMonth}-01`;
                end = todayStr;
                break;
            case 'year':
                start = `${year}-01-01`;
                end = todayStr;
                break;
            case 'all':
                start = '2024-01-01'; // System start
                end = todayStr;
                break;
            case 'custom':
                // Keep current dates, just switch to custom mode
                return;
        }

        if (newPeriod !== 'custom') {
            setFilters(prev => ({ ...prev, start_date: start, end_date: end }));
        }
    };

    const getCurrentAccounts = () => {
        return filters.source_type === 'safe' ? sources.safes : sources.banks;
    };

    const formatCurrency = (amount) => parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SDG';
    const formatNumber = (num) => {
        if (!num) return '0';
        return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <motion.div className="bg-white p-6 rounded-2xl border border-slate-100" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">كشف حساب</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Account Type */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">نوع الحساب</label>
                        <select 
                            value={filters.source_type}
                            onChange={(e) => handleFilterChange('source_type', e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="safe">خزنة</option>
                            <option value="bank">بنك</option>
                        </select>
                    </div>

                    {/* Account Selection */}
                    <div className="md:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الحساب</label>
                        <select 
                            value={filters.source_id}
                            onChange={(e) => handleFilterChange('source_id', e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="">-- اختر --</option>
                            {getCurrentAccounts().map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                            ))}
                        </select>
                    </div>

                    {/* Grouping Filter */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">تجميع المبيعات</label>
                        <select 
                            value={filters.group_sales}
                            onChange={(e) => handleFilterChange('group_sales', e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        >
                            <option value="none">تفصيلي (بدون تجميع)</option>
                            <option value="fuel_type">حسب نوع الوقود</option>
                        </select>
                    </div>

                    {/* Period Selection Buttons */}
                    <div className="md:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الفترة</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePeriodChange('today')}
                                className={`flex-1 h-10 px-2 rounded-lg text-xs font-bold transition-all ${
                                    period === 'today' 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                اليوم
                            </button>
                            <button
                                onClick={() => handlePeriodChange('week')}
                                className={`flex-1 h-10 px-2 rounded-lg text-xs font-bold transition-all ${
                                    period === 'week' 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                الأسبوع
                            </button>
                            <button
                                onClick={() => handlePeriodChange('month')}
                                className={`flex-1 h-10 px-2 rounded-lg text-xs font-bold transition-all ${
                                    period === 'month' 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                الشهر
                            </button>
                            <button
                                onClick={() => handlePeriodChange('custom')}
                                className={`flex-1 h-10 px-2 rounded-lg text-xs font-bold transition-all ${
                                    period === 'custom' 
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                مخصص
                            </button>
                        </div>
                    </div>

                    {/* Date Range - Only show when custom */}
                    {period === 'custom' && (
                        <div className="md:col-span-12 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الفترة الزمنية المخصصة</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date"
                                    value={filters.start_date}
                                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                    className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                                <span className="text-slate-400 font-bold">إلى</span>
                                <input 
                                    type="date"
                                    value={filters.end_date}
                                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                    className="w-full h-[46px] px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Transaction Table */}
            {loading && (
                <div className="bg-white rounded-2xl p-12 text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 mt-4">جاري التحميل...</p>
                </div>
            )}

            {!loading && data && data.movements && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                >
                    <div className="p-5 border-b border-slate-50">
                        <h3 className="font-bold text-base text-slate-800">كشف الحساب</h3>
                        <p className="text-sm text-slate-500 mt-1">عدد العمليات: {data.movements.length}</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-medium">
                                <tr>
                                    <th className="p-4 text-right">التاريخ</th>
                                    <th className="p-4 text-right">الوصف</th>
                                    <th className="p-4 text-right">نوع الوقود</th>
                                    <th className="p-4 text-right">المستخدم</th>
                                    <th className="p-4 text-right">المستفيد</th>
                                    <th className="p-4 text-left text-emerald-600">وارد</th>
                                    <th className="p-4 text-left text-rose-600">منصرف</th>
                                    <th className="p-4 text-left">الاجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.movements.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-slate-400">
                                            لا توجد عمليات في هذه الفترة
                                        </td>
                                    </tr>
                                ) : (
                                    data.movements.map((row, index) => (
                                        <tr key={index} className={`border-b border-slate-50 transition-colors ${
                                            row.id.toString().startsWith('group_') 
                                                ? 'bg-blue-50/80 hover:bg-blue-100/80' 
                                                : 'hover:bg-slate-50/50'
                                        }`}>
                                            <td className="p-4 text-slate-500 font-mono text-sm">{row.date}</td>
                                            <td className="p-4 font-medium text-slate-700">
                                                <div>{row.description}</div>
                                                {row.user_name && (
                                                    <div className="text-xs text-slate-400 mt-1">بواسطة: {row.user_name}</div>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-600 text-sm">
                                                {row.fuel_name ? (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                        {row.fuel_name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 text-slate-600 text-sm">{row.user_name || '-'}</td>
                                            <td className="p-4 text-slate-600 text-sm">{row.beneficiary || '-'}</td>
                                            <td className="p-4 text-left font-mono font-bold text-emerald-600" dir="ltr">
                                                {row.amount_in > 0 ? formatNumber(row.amount_in) : '-'}
                                            </td>
                                            <td className="p-4 text-left font-mono font-bold text-rose-600" dir="ltr">
                                                {row.amount_out > 0 ? formatNumber(row.amount_out) : '-'}
                                            </td>
                                            <td className="p-4 text-left font-mono font-bold text-slate-700" dir="ltr">
                                                {formatNumber(row.balance)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {data.movements.length > 0 && (
                                <tfoot className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-200">
                                    <tr>
                                        <td colSpan="5" className="p-4 text-center text-sm uppercase tracking-wider">
                                            المجموع الكلي
                                        </td>
                                        <td className="p-4 text-left font-mono text-emerald-700" dir="ltr">
                                            {formatNumber(data.movements.reduce((acc, curr) => acc + (parseFloat(curr.amount_in) || 0), 0))}
                                        </td>
                                        <td className="p-4 text-left font-mono text-rose-700" dir="ltr">
                                            {formatNumber(data.movements.reduce((acc, curr) => acc + (parseFloat(curr.amount_out) || 0), 0))}
                                        </td>
                                        <td className="p-4 text-left font-mono text-blue-700" dir="ltr">
                                            {formatNumber(data.movements[data.movements.length - 1].balance)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </motion.div>
            )}

            {!data && !loading && (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">اختر حساباً لعرض التقرير</p>
                </div>
            )}
        </div>
    );
}
