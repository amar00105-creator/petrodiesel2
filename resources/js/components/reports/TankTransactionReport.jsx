import React, { useState, useEffect } from 'react';
import { Calendar, Printer, Eye, ArrowLeftRight, Droplet } from 'lucide-react';
import { Card, Title, Text } from '@tremor/react';
import { toast } from 'sonner';
import { openPrintPreview, extractTableHTML, formatDateArabic } from '../../utils/printPreview';

export default function TankTransactionReport({ stationId }) {
    const [tanks, setTanks] = useState([]);
    const [selectedTank, setSelectedTank] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0].substring(0, 7) + '-01'); // First day of month
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch tanks on mount or when station changes
    useEffect(() => {
        fetchTanks();
    }, [stationId]);

    // Fetch report when tank or dates change
    useEffect(() => {
        if (selectedTank) {
            fetchReport();
        }
    }, [selectedTank, startDate, endDate]);

    const fetchTanks = async () => {
        try {
            const query = new URLSearchParams({
                action: 'get_stats',
                station_id: stationId || 'all'
            }).toString();
            
            const response = await fetch(`${window.BASE_URL || ''}/reports?${query}`);
            const result = await response.json();
            
            if (result.success && result.warehouse && result.warehouse.tanks) {
                const tanksList = result.warehouse.tanks.map(t => ({
                    id: t.id || t.name, 
                    name: t.name,
                    fuel_type: t.fuel
                }));
                setTanks(tanksList);
                
                if (tanksList.length > 0) {
                    const exists = tanksList.find(t => t.id == selectedTank);
                    if (!exists) setSelectedTank(tanksList[0].id);
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
                action: 'get_tank_transaction_report',
                tank_id: selectedTank,
                start_date: startDate,
                end_date: endDate
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

    const formatNumber = (num) => parseFloat(num || 0).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });

    const handlePrint = () => {
        const content = extractTableHTML('.overflow-x-auto');
        openPrintPreview({
            title: 'تقرير حركة تفصيلية للخزان' + (data?.tank_name ? ' - ' + data.tank_name : ''),
            subtitle: 'من ' + formatDateArabic(startDate) + ' إلى ' + formatDateArabic(endDate),
            content
        });
    };

    // Column header style
    const thClass = "p-3 border border-slate-200 dark:border-white/10 font-black text-[13px] whitespace-nowrap";
    // Cell style
    const tdClass = "p-2.5 border border-slate-200 dark:border-white/10 text-[13px]";

    return (
        <div className="space-y-6 animate-fade-in p-4 print:p-0">
            <Card className="bg-white print:shadow-none print:border-none dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 print:mb-4">
                    <div className="text-center md:text-right">
                        <Title className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <ArrowLeftRight className="w-6 h-6 text-blue-500"/>
                            تقرير حركة تفصيلية للخزان
                        </Title>
                        <Text className="text-slate-500 dark:text-slate-400">
                            {data?.tank_name ? `${data.tank_name} | ` : ''}من {startDate} إلى {endDate}
                        </Text>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 print:hidden">
                        {/* Tank Selector */}
                        <select
                            value={selectedTank}
                            onChange={(e) => setSelectedTank(e.target.value)}
                            className="px-4 py-2 border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        >
                            <option value="">اختر الخزان</option>
                            {tanks.map((tank) => (
                                <option key={tank.id} value={tank.id}>
                                    {tank.name} - {tank.fuel_type}
                                </option>
                            ))}
                        </select>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-slate-700 font-bold text-sm dark:text-white"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-slate-700 font-bold text-sm dark:text-white"
                            />
                        </div>

                        {/* Preview Button */}
                        <button
                            onClick={handlePrint}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            title="معاينة التقرير"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        {/* Print Button */}
                        <button
                            onClick={() => window.print()}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                            title="طباعة مباشرة"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {!selectedTank ? (
                    <div className="text-center py-12 text-slate-400">
                        <Text>الرجاء اختيار خزان لعرض التقرير</Text>
                    </div>
                ) : loading ? (
                    <div className="text-center py-12">
                        <Text className="text-slate-400">جاري التحميل...</Text>
                    </div>
                ) : data ? (
                    <>
                         {/* Summary Cards */}
                         <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                                <div className="text-blue-500 font-bold text-xs mb-1">رصيد ما قبل الفترة</div>
                                <div className="text-xl font-black text-blue-700 dark:text-blue-400 font-mono">
                                    {formatNumber(data.opening_balance)}
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
                                <div className="text-emerald-500 font-bold text-xs mb-1">إجمالي الوارد</div>
                                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                                    {formatNumber(data.total_in)}
                                </div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl border border-red-100 dark:bg-red-900/20 dark:border-red-800">
                                <div className="text-red-500 font-bold text-xs mb-1">إجمالي المنصرف</div>
                                <div className="text-xl font-black text-red-700 dark:text-red-400 font-mono">
                                    {formatNumber(data.total_out)}
                                </div>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800">
                                <div className="text-indigo-500 font-bold text-xs mb-1">رصيد ختامي</div>
                                <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
                                    {formatNumber(data.closing_balance)}
                                </div>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                                <div className="text-slate-500 font-bold text-xs mb-1">عدد الحركات</div>
                                <div className="text-xl font-black text-slate-700 dark:text-slate-300 font-mono">
                                    {data.transactions.length}
                                </div>
                            </div>
                         </div>

                        {/* Transactions Table */}
                        <div className="overflow-x-auto border-2 border-slate-200 rounded-lg dark:border-white/10">
                            <table className="w-full text-center border-collapse" style={{ fontSize: '13px' }}>
                                <thead className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
                                    <tr>
                                        <th className={thClass}>التاريخ</th>
                                        <th className={thClass}>رقم الفاتورة</th>
                                        <th className={`${thClass} text-right`}>البيان</th>
                                        <th className={thClass}>المستخدم</th>
                                        <th className={thClass}>اسم السائق</th>
                                        <th className={thClass}>ملاحظة</th>
                                        <th className={`${thClass} bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400`}>وارد</th>
                                        <th className={`${thClass} bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400`}>منصرف</th>
                                        <th className={`${thClass} bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400`}>الرصيد</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                    {/* Opening Balance Row */}
                                    <tr className="bg-blue-50/70 dark:bg-blue-900/15 font-bold">
                                        <td className={`${tdClass} text-slate-500`}>{startDate}</td>
                                        <td className={`${tdClass} text-slate-400`}>-</td>
                                        <td className={`${tdClass} text-right`}>
                                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold dark:bg-blue-900/40 dark:text-blue-300">
                                                رصيد ما قبل الفترة
                                            </span>
                                        </td>
                                        <td className={`${tdClass} text-slate-400`}>-</td>
                                        <td className={`${tdClass} text-slate-400`}>-</td>
                                        <td className={`${tdClass} text-slate-400`}>-</td>
                                        <td className={`${tdClass} text-slate-400`}>-</td>
                                        <td className={`${tdClass} text-slate-400`}>-</td>
                                        <td className={`${tdClass} font-mono font-black text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20`}>
                                            {formatNumber(data.opening_balance)}
                                        </td>
                                    </tr>

                                    {data.transactions.length > 0 ? (
                                        data.transactions.map((t, idx) => (
                                            <tr key={t.unique_id || idx} className="hover:bg-slate-50 bg-white dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200">
                                                {/* التاريخ */}
                                                <td className={`${tdClass} whitespace-nowrap`} dir="ltr">
                                                    {new Date(t.created_at_ts).toLocaleDateString('en-GB')} <span className="text-[10px] text-slate-400">{new Date(t.created_at_ts).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                {/* رقم الفاتورة */}
                                                <td className={`${tdClass} font-mono`}>
                                                    {t.invoice_number || '-'}
                                                </td>
                                                {/* البيان */}
                                                <td className={`${tdClass} text-right font-bold`}>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        t.type === 'purchase' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                        t.type === 'sale' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' :
                                                        t.type === 'calibration' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}>
                                                        {t.description}
                                                    </span>
                                                </td>
                                                {/* المستخدم */}
                                                <td className={`${tdClass} text-slate-600 dark:text-slate-400`}>
                                                    {t.user_name || '-'}
                                                </td>
                                                {/* اسم السائق */}
                                                <td className={tdClass}>
                                                    {t.driver_name ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold">{t.driver_name}</span>
                                                            {t.truck_number && <span className="text-[10px] opacity-70">{t.truck_number}</span>}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                {/* ملاحظة */}
                                                <td className={`${tdClass} text-xs text-amber-600 dark:text-amber-400`}>
                                                    {t.notes || (t.type === 'calibration' && t.calibration_diff ? `فرق: ${formatNumber(t.calibration_diff)}` : '-')}
                                                </td>
                                                {/* وارد */}
                                                <td className={`${tdClass} font-mono font-bold text-emerald-600 bg-emerald-50/30 dark:text-emerald-400 dark:bg-emerald-900/10`}>
                                                    {parseFloat(t.quantity_in) > 0 ? formatNumber(t.quantity_in) : '-'}
                                                </td>
                                                {/* منصرف */}
                                                <td className={`${tdClass} font-mono font-bold text-red-600 bg-red-50/30 dark:text-red-400 dark:bg-red-900/10`}>
                                                    {parseFloat(t.quantity_out) > 0 ? formatNumber(t.quantity_out) : '-'}
                                                </td>
                                                {/* الرصيد */}
                                                <td className={`${tdClass} font-mono font-black text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20`}>
                                                    {formatNumber(t.balance)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="p-8 text-center text-slate-400">
                                                لا توجد حركات خلال هذه الفترة
                                            </td>
                                        </tr>
                                    )}

                                    {/* Summary/Totals Row */}
                                    {data.transactions.length > 0 && (
                                        <tr className="bg-slate-100 dark:bg-white/10 font-black text-[14px]">
                                            <td colSpan="6" className={`${tdClass} text-right font-black text-slate-700 dark:text-white`}>
                                                الإجمالي
                                            </td>
                                            <td className={`${tdClass} font-mono font-black text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30`}>
                                                {formatNumber(data.total_in)}
                                            </td>
                                            <td className={`${tdClass} font-mono font-black text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30`}>
                                                {formatNumber(data.total_out)}
                                            </td>
                                            <td className={`${tdClass} font-mono font-black text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30`}>
                                                {formatNumber(data.closing_balance)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : null}
            </Card>
        </div>
    );
}
