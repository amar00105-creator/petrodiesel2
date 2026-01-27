import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, Calendar, FileDown, Droplets, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, Title, Text, Metric, Badge } from '@tremor/react';
import { toast } from 'sonner';

export default function DailySalesReconciliation({ stationId }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                action: 'get_detailed_daily_sales',
                date: date,
                station_id: stationId || 'all'
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

    useEffect(() => {
        fetchReport();
    }, [date, stationId]);

    const formatNumber = (num) => parseFloat(num || 0).toLocaleString('en-US');
    const formatCurrency = (amount) => parseFloat(amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 print:p-0">
            {/* Header / Filter */}
            <Card className="bg-white print:shadow-none print:border-none">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <div className="text-center md:text-right">
                        <Title className="text-2xl font-black text-slate-800">تقرير مبيعات العدادات اليومية</Title>
                        <Text className="text-slate-500">تفاصيل المبيعات وحركة الخزانات</Text>
                    </div>
                    
                    <div className="flex items-center gap-3 print:hidden">
                        <div className="relative">
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-3 pr-10 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-colors"
                            />
                            <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                        <button 
                            onClick={handlePrint}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Print Only Date Display */}
                    <div className="hidden print:block font-bold text-xl">
                        التاريخ: {date}
                    </div>
                </div>

                {/* Sales Table */}
                <div className="overflow-x-auto border-2 border-slate-200 rounded-lg mt-4">
                    <table className="w-full text-center text-sm">
                        <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300">
                            <tr>
                                <th className="p-3 border-r border-slate-200">#</th>
                                <th className="p-3 border-r border-slate-200">رقم المكنة</th>
                                <th className="p-3 border-r border-slate-200">اسم العامل</th>
                                <th className="p-3 border-r border-slate-200 bg-blue-50">العداد الحالي</th>
                                <th className="p-3 border-r border-slate-200 bg-orange-50">العداد السابق</th>
                                <th className="p-3 border-r border-slate-200 bg-emerald-50">عدد البيع (لترات)</th>
                                <th className="p-3 border-r border-slate-200">سعر اللتر</th>
                                <th className="p-3 bg-indigo-50">مبلغ البيع</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">جاري التحميل...</td>
                                </tr>
                            ) : data?.sales?.length > 0 ? (
                                data.sales.map((sale, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors bg-white">
                                        <td className="p-2 border-r border-slate-100 font-mono text-slate-400">{idx + 1}</td>
                                        <td className="p-2 border-r border-slate-100 font-bold">{sale.machine_name} <span className="text-xs text-slate-400">({sale.fuel_type})</span></td>
                                        <td className="p-2 border-r border-slate-100">{sale.worker_name}</td>
                                        <td className="p-2 border-r border-slate-100 font-mono font-bold text-blue-700">{formatNumber(sale.current_counter)}</td>
                                        <td className="p-2 border-r border-slate-100 font-mono text-slate-600">{formatNumber(sale.previous_counter)}</td>
                                        <td className="p-2 border-r border-slate-100 font-mono font-bold text-emerald-600 text-lg bg-emerald-50/30">{formatNumber(sale.volume_sold)}</td>
                                        <td className="p-2 border-r border-slate-100 font-mono">{formatNumber(sale.price_per_liter)}</td>
                                        <td className="p-2 font-mono font-bold text-indigo-700 bg-indigo-50/30">{formatNumber(sale.total_amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">لا توجد مبيعات مسجلة في هذا التاريخ</td>
                                </tr>
                            )}
                        </tbody>
                        {data?.totals && (
                            <tfoot className="bg-slate-800 text-white font-bold border-t-2 border-slate-800">
                                <tr>
                                    <td colSpan="5" className="p-3 text-left pl-6">الإجمالي الكلي</td>
                                    <td className="p-3 font-mono text-emerald-300 text-lg">{formatNumber(data.totals.total_liters)}</td>
                                    <td className="p-3"></td>
                                    <td className="p-3 font-mono text-indigo-300 text-lg">{formatNumber(data.totals.total_amount)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Tank Reconciliation Section */}
                {data?.tanks?.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.tanks.map((tank, idx) => (
                            <div key={idx} className="border-2 border-slate-200 rounded-xl overflow-hidden print:border-slate-800 print:break-inside-avoid">
                                <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                    <div className="font-bold text-slate-700">{tank.tank_name}</div>
                                    <Badge size="xs" color={tank.fuel_type.includes('Benzine') ? 'emerald' : 'amber'}>{tank.fuel_type}</Badge>
                                </div>
                                <div className="p-4 space-y-3 bg-white text-sm">
                                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-2">
                                        <span className="text-slate-500">كمية البير السابقة (Opening)</span>
                                        <span className="font-mono font-bold">{formatNumber(tank.opening_balance)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-600">
                                        <span className="flex items-center gap-1"><ArrowDown className="w-3 h-3" /> وارد (Purchases)</span>
                                        <span className="font-mono font-bold">+{formatNumber(tank.purchases_in)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-600">
                                        <span className="flex items-center gap-1"><ArrowUp className="w-3 h-3" /> مبيعات (Sales)</span>
                                        <span className="font-mono font-bold">-{formatNumber(tank.sales_out)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                        <span className="text-slate-700 font-bold">الرصيد الدفتري (Theoretical)</span>
                                        <span className="font-mono font-bold text-blue-700">{formatNumber(tank.theoretical_balance)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-2">
                                        <span className="text-slate-500">المعايرة الفعلية (Actual)</span>
                                        <span className="font-mono font-bold text-slate-800">{formatNumber(tank.actual_balance)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="font-bold text-slate-700">زيادة / عجز (Variance)</span>
                                        <span className={`font-mono font-black text-lg ${tank.variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {formatNumber(tank.variance)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
