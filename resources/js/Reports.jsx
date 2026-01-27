import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Filter, PieChart, TrendingUp, DollarSign, Droplets, Users, FileText, Briefcase, Activity, Truck, CheckCircle, Wallet } from 'lucide-react';
import { TabGroup, TabList, Tab, Title, Text, Card, Metric, Flex, BadgeDelta, Grid, Badge } from '@tremor/react';
import { toast } from 'sonner';
import DailySalesReconciliation from './DailySalesReconciliation';
import TankSalesReport from './TankSalesReport';
import SupplierReport from './SupplierReport';

export default function Reports({ user }) {
    // --- State ---
    const [activeTab, setActiveTab] = useState(0); // 0: Financial, 1: Warehouse, 2: Sales, 3: Employees
    const [filters, setFilters] = useState({
        station_id: user?.station_id || 'all',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
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

    useEffect(() => {
        fetchStats();
    }, []); // Initial Load

    // --- Handlers ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePeriodChange = (period) => {
        const now = new Date();
        let start = new Date();
        const end = new Date();

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

    // Financial Cards
    const renderFinancial = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Net Profit */}
            <Card decoration="top" decorationColor="emerald" className="bg-white">
                <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <Text>صافي الربح / الخسارة</Text>
                        <Metric className={stats?.financial?.net_profit >= 0 ? "text-emerald-700" : "text-rose-600"}>
                            {formatCurrency(stats?.financial?.net_profit)}
                        </Metric>
                    </div>
                </Flex>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                        <Text className="text-xs">الإيرادات</Text>
                        <div className="font-bold text-emerald-600">{formatCurrency(stats?.financial?.income)}</div>
                    </div>
                    <div>
                        <Text className="text-xs">المصروفات</Text>
                        <div className="font-bold text-rose-600">{formatCurrency(stats?.financial?.expense)}</div>
                    </div>
                </div>
            </Card>

            {/* Inventory Valuation */}
            <Card decoration="top" decorationColor="blue" className="bg-white">
                <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Droplets className="w-8 h-8" />
                    </div>
                    <div>
                        <Text>قيمة المخزون اللحظي (أصول)</Text>
                        <Metric>{formatCurrency(stats?.financial?.inventory_value)}</Metric>
                    </div>
                </Flex>
                <Text className="mt-2 text-slate-400 text-xs">مجموع (حجم الخزان × السعر الحالي)</Text>
            </Card>

            {/* Debts Summary */}
            <Card decoration="top" decorationColor="amber" className="bg-white">
                 <Flex justifyContent="start" className="space-x-4 space-x-reverse">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <Text>الذمم والديون</Text>
                        <div className="text-2xl font-bold text-slate-700">ملخص الأرصدة</div>
                    </div>
                </Flex>
                <div className="mt-4 space-y-3">
                    <Flex className="justify-between">
                        <Text>ديون الشركات (لنا)</Text>
                        <Text className="font-bold text-emerald-600">{formatCurrency(stats?.financial?.corporate_debts)}</Text>
                    </Flex>
                    <Flex className="justify-between">
                        <Text>التزامات الموردين (علينا)</Text>
                        <Text className="font-bold text-rose-600">{formatCurrency(stats?.financial?.supplier_debts)}</Text>
                    </Flex>
                </div>
            </Card>
        </div>
    );

    // Warehouse Cards
    const renderWarehouse = () => (
        <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card decoration="top" decorationColor="blue" className="bg-white">
                    <Text>قيمة المخزون الحالي</Text>
                    <Metric className="mt-2 text-blue-700">{formatCurrency(stats?.financial?.inventory_value)}</Metric>
                </Card>
                <Card decoration="top" decorationColor="cyan" className="bg-white">
                    <Text>الوارد (مشتريات) للفترة</Text>
                    <Metric className="mt-2 text-cyan-700">{formatNumber(stats?.warehouse?.incoming_stock?.total_volume)} <span className="text-sm">لتر</span></Metric>
                    <Text className="mt-2 text-xs text-slate-400">بتكلفة: {formatCurrency(stats?.warehouse?.incoming_stock?.total_cost)}</Text>
                </Card>
                <Card decoration="top" decorationColor="orange" className="bg-white">
                     <Text>فاقد التبخر (تقديري)</Text>
                     <Metric className="mt-2 text-orange-700">{formatNumber(stats?.financial?.evaporation_loss)} <span className="text-sm">لتر</span></Metric>
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
                            <Card className={`relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 ${
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
                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100">
                                        <Text className="text-xs text-slate-500 mb-1">القيمة الإجمالية</Text>
                                        <div className="font-bold text-emerald-600">{formatCurrency(tank.value)}</div>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100">
                                        <Text className="text-xs text-slate-500 mb-1">آخر معايرة</Text>
                                        <div className="font-mono text-xs font-bold text-slate-700">
                                            {tank.last_calibration === 'N/A' ? 'غير متوفر' : new Date(tank.last_calibration).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Variance Indicator */}
                                <div className={`mt-3 pt-3 border-t border-slate-100 flex justify-between items-center relative z-10`}>
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
                <Card className="bg-white">
                    <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2">سجل الوارد (المشتريات)</Title>
                    {stats?.warehouse?.incoming_stock?.list?.length > 0 ? (
                        <div className="overflow-x-auto max-h-80 overflow-y-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3">التاريخ</th>
                                        <th className="p-3">المورد</th>
                                        <th className="p-3">الخزان</th>
                                        <th className="p-3">الكمية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.warehouse.incoming_stock.list.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-3 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold">{item.supplier_name}</td>
                                            <td className="p-3 text-xs">{item.tank_name}</td>
                                            <td className="p-3 font-mono text-blue-600">{formatNumber(item.volume_received)}</td>
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
                <Card className="bg-white">
                    <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2">سجل قراءات الخزانات (المعايرة والقياس)</Title>
                    {stats?.warehouse?.readings?.length > 0 ? (
                        <div className="overflow-x-auto max-h-80 overflow-y-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3">التاريخ</th>
                                        <th className="p-3">الخزان</th>
                                        <th className="p-3">النوع</th>
                                        <th className="p-3">القراءة (سم)</th>
                                        <th className="p-3">الحجم (لتر)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.warehouse.readings.map((reading, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="p-3 whitespace-nowrap">{new Date(reading.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold">{reading.tank_name}</td>
                                            <td className="p-3 text-xs">
                                                <span className={`px-2 py-1 rounded-full ${
                                                    reading.reading_type === 'opening' ? 'bg-indigo-100 text-indigo-700' :
                                                    reading.reading_type === 'closing' ? 'bg-slate-100 text-slate-700' :
                                                    reading.reading_type === 'check' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {reading.reading_type === 'check' ? 'معايرة/فحص' : reading.reading_type}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono">{reading.reading_cm}</td>
                                            <td className="p-3 font-mono font-bold text-slate-700">{formatNumber(reading.volume_liters)}</td>
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

            {/* Pending Shipments Section - NEW */}
            <Card className="bg-white mt-6">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                    <Title className="text-slate-700 flex items-center gap-2">
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
                                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                                        isDelayed 
                                        ? 'border-red-200 bg-red-50/50 hover:border-red-300' 
                                        : 'border-orange-200 bg-orange-50/30 hover:border-orange-300'
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
                                                <div className="font-bold text-slate-800">#{shipment.invoice_number}</div>
                                                <div className="text-xs text-slate-500">{shipment.supplier_name}</div>
                                            </div>
                                        </div>
                                        {isDelayed && (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                                                تأخير!
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">نوع الوقود:</span>
                                            <span className="font-bold text-slate-700 flex items-center gap-1">
                                                <span 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: shipment.fuel_color || '#94a3b8' }}
                                                ></span>
                                                {shipment.fuel_type || 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">الكمية:</span>
                                            <span className="font-mono font-bold text-blue-600">
                                                {formatNumber(shipment.volume_ordered)} L
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">السائق:</span>
                                            <span className="font-medium text-slate-700">
                                                {shipment.driver_name_resolved || shipment.driver_name || 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">التاريخ:</span>
                                            <span className="font-mono text-slate-600 text-xs">
                                                {new Date(shipment.created_at).toLocaleDateString('ar-EG')}
                                                <span className={`mr-1 ${isDelayed ? 'text-red-600' : 'text-slate-400'}`}>
                                                    ({daysAgo} {daysAgo === 1 ? 'يوم' : 'أيام'})
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Status Banner */}
                                    <div className={`mt-3 pt-3 border-t ${isDelayed ? 'border-red-200' : 'border-orange-200'} text-center`}>
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
            <Card className="bg-white mt-6">
                <Title className="mb-4 text-slate-700 border-b border-slate-100 pb-2">تفاصيل حركة المخزون اليومية (مطابقة الأرصدة)</Title>
                {stats?.warehouse?.daily_reconciliation?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold">
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
                            <tbody className="divide-y divide-slate-100">
                                {stats.warehouse.daily_reconciliation.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 whitespace-nowrap">{row.date}</td>
                                        <td className="p-3 font-bold">{row.tank_name}</td>
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
    
    // Sales Cards
    const renderSales = () => (
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
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
        </div>
    );
    
    // Employee Cards
    const renderEmployees = () => (
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
             <Card className="bg-white">
                <Title className="mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" />
                    أداء الموظفين (المبيعات)
                </Title>
                
                {stats?.employees?.list?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                             <thead className="bg-slate-50 text-slate-500 font-bold">
                                 <tr>
                                     <th className="p-3 rounded-r-xl">الموظف</th>
                                     <th className="p-3">عدد الورديات</th>
                                     <th className="p-3">حجم المبيعات (لتر)</th>
                                     <th className="p-3 rounded-l-xl">الإجمالي (SDG)</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                                 {stats.employees.list.map((emp, idx) => (
                                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                         <td className="p-3 font-bold text-slate-700">{emp.worker_name}</td>
                                         <td className="p-3 text-slate-500">{emp.shifts_count}</td>
                                         <td className="p-3 font-mono text-blue-600">{formatNumber(emp.total_volume)}</td>
                                         <td className="p-3 font-mono font-bold text-emerald-600">{formatNumber(emp.total_sales)}</td>
                                     </tr>
                                 ))}
                             </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                        <Users className="w-12 h-12 text-slate-300 mb-3" />
                         <Text className="text-slate-400">لا توجد بيانات للأداء الوظيفي في هذه الفترة</Text>
                    </div>
                )}
            </Card>
        </div>
    );

    return (
        <div className="p-6 max-w-[1800px] mx-auto min-h-screen space-y-6">
            


            {/* Sub Navigation */}
            <TabGroup index={activeTab} onIndexChange={setActiveTab}>
                <TabList variant="solid" className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 max-w-5xl">
                     <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-emerald-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5"/> <span>التقارير المالية</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-blue-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                             <Droplets className="w-5 h-5"/> <span>المستودعات</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-violet-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                             <TrendingUp className="w-5 h-5"/> <span>المبيعات</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-amber-500 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                             <Users className="w-5 h-5"/> <span>الموظفين</span>
                        </div>
                    </Tab>
                    {/* Financial Flow Tab Removed */}
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-slate-700 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                             <FileText className="w-5 h-5"/> <span>التقرير اليومي</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-cyan-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                             <Truck className="w-5 h-5"/> <span>تقرير مورد</span>
                        </div>
                    </Tab>
                    <Tab className="px-5 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-indigo-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                        <div className="flex items-center gap-2">
                             <Droplets className="w-5 h-5"/> <span>تقرير بير</span>
                        </div>
                    </Tab>
                </TabList>

                {/* Content Grid */}
                <div className="mt-8">
                    {activeTab === 0 && renderFinancial()}
                    {activeTab === 1 && renderWarehouse()}
                    {activeTab === 2 && renderSales()}
                    {activeTab === 3 && renderEmployees()}
                    {/* Financial Flow Tab Removed */}
                    {activeTab === 4 && <DailySalesReconciliation stationId={filters.station_id} />}
                    {activeTab === 5 && <SupplierReport stationId={filters.station_id} />}
                    {activeTab === 6 && <TankSalesReport stationId={filters.station_id} />}
                </div>
            </TabGroup>
        </div>
    );
}
