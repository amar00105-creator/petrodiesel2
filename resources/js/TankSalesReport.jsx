import React, { useState, useEffect } from 'react';
import { Calendar, Printer } from 'lucide-react';
import { Card, Title, Text } from '@tremor/react';
import { toast } from 'sonner';

export default function TankSalesReport({ stationId }) {
    const [tanks, setTanks] = useState([]);
    const [selectedTank, setSelectedTank] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch tanks on mount or when station changes
    useEffect(() => {
        fetchTanks();
    }, [stationId]);

    // Fetch report when tank or date changes
    useEffect(() => {
        if (selectedTank) {
            fetchReport();
        }
    }, [selectedTank, date]);

    const fetchTanks = async () => {
        try {
            // Fetch from stats API which already provides tank data
            const query = new URLSearchParams({
                action: 'get_stats',
                station_id: stationId || 'all'
            }).toString();
            
            const response = await fetch(`${window.BASE_URL || ''}/reports?${query}`);
            const result = await response.json();
            
            if (result.success && result.warehouse && result.warehouse.tanks) {
                // Extract unique tanks with id, name, and fuel type
                const tanksList = result.warehouse.tanks.map(t => ({
                    id: t.id || t.name, // Fallback to name if no ID
                    name: t.name,
                    fuel_type: t.fuel
                }));
                setTanks(tanksList);
                
                // Auto-select first tank if available or reset selection
                if (tanksList.length > 0) {
                     // Check if current selectedTank is still valid, else reset
                    const exists = tanksList.find(t => t.id == selectedTank);
                    if (!exists) {
                        setSelectedTank(tanksList[0].id);
                    }
                } else {
                    setSelectedTank('');
                    setData(null);
                }
            }
        } catch (error) {
            console.error('Failed to fetch tanks:', error);
            toast.error('فشل تحميل قائمة الخزانات');
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                action: 'get_tank_sales',
                tank_id: selectedTank,
                date: date
            }).toString();

            const response = await fetch(`${window.BASE_URL || ''}/reports?${query}`);
            const result = await response.json();

            if (result.success) {
                setData(result);
            } else {
                toast.error(result.message || 'فشل تحميل التقرير');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => parseFloat(num || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 print:p-0">
            <Card className="bg-white print:shadow-none print:border-none dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:mb-4">
                    <div className="text-center md:text-right">
                        <Title className="text-2xl font-black text-slate-800 dark:text-white">
                            تقرير مبيعات البير رقم {data?.tank?.name || ''}
                        </Title>
                        <Text className="text-slate-500 dark:text-slate-400">
                            التاريخ: {new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    </div>

                    <div className="flex items-center gap-3 print:hidden">
                        {/* Tank Selector */}
                        <select
                            value={selectedTank}
                            onChange={(e) => setSelectedTank(e.target.value)}
                            className="px-4 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        >
                            <option value="">اختر البير</option>
                            {tanks.map((tank) => (
                                <option key={tank.id} value={tank.id}>
                                    {tank.name} - {tank.fuel_type}
                                </option>
                            ))}
                        </select>

                        {/* Date Picker */}
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-3 pr-10 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                            <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {!selectedTank ? (
                    <div className="text-center py-12 text-slate-400">
                        <Text>الرجاء اختيار بير لعرض التقرير</Text>
                    </div>
                ) : loading ? (
                    <div className="text-center py-12">
                        <Text className="text-slate-400">جاري التحميل...</Text>
                    </div>
                ) : data ? (
                    <>
                        {/* Sales Table */}
                        <div className="overflow-x-auto border-2 border-slate-800 rounded-lg mt-4 dark:border-white/10">
                            <table className="w-full text-center text-sm border-collapse">
                                <thead className="bg-slate-700 text-white font-bold dark:bg-white/10">
                                    <tr>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">رقم المكنة</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">الاسم العامل</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">العداد الحالي</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">العداد السابق</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">عدد البيع لترات</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10 bg-blue-600">عدد البيع جالون</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">سعر اللتر</th>
                                        <th className="p-3 border border-slate-600 dark:border-white/10">اجمالي مبلغ البيع</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300 dark:divide-white/10">
                                    {data.sales.length > 0 ? (
                                        data.sales.map((sale, idx) => {
                                            const gallons = parseFloat(sale.volume_sold || 0) / 3.78541;
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50 bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200">
                                                    <td className="p-2 border border-slate-300 font-bold dark:border-white/10">{sale.machine_name}</td>
                                                    <td className="p-2 border border-slate-300 dark:border-white/10">{sale.worker_name}</td>
                                                    <td className="p-2 border border-slate-300 font-mono dark:border-white/10">{formatNumber(sale.current_counter)}</td>
                                                    <td className="p-2 border border-slate-300 font-mono dark:border-white/10">{formatNumber(sale.previous_counter)}</td>
                                                    <td className="p-2 border border-slate-300 font-mono font-bold text-blue-700 dark:text-blue-400 dark:border-white/10">{formatNumber(sale.volume_sold)}</td>
                                                    <td className="p-2 border border-slate-300 font-mono font-bold text-blue-700 bg-blue-50 dark:text-blue-400 dark:border-white/10 dark:bg-blue-900/20">{formatNumber(gallons)}</td>
                                                    <td className="p-2 border border-slate-300 font-mono dark:border-white/10">{formatNumber(sale.price_per_liter)}</td>
                                                    <td className="p-2 border border-slate-300 font-mono font-bold dark:border-white/10">{formatNumber(sale.total_amount)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="p-8 text-center text-slate-400 border border-slate-300 dark:border-white/10 dark:bg-white/5">
                                                لا توجد مبيعات لهذا البير في هذا التاريخ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* Summary Footer */}
                                <tfoot className="bg-slate-100 font-bold text-slate-800 dark:bg-white/5 dark:text-white">
                                    {/* Total Sales Row */}
                                    <tr className="border-t-2 border-slate-800 dark:border-white/10 bg-yellow-50 dark:bg-yellow-900/20">
                                        <td colSpan="4" className="p-3 text-right border border-slate-300 dark:border-white/10 font-black">اجمالي البيع</td>
                                        <td className="p-3 font-mono text-blue-700 text-lg border border-slate-300 dark:text-blue-400 dark:border-white/10">{formatNumber(data.summary.total_volume_sold)}</td>
                                        <td className="p-3 font-mono text-blue-700 text-lg border border-slate-300 bg-blue-50 dark:text-blue-400 dark:border-white/10 dark:bg-blue-900/20">{formatNumber(parseFloat(data.summary.total_volume_sold || 0) / 3.78541)}</td>
                                        <td className="p-3 border border-slate-300 dark:border-white/10"></td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 dark:border-white/10">{formatNumber(data.summary.total_amount)}</td>
                                    </tr>
                                    {/* Opening Balance - Tank quantity before sales */}
                                    <tr className="bg-white dark:bg-white/5">
                                        <td colSpan="4" className="p-3 text-right border border-slate-300 dark:border-white/10">كمية البير السابقة قبل البيع</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 dark:border-white/10">{formatNumber(data.summary.opening_balance)}</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 bg-blue-50 dark:border-white/10 dark:bg-blue-900/20">{formatNumber(parseFloat(data.summary.opening_balance || 0) / 3.78541)}</td>
                                        <td colSpan="2" className="p-3 border border-slate-300 dark:border-white/10"></td>
                                    </tr>
                                    {/* After Sales Before Calibration */}
                                    <tr className="bg-white dark:bg-white/5">
                                        <td colSpan="4" className="p-3 text-right border border-slate-300 dark:border-white/10">الكمية البير بعد البيع وقبل المعايره</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 dark:border-white/10">{formatNumber(data.summary.theoretical_closing)}</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 bg-blue-50 dark:border-white/10 dark:bg-blue-900/20">{formatNumber(parseFloat(data.summary.theoretical_closing || 0) / 3.78541)}</td>
                                        <td colSpan="2" className="p-3 border border-slate-300 dark:border-white/10"></td>
                                    </tr>
                                    {/* Calibrated Quantity After Sales */}
                                    <tr className="bg-white dark:bg-white/5">
                                        <td colSpan="4" className="p-3 text-right border border-slate-300 dark:border-white/10">الكمية المعايرة بعد البيع</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 dark:border-white/10">{formatNumber(data.summary.actual_closing)}</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300 bg-blue-50 dark:border-white/10 dark:bg-blue-900/20">{formatNumber(parseFloat(data.summary.actual_closing || 0) / 3.78541)}</td>
                                        <td colSpan="2" className="p-3 border border-slate-300 dark:border-white/10"></td>
                                    </tr>
                                    {/* Variance Row - Red for deficit, Green for surplus */}
                                    <tr className="bg-slate-200 dark:bg-white/10">
                                        <td colSpan="4" className="p-3 text-right font-black border border-slate-300 dark:border-white/10">المعايره عجز زياده</td>
                                        <td className={`p-3 font-mono font-black text-xl border border-slate-300 dark:border-white/10 ${parseFloat(data.summary.variance || 0) < 0 ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' : 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'}`}>
                                            {parseFloat(data.summary.variance || 0) < 0 ? '-' : '+'}{formatNumber(Math.abs(parseFloat(data.summary.variance || 0)))}
                                        </td>
                                        <td className={`p-3 font-mono font-black text-xl border border-slate-300 dark:border-white/10 ${parseFloat(data.summary.variance || 0) < 0 ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' : 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'}`}>
                                            {parseFloat(data.summary.variance || 0) < 0 ? '-' : '+'}{formatNumber(Math.abs(parseFloat(data.summary.variance || 0) / 3.78541))}
                                        </td>
                                        <td colSpan="2" className="p-3 border border-slate-300 dark:border-white/10"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </>
                ) : null}
            </Card>
        </div>
    );
}
