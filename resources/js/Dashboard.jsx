import React from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric, BarChart, DonutChart } from '@tremor/react';
import { 
    TrendingUp, 
    Droplet, 
    Truck, 
    Activity, 
    ArrowUpRight,
    Clock,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

export default function Dashboard({ data }) {
    // Helper to safely access data
    const safeData = data || {};
    const stock = {
        petrol: safeData.petrolStock || { current: 0, capacity: 0 },
        diesel: safeData.dieselStock || { current: 0, capacity: 0 },
        gas: safeData.gasStock || { current: 0, capacity: 0 }
    };
    
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const fuelColors = {
        Petrol: 'emerald',
        Diesel: 'blue',
        Gas: 'amber'
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20"
        >
            {/* 1. Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Today's Sales */}
                <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white group">
                        <div className="flex items-start justify-between">
                            <div>
                                <Text className="text-slate-500 mb-1">مبيعات اليوم</Text>
                                <Metric className="text-slate-900 font-mono">
                                    {parseFloat(safeData.todaySales || 0).toLocaleString('en-US')}
                                </Metric>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                            <ArrowUpRight className="w-3 h-3" /> نشط الآن
                        </div>
                    </Card>
                </motion.div>

                {/* Incoming Fuel */}
                <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white group">
                        <div className="flex items-start justify-between">
                            <div>
                                <Text className="text-slate-500 mb-1">وارد الوقود اليوم</Text>
                                <Metric className="text-slate-900 font-mono">
                                    {parseFloat(safeData.todayIncoming || 0).toLocaleString('en-US')} <span className="text-sm text-slate-400">لتر</span>
                                </Metric>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Truck className="w-6 h-6" />
                            </div>
                        </div>
                         <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" /> آخر تحديث
                        </div>
                    </Card>
                </motion.div>

                {/* Safe Balance */}
                <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <Text className="text-slate-400 mb-1">رصيد الخزينة</Text>
                                <Metric className="text-white font-mono">
                                    {parseFloat(safeData.safeBalance || 0).toLocaleString('en-US')}
                                </Metric>
                            </div>
                            <div className="p-3 bg-white/10 text-white rounded-xl backdrop-blur-sm">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                 {/* Active Wells */}
                 <motion.div variants={itemVariants}>
                    <Card className="relative overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white group">
                        <div className="flex items-start justify-between">
                            <div>
                                <Text className="text-slate-500 mb-1">العدادات النشطة</Text>
                                <Metric className="text-slate-900 font-mono">
                                    {safeData.wells ? safeData.wells.length : 0}
                                </Metric>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. Fuel Stock Levels */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="border-0 ring-1 ring-slate-200 shadow-sm h-full">
                        <Title className="mb-6 flex items-center gap-2">
                            <Droplet className="w-5 h-5 text-blue-500" /> مستويات المخزون
                        </Title>
                        <div className="space-y-6">
                            {/* Petrol */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <Text className="font-bold text-slate-700">بنزين (Petrol)</Text>
                                    <Text className="font-mono text-emerald-600 font-bold">
                                        {parseInt(stock.petrol.current).toLocaleString()} / {parseInt(stock.petrol.capacity).toLocaleString()} لتر
                                    </Text>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stock.petrol.current / stock.petrol.capacity) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="bg-emerald-500 h-full rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Diesel */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <Text className="font-bold text-slate-700">ديزل (Diesel)</Text>
                                    <Text className="font-mono text-blue-600 font-bold">
                                         {parseInt(stock.diesel.current).toLocaleString()} / {parseInt(stock.diesel.capacity).toLocaleString()} لتر
                                    </Text>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stock.diesel.current / stock.diesel.capacity) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                        className="bg-blue-600 h-full rounded-full relative"
                                    >
                                         <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                    </motion.div>
                                </div>
                            </div>

                             {/* Gas (if exists) */}
                             {stock.gas.capacity > 0 && (
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Text className="font-bold text-slate-700">غاز (Gas)</Text>
                                        <Text className="font-mono text-amber-600 font-bold">
                                            {parseInt(stock.gas.current).toLocaleString()} / {parseInt(stock.gas.capacity).toLocaleString()} لتر
                                        </Text>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stock.gas.current / stock.gas.capacity) * 100}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                            className="bg-amber-500 h-full rounded-full relative"
                                        >
                                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                                        </motion.div>
                                    </div>
                                </div>
                             )}
                        </div>
                    </Card>
                </motion.div>

                {/* 3. Station Info / Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card className="border-0 ring-1 ring-slate-200 shadow-sm h-full bg-gradient-to-b from-slate-50 to-white">
                        <div className="text-center p-6">
                            <div className="w-20 h-20 bg-white rounded-full mx-auto shadow-lg flex items-center justify-center mb-4 p-2">
                                {safeData.station?.logo_url ? (
                                    <img src={safeData.station.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <TrendingUp className="w-10 h-10 text-blue-600" />
                                )}
                            </div>
                            <Title className="text-slate-900">{safeData.station?.name || 'PetroDiesel ERP'}</Title>
                            <Text className="text-slate-500 text-sm mt-1">{safeData.station?.address || 'System Admin'}</Text>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* 4. Recent Sales Table */}
            <motion.div variants={itemVariants}>
                <Card className="border-0 ring-1 ring-slate-200 shadow-sm p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <Title>أحدث عمليات البيع</Title>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-slate-50 text-slate-500 font-bold">
                                <tr>
                                    <th className="p-4">الوقت</th>
                                    <th className="p-4">العامل</th>
                                    <th className="p-4">الماكينة</th>
                                    <th className="p-4">الكمية</th>
                                    <th className="p-4">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {safeData.recentSales && safeData.recentSales.length > 0 ? (
                                    safeData.recentSales.map((sale, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-mono text-slate-500">{sale.time}</td>
                                            <td className="p-4 font-medium text-slate-700">{sale.worker_name}</td>
                                            <td className="p-4 text-slate-500">{sale.pump_name}</td>
                                            <td className="p-4 font-mono dir-ltr text-right">{parseFloat(sale.volume_sold).toFixed(2)} L</td>
                                            <td className="p-4 font-mono font-bold text-emerald-600 dir-ltr text-right">
                                                {parseFloat(sale.total_amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400">لا توجد مبيعات حديثة</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
