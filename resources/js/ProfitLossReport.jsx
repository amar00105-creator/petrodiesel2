import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, Badge, Grid } from '@tremor/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Banknote, Wallet, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProfitLossReport({ filters }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previousPeriod, setPreviousPeriod] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'get_profit_loss',
                start_date: filters?.start_date || '',
                end_date: filters?.end_date || '',
                station_id: filters?.station_id || 'all'
            });
            
            const res = await fetch(`${window.BASE_URL || ''}/reports?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await res.json();
            
            if (result.success) {
                setData(result.data);
                setPreviousPeriod(result.previous_period);
            } else {
                toast.error('فشل تحميل بيانات الأرباح والخسائر');
            }
        } catch (e) {
            console.error(e);
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters?.start_date, filters?.end_date, filters?.station_id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SA', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
        }).format(amount || 0);
    };

    const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return null;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    const netProfit = (data?.total_revenue || 0) - (data?.total_expenses || 0);
    const profitMargin = data?.total_revenue ? (netProfit / data.total_revenue * 100).toFixed(1) : 0;
    const isProfit = netProfit >= 0;

    const revenueChange = calculateChange(data?.total_revenue, previousPeriod?.total_revenue);
    const expenseChange = calculateChange(data?.total_expenses, previousPeriod?.total_expenses);
    const profitChange = calculateChange(netProfit, previousPeriod?.net_profit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Title className="text-2xl font-bold dark:text-white">تقرير الأرباح والخسائر</Title>
                    <Text className="dark:text-slate-400">ملخص الإيرادات والمصروفات وصافي الربح</Text>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                >
                    <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Summary Cards */}
            <Grid numItemsMd={3} className="gap-6">
                {/* Total Revenue */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:border dark:border-emerald-500/30 dark:ring-emerald-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            {revenueChange && (
                                <Badge color={parseFloat(revenueChange) >= 0 ? 'emerald' : 'red'} size="sm">
                                    {parseFloat(revenueChange) >= 0 ? '+' : ''}{revenueChange}%
                                </Badge>
                            )}
                        </div>
                        <Text className="text-slate-600 dark:text-slate-400">إجمالي الإيرادات</Text>
                        <Metric className="text-emerald-600 dark:text-emerald-400 mt-1">
                            {formatCurrency(data?.total_revenue)} ج.س
                        </Metric>
                    </Card>
                </motion.div>

                {/* Total Expenses */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-red-100 dark:bg-red-900/20 dark:border dark:border-red-500/30 dark:ring-red-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20">
                                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            {expenseChange && (
                                <Badge color={parseFloat(expenseChange) <= 0 ? 'emerald' : 'red'} size="sm">
                                    {parseFloat(expenseChange) >= 0 ? '+' : ''}{expenseChange}%
                                </Badge>
                            )}
                        </div>
                        <Text className="text-slate-600 dark:text-slate-400">إجمالي المصروفات</Text>
                        <Metric className="text-red-600 dark:text-red-400 mt-1">
                            {formatCurrency(data?.total_expenses)} ج.س
                        </Metric>
                    </Card>
                </motion.div>

                {/* Net Profit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={`rounded-2xl shadow-lg ring-1 ${isProfit ? 'ring-blue-100 dark:bg-blue-900/20 dark:border-blue-500/30 dark:ring-blue-500/20' : 'ring-orange-100 dark:bg-orange-900/20 dark:border-orange-500/30 dark:ring-orange-500/20'} dark:border`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${isProfit ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-orange-100 dark:bg-orange-500/20'}`}>
                                <Wallet className={`w-6 h-6 ${isProfit ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
                            </div>
                            <Badge color={isProfit ? 'blue' : 'orange'} size="sm">
                                هامش {profitMargin}%
                            </Badge>
                        </div>
                        <Text className="text-slate-600 dark:text-slate-400">{isProfit ? 'صافي الربح' : 'صافي الخسارة'}</Text>
                        <Metric className={`${isProfit ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} mt-1`}>
                            {formatCurrency(Math.abs(netProfit))} ج.س
                        </Metric>
                    </Card>
                </motion.div>
            </Grid>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Title className="flex items-center gap-2 mb-4 dark:text-white">
                            <ArrowUpRight className="w-5 h-5 text-emerald-500" /> تفاصيل الإيرادات
                        </Title>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">مبيعات الوقود</Text>
                                <Text className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data?.fuel_sales)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">مبيعات أخرى</Text>
                                <Text className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data?.other_sales)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">تحصيلات العملاء</Text>
                                <Text className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data?.customer_payments)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg px-3 mt-2">
                                <Text className="font-bold dark:text-white">إجمالي الإيرادات</Text>
                                <Text className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data?.total_revenue)} ج.س
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Expense Breakdown */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                        <Title className="flex items-center gap-2 mb-4 dark:text-white">
                            <ArrowDownRight className="w-5 h-5 text-red-500" /> تفاصيل المصروفات
                        </Title>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">تكلفة المشتريات</Text>
                                <Text className="font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(data?.purchase_cost)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">الرواتب والأجور</Text>
                                <Text className="font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(data?.salaries)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">مصروفات تشغيلية</Text>
                                <Text className="font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(data?.operational_expenses)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/10">
                                <Text className="dark:text-slate-300">مدفوعات الموردين</Text>
                                <Text className="font-bold text-red-600 dark:text-red-400">
                                    {formatCurrency(data?.supplier_payments)} ج.س
                                </Text>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 mt-2">
                                <Text className="font-bold dark:text-white">إجمالي المصروفات</Text>
                                <Text className="font-bold text-lg text-red-600 dark:text-red-400">
                                    {formatCurrency(data?.total_expenses)} ج.س
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Net Result Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className={`rounded-2xl shadow-lg p-8 text-center ${isProfit ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
                    <Text className="text-white/80 text-lg mb-2">{isProfit ? 'صافي الربح للفترة' : 'صافي الخسارة للفترة'}</Text>
                    <div className="text-5xl font-bold text-white mb-2">
                        {formatCurrency(Math.abs(netProfit))} ج.س
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Badge color="white" size="lg">
                            هامش الربح: {profitMargin}%
                        </Badge>
                        {profitChange && (
                            <Badge color={parseFloat(profitChange) >= 0 ? 'emerald' : 'red'} size="lg">
                                {parseFloat(profitChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(profitChange))}% عن الفترة السابقة
                            </Badge>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
