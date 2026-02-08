import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Eye } from 'lucide-react';
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

                        {/* Preview Button */}
                        <button
                            onClick={() => {
                                const printWindow = window.open('', '_blank');
                                // Get the table content specifically
                                const tableElement = document.querySelector('.overflow-x-auto');
                                const content = tableElement ? tableElement.innerHTML : '<p>لا توجد بيانات</p>';
                                printWindow.document.write(`
                                    <html dir="rtl" lang="ar">
                                    <head>
                                        <title>معاينة تقرير مبيعات البير</title>
                                        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
                                        <style>
                                            * { box-sizing: border-box; margin: 0; padding: 0; }
                                            body { 
                                                font-family: 'Cairo', sans-serif; 
                                                background: #f0f0f0; 
                                                padding: 20px;
                                                display: flex;
                                                justify-content: center;
                                            }
                                            .a4-page {
                                                width: 210mm;
                                                min-height: 297mm;
                                                background: white url('${window.BASE_URL || ''}/img/background.png') no-repeat center center;
                                                background-size: cover;
                                                padding: 8mm 15mm 15mm 15mm;
                                                box-shadow: 0 0 20px rgba(0,0,0,0.15);
                                                position: relative;
                                            }
                                            .report-header {
                                                display: flex;
                                                justify-content: space-between;
                                                align-items: center;
                                                border-bottom: 3px solid #374151;
                                                padding-bottom: 15px;
                                                margin-bottom: 20px;
                                            }
                                            .logo-section img {
                                                height: 60px;
                                                width: auto;
                                            }
                                            .title-section {
                                                text-align: center;
                                                flex: 1;
                                            }
                                            .title-section h1 {
                                                font-size: 20px;
                                                font-weight: 900;
                                                color: #1f2937;
                                                margin-bottom: 5px;
                                            }
                                            .title-section p {
                                                font-size: 14px;
                                                color: #6b7280;
                                            }
                                            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                            th, td { border: 1px solid #333; padding: 8px; text-align: center; font-size: 11px; }
                                            th { background: #374151; color: white; font-weight: bold; }
                                            tfoot td { font-weight: bold; }
                                            .print\\:hidden { display: none !important; }
                                            @media print {
                                                body { background: white; padding: 0; }
                                                .a4-page { box-shadow: none; padding: 10mm; }
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="a4-page">
                                            <div class="report-header">
                                                <div class="logo-section">
                                                    <img src="${window.BASE_URL || ''}/img/logo.png" alt="Petro Diesel" />
                                                </div>
                                                <div class="title-section">
                                                    <h1>تقرير مبيعات البير</h1>
                                                    <p>التاريخ: ${new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                                <div class="logo-section" style="visibility: hidden;">
                                                    <img src="${window.BASE_URL || ''}/img/logo.png" alt="" />
                                                </div>
                                            </div>
                                            ${content}
                                        </div>
                                    </body>
                                    </html>
                                `);
                                printWindow.document.close();
                            }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            title="معاينة التقرير"
                        >
                            <Eye className="w-5 h-5" />
                        </button>

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
