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
            <Card className="bg-white print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:mb-4">
                    <div className="text-center md:text-right">
                        <Title className="text-2xl font-black text-slate-800">
                            تقرير مبيعات البير رقم {data?.tank?.name || ''}
                        </Title>
                        <Text className="text-slate-500">
                            التاريخ: {new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    </div>

                    <div className="flex items-center gap-3 print:hidden">
                        {/* Tank Selector */}
                        <select
                            value={selectedTank}
                            onChange={(e) => setSelectedTank(e.target.value)}
                            className="px-4 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-colors"
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
                                className="pl-3 pr-10 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-colors"
                            />
                            <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                        </div>

                        {/* Print Button */}
                        <button
                            onClick={handlePrint}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
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
                        <div className="overflow-x-auto border-2 border-slate-800 rounded-lg mt-4">
                            <table className="w-full text-center text-sm border-collapse">
                                <thead className="bg-slate-700 text-white font-bold">
                                    <tr>
                                        <th className="p-3 border border-slate-600">رقم المكنة</th>
                                        <th className="p-3 border border-slate-600">الاسم العامل</th>
                                        <th className="p-3 border border-slate-600">العداد الحالي</th>
                                        <th className="p-3 border border-slate-600">العداد السابق</th>
                                        <th className="p-3 border border-slate-600">عدد البيع (لترات)</th>
                                        <th className="p-3 border border-slate-600">سعر اللتر</th>
                                        <th className="p-3 border border-slate-600">مبلغ البيع</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300">
                                    {data.sales.length > 0 ? (
                                        data.sales.map((sale, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 bg-white">
                                                <td className="p-2 border border-slate-300 font-bold">{sale.machine_name}</td>
                                                <td className="p-2 border border-slate-300">{sale.worker_name}</td>
                                                <td className="p-2 border border-slate-300 font-mono">{formatNumber(sale.current_counter)}</td>
                                                <td className="p-2 border border-slate-300 font-mono">{formatNumber(sale.previous_counter)}</td>
                                                <td className="p-2 border border-slate-300 font-mono font-bold text-blue-700">{formatNumber(sale.volume_sold)}</td>
                                                <td className="p-2 border border-slate-300 font-mono">{formatNumber(sale.price_per_liter)}</td>
                                                <td className="p-2 border border-slate-300 font-mono font-bold">{formatNumber(sale.total_amount)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-slate-400 border border-slate-300">
                                                لا توجد مبيعات لهذا البير في هذا التاريخ
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {/* Summary Footer */}
                                <tfoot className="bg-slate-100 font-bold">
                                    <tr className="border-t-2 border-slate-800">
                                        <td colSpan="4" className="p-3 text-right border border-slate-300">إجمالي عدد اللترات المباعة:</td>
                                        <td className="p-3 font-mono text-blue-700 text-lg border border-slate-300">{formatNumber(data.summary.total_volume_sold)}</td>
                                        <td className="p-3 border border-slate-300">مبيعات اليوم</td>
                                        <td className="p-3 font-mono text-lg border border-slate-300">{formatNumber(data.summary.total_amount)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className="p-3 text-right border border-slate-300">كمية الموجودة في البير:</td>
                                        <td colSpan="2" className="p-3 font-mono text-lg border border-slate-300">{formatNumber(data.tank.current_volume)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className="p-3 text-right border border-slate-300">كمية البير السابقة:</td>
                                        <td colSpan="2" className="p-3 font-mono text-lg border border-slate-300">{formatNumber(data.summary.opening_balance)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className="p-3 text-right border border-slate-300">كمية البير الحالية:</td>
                                        <td colSpan="2" className="p-3 font-mono text-lg border border-slate-300">{formatNumber(data.summary.actual_closing)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className="p-3 text-right border border-slate-300">المعايرة بعد البيع:</td>
                                        <td colSpan="2" className="p-3 font-mono text-lg border border-slate-300">{formatNumber(data.summary.theoretical_closing)}</td>
                                    </tr>
                                    <tr className="bg-slate-200">
                                        <td colSpan="5" className="p-3 text-right font-black border border-slate-300">زيادة / عجز كمية:</td>
                                        <td colSpan="2" className={`p-3 font-mono font-black text-xl border border-slate-300 ${data.summary.variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {formatNumber(data.summary.variance)}
                                        </td>
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
