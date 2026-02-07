import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';
import { Droplets, AlertTriangle, TrendingDown, RefreshCw, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LossReport({ filters }) {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({ totalLoss: 0, avgLossPercent: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'get_loss_report',
                start_date: filters?.start_date || '',
                end_date: filters?.end_date || '',
                station_id: filters?.station_id || 'all'
            });
            
            const res = await fetch(`${window.BASE_URL || ''}/reports?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await res.json();
            
            if (result.success) {
                setData(result.tanks || []);
                setSummary(result.summary || { totalLoss: 0, avgLossPercent: 0 });
            } else {
                toast.error('فشل تحميل بيانات الفاقد');
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

    const formatNumber = (num) => new Intl.NumberFormat('ar-SA').format(num || 0);
    
    const getLossStatus = (lossPercent) => {
        if (lossPercent <= 0.3) return { color: 'emerald', label: 'طبيعي', icon: CheckCircle };
        if (lossPercent <= 1) return { color: 'amber', label: 'مقبول', icon: AlertTriangle };
        return { color: 'red', label: 'مرتفع ⚠️', icon: AlertTriangle };
    };

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
                    <Title className="text-2xl font-bold dark:text-white">تقرير الفاقد والتبخر</Title>
                    <Text className="dark:text-slate-400">مقارنة المخزون النظري مع الفعلي لكل خزان</Text>
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
                    <Card className="rounded-2xl shadow-lg ring-1 ring-red-100 dark:bg-red-900/20 dark:border dark:border-red-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20">
                                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">إجمالي الفاقد</Text>
                                <Text className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {formatNumber(summary.totalLoss)} لتر
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-amber-100 dark:bg-amber-900/20 dark:border dark:border-amber-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                                <Droplets className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">متوسط نسبة الفاقد</Text>
                                <Text className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                    {summary.avgLossPercent?.toFixed(2) || 0}%
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="rounded-2xl shadow-lg ring-1 ring-blue-100 dark:bg-blue-900/20 dark:border dark:border-blue-500/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <Text className="text-slate-600 dark:text-slate-400">عدد الخزانات</Text>
                                <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {data.length} خزان
                                </Text>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Loss Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHead>
                                <TableRow className="bg-slate-50 dark:bg-white/5">
                                    <TableHeaderCell className="text-right dark:text-slate-300">الخزان</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">نوع الوقود</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الرصيد الافتتاحي</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الوارد</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">المبيعات</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الرصيد النظري</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الرصيد الفعلي</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الفرق</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">النسبة</TableHeaderCell>
                                    <TableHeaderCell className="text-right dark:text-slate-300">الحالة</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8">
                                            <Text className="text-slate-400">لا توجد بيانات</Text>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((tank, index) => {
                                        const status = getLossStatus(Math.abs(tank.loss_percent || 0));
                                        const StatusIcon = status.icon;
                                        
                                        return (
                                            <TableRow key={tank.id || index} className="hover:bg-slate-50 dark:hover:bg-white/5">
                                                <TableCell className="font-medium dark:text-white">{tank.name}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        style={{ backgroundColor: tank.fuel_color || '#3b82f6' }}
                                                        className="text-white"
                                                    >
                                                        {tank.fuel_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="dark:text-slate-300">{formatNumber(tank.opening_balance)} لتر</TableCell>
                                                <TableCell className="text-emerald-600 dark:text-emerald-400">+{formatNumber(tank.total_in)} لتر</TableCell>
                                                <TableCell className="text-red-600 dark:text-red-400">-{formatNumber(tank.total_out)} لتر</TableCell>
                                                <TableCell className="dark:text-slate-300">{formatNumber(tank.theoretical_balance)} لتر</TableCell>
                                                <TableCell className="font-bold dark:text-white">{formatNumber(tank.actual_balance)} لتر</TableCell>
                                                <TableCell className={tank.variance < 0 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                                                    {tank.variance >= 0 ? '+' : ''}{formatNumber(tank.variance)} لتر
                                                </TableCell>
                                                <TableCell className={Math.abs(tank.loss_percent) > 1 ? 'text-red-600 dark:text-red-400 font-bold' : 'dark:text-slate-300'}>
                                                    {(tank.loss_percent || 0).toFixed(2)}%
                                                </TableCell>
                                                <TableCell>
                                                    <Badge color={status.color} size="sm" className="flex items-center gap-1">
                                                        <StatusIcon className="w-3 h-3" />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </motion.div>

            {/* Info Note */}
            <Card className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 p-4">
                <div className="flex items-start gap-3">
                    <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                        <Text className="font-bold text-blue-700 dark:text-blue-300">ملاحظة حول نسبة الفاقد</Text>
                        <Text className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                            • أقل من 0.3%: طبيعي (تبخر عادي)<br/>
                            • 0.3% - 1%: مقبول (يحتاج مراقبة)<br/>
                            • أكثر من 1%: مرتفع (يجب التحقيق)
                        </Text>
                    </div>
                </div>
            </Card>
        </div>
    );
}
