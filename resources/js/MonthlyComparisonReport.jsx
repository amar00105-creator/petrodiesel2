import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, AreaChart, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { TrendingUp, TrendingDown, Calendar, RefreshCw, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function MonthlyComparisonReport({ filters }) {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'get_monthly_comparison',
                year: filters?.year || new Date().getFullYear(),
                station_id: filters?.station_id || 'all'
            });
            
            const res = await fetch(`${window.BASE_URL || ''}/reports?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await res.json();
            
            if (result.success) {
                setData(result.months || []);
                setSummary(result.summary || {});
            } else {
                toast.error('فشل تحميل بيانات المقارنة الشهرية');
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
    }, [filters?.year, filters?.station_id]);

    const formatCurrency = (amount) => new Intl.NumberFormat('ar-SA').format(amount || 0);
    const formatNumber = (num) => new Intl.NumberFormat('ar-SA').format(num || 0);

    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    // Prepare chart data
    const chartData = data.map((m, i) => ({
        الشهر: monthNames[i] || `شهر ${i + 1}`,
        المبيعات: m.sales || 0,
        المشتريات: m.purchases || 0,
        الربح: m.profit || 0
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Title className="text-2xl font-bold dark:text-white">تقرير المقارنة الشهرية</Title>
                    <Text className="dark:text-slate-400">مقارنة الأداء شهرياً لعام {filters?.year || new Date().getFullYear()}</Text>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                >
                    <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:border dark:border-emerald-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">أفضل شهر</Text>
                                <Text className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {summary.bestMonth || '-'}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border dark:border-blue-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">إجمالي السنة</Text>
                                <Text className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(summary.totalYearlySales)} ج.س
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-purple-100 dark:bg-purple-900/20 dark:border dark:border-purple-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20">
                                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">متوسط شهري</Text>
                                <Text className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatCurrency(summary.avgMonthlySales)} ج.س
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className={`rounded-2xl shadow-lg ring-1 ${summary.yearlyGrowth >= 0 ? 'ring-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-500/30' : 'ring-red-100 dark:bg-red-900/20 dark:border-red-500/30'} dark:border`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${summary.yearlyGrowth >= 0 ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                                {summary.yearlyGrowth >= 0 
                                    ? <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    : <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                                }
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">النمو السنوي</Text>
                                <Text className={`text-xl font-bold ${summary.yearlyGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {summary.yearlyGrowth >= 0 ? '+' : ''}{(summary.yearlyGrowth || 0).toFixed(1)}%
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10">
                    <Title className="dark:text-white mb-4">الرسم البياني الشهري</Title>
                    <AreaChart
                        className="h-72 mt-4"
                        data={chartData}
                        index="الشهر"
                        categories={['المبيعات', 'المشتريات', 'الربح']}
                        colors={['emerald', 'blue', 'amber']}
                        valueFormatter={(v) => formatCurrency(v)}
                        showLegend
                        showGridLines={false}
                    />
                </Card>
            </motion.div>

            {/* Detailed Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 overflow-hidden">
                    <Title className="dark:text-white mb-4">تفاصيل الأداء الشهري</Title>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-slate-50 dark:bg-white/5">
                                    <TableHeaderCell className="text-right dark:text-slate-300">الشهر</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">المبيعات</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">المشتريات</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">المصروفات</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الربح</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">النمو</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <Text className="text-slate-400">لا توجد بيانات</Text>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((month, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                            <TableCell className="font-medium dark:text-white">{monthNames[index]}</TableCell>
                                            <TableCell className="text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(month.sales)} ج.س
                                            </TableCell>
                                            <TableCell className="text-blue-600 dark:text-blue-400">
                                                {formatCurrency(month.purchases)} ج.س
                                            </TableCell>
                                            <TableCell className="text-red-600 dark:text-red-400">
                                                {formatCurrency(month.expenses)} ج.س
                                            </TableCell>
                                            <TableCell className={`font-bold ${month.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {formatCurrency(month.profit)} ج.س
                                            </TableCell>
                                            <TableCell>
                                                {month.growth !== undefined ? (
                                                    <Badge color={month.growth >= 0 ? 'emerald' : 'red'} size="sm">
                                                        {month.growth >= 0 ? '↑' : '↓'} {Math.abs(month.growth).toFixed(1)}%
                                                    </Badge>
                                                ) : (
                                                    <Text className="text-slate-400">-</Text>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
