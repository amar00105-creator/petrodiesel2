import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, BarList } from '@tremor/react';
import { Fuel, TrendingUp, RefreshCw, Award, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function PumpPerformanceReport({ filters }) {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalSales: 0, totalVolume: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'get_pump_performance',
                start_date: filters?.start_date || '',
                end_date: filters?.end_date || '',
                station_id: filters?.station_id || 'all'
            });
            
            const res = await fetch(`${window.BASE_URL || ''}/reports?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await res.json();
            
            if (result.success) {
                setData(result.pumps || []);
                setSummary(result.summary || { totalSales: 0, totalVolume: 0 });
            } else {
                toast.error('فشل تحميل بيانات أداء الماكينات');
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

    const formatCurrency = (amount) => new Intl.NumberFormat('ar-SA').format(amount || 0);
    const formatNumber = (num) => new Intl.NumberFormat('ar-SA').format(num || 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    // Prepare chart data
    const chartData = data.slice(0, 10).map(pump => ({
        name: pump.pump_name,
        value: pump.total_revenue,
        color: pump.fuel_color || 'blue'
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Title className="text-2xl font-bold dark:text-white">تقرير أداء الماكينات</Title>
                    <Text className="dark:text-slate-400">ترتيب الماكينات حسب المبيعات والأداء</Text>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                >
                    <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:border dark:border-emerald-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">إجمالي المبيعات</Text>
                                <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(summary.totalSales)} ج.س
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border dark:border-blue-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                <Fuel className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">إجمالي الكمية</Text>
                                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatNumber(summary.totalVolume)} لتر
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-purple-100 dark:bg-purple-900/20 dark:border dark:border-purple-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20">
                                <Gauge className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">عدد الماكينات</Text>
                                <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {data.length} ماكينة
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10">
                        <Title className="dark:text-white mb-4">أفضل 10 ماكينات</Title>
                        <BarList 
                            data={chartData} 
                            valueFormatter={(v) => formatCurrency(v) + ' ج.س'} 
                            className="mt-2"
                        />
                    </Card>
                </motion.div>
            )}

            {/* Detailed Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 overflow-hidden">
                    <Title className="dark:text-white mb-4">تفاصيل أداء الماكينات</Title>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-slate-50 dark:bg-white/5">
                                    <TableHeaderCell className="text-right dark:text-slate-300">#</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الماكينة</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">نوع الوقود</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">عدد العمليات</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الكمية (لتر)</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">المبيعات</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">النسبة</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <Text className="text-slate-400">لا توجد بيانات</Text>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((pump, index) => (
                                        <TableRow key={pump.pump_id || index} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                            <TableCell className="dark:text-slate-300">
                                                {index < 3 ? (
                                                    <Badge color={index === 0 ? 'amber' : index === 1 ? 'slate' : 'orange'}>
                                                        <Award className="w-3 h-3 inline mr-1" />
                                                        {index + 1}
                                                    </Badge>
                                                ) : index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium dark:text-white">{pump.pump_name}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    style={{ backgroundColor: pump.fuel_color || '#3b82f6' }}
                                                    className="text-white"
                                                >
                                                    {pump.fuel_name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="dark:text-slate-300">{formatNumber(pump.transaction_count)}</TableCell>
                                            <TableCell className="dark:text-slate-300">{formatNumber(pump.total_volume)} لتر</TableCell>
                                            <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(pump.total_revenue)} ج.س
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-200 dark:bg-white/10 rounded-full h-2">
                                                        <div 
                                                            className="bg-emerald-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${pump.percentage || 0}%` }}
                                                        />
                                                    </div>
                                                    <Text className="text-sm dark:text-slate-300">{(pump.percentage || 0).toFixed(1)}%</Text>
                                                </div>
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
