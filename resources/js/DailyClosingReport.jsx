import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Loader2, Brain, Clock, Eye, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DailyClosingReport({ stationId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const sid = stationId || 'all';
            const res = await fetch(`${window.BASE_URL || ''}/reports?action=get_daily_closing&station_id=${sid}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await res.json();
            if (result.success) {
                setData(result);
            } else {
                toast.error(result.message || 'فشل تحميل التقرير');
            }
        } catch (e) {
            console.error(e);
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [stationId]);

    const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtN = (n) => parseFloat(n || 0).toLocaleString('en-US');

    const handlePrint = () => window.print();

    const formatDate = (d) => {
        const date = new Date(d + 'T00:00:00');
        return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = () => new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Animation variants
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 rounded-full animate-spin border-t-indigo-600" />
                    <Brain className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold mt-6">جاري تحليل بيانات اليوم...</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">التقرير الذكي يُحلل البيانات في الوقت الفعلي</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500 dark:text-slate-400">لا توجد بيانات</p>
                <button onClick={fetchData} className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">إعادة المحاولة</button>
            </div>
        );
    }

    const netProfit = data.financial.net_profit;
    const logoUrl = `${window.BASE_URL || ''}/img/logo.png`;

    // Note type styling
    const noteStyles = {
        warning: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-800 dark:text-amber-300' },
        success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-800 dark:text-emerald-300' },
        fuel:    { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', text: 'text-orange-800 dark:text-orange-300' },
        info:    { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', text: 'text-blue-800 dark:text-blue-300' },
    };

    return (
        <div className="space-y-6">
            {/* ═══ Controls Bar ═══ */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">تقرير تقفيل اليوم</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">تقرير ذكي مُولّد تلقائياً • {formatDate(data.date)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/20 transition-all flex items-center gap-2 shadow-sm">
                        <RefreshCw className="w-4 h-4" /> تحديث
                    </button>
                    <button onClick={() => setShowPreview(true)} className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all flex items-center gap-2 shadow-sm">
                        <Eye className="w-4 h-4" /> معاينة
                    </button>
                    <button onClick={handlePrint} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2">
                        <Printer className="w-4 h-4" /> طباعة
                    </button>
                </div>
            </div>

            {/* ═══ SCREEN VIEW ═══ */}
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 print:hidden">
                
                {/* ── Header Card with Logo ── */}
                <motion.div variants={item}>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-6 shadow-2xl">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl bg-white/20 p-1 backdrop-blur-sm shadow-lg" style={{ objectFit: 'contain' }} />
                                <div>
                                    <h1 className="text-2xl font-black text-white tracking-tight">تقرير تقفيل اليوم</h1>
                                    <p className="text-indigo-200 font-semibold text-sm mt-1">Daily Closing Report — AI Generated</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-lg">{data.station_name}</div>
                                <div className="text-indigo-200 text-sm">{formatDate(data.date)}</div>
                                <div className="flex items-center gap-1 text-indigo-300 text-xs mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>تم التوليد: {formatTime()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Quick Stats Row ── */}
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Sales */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-500/30 shadow-lg hover:shadow-xl transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <div className="relative z-10">
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">إجمالي المبيعات</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">{fmt(data.sales.total_amount)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{fmtN(data.sales.total_liters)} لتر • {data.sales.total_count} عملية</div>
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-blue-200/50 dark:border-blue-500/30 shadow-lg hover:shadow-xl transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10" />
                        <div className="relative z-10">
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">الإيرادات</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">{fmt(data.financial.total_income)}</div>
                            <div className="text-xs text-emerald-500 mt-1">↑ دخل اليوم</div>
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-rose-200/50 dark:border-rose-500/30 shadow-lg hover:shadow-xl transition-all group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10" />
                        <div className="relative z-10">
                            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">المصروفات</div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white font-mono">{fmt(data.financial.total_expenses)}</div>
                            <div className="text-xs text-rose-500 mt-1">↓ مصروفات اليوم</div>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className={`relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-white/5 backdrop-blur-xl border shadow-lg hover:shadow-xl transition-all group ${netProfit >= 0 ? 'border-emerald-200/50 dark:border-emerald-500/30' : 'border-red-200/50 dark:border-red-500/30'}`}>
                        <div className={`absolute inset-0 ${netProfit >= 0 ? 'bg-gradient-to-br from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10' : 'bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10'}`} />
                        <div className="relative z-10">
                            <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>صافي الربح</div>
                            <div className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                {netProfit >= 0 ? '+' : ''}{fmt(netProfit)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">ج.س</div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Sales by Fuel + Financial ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales by Fuel */}
                    <motion.div variants={item}>
                        <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg">
                            <div className="px-6 py-4 border-b border-slate-100/50 dark:border-white/10 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-500/10 dark:to-teal-500/10">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⛽</span>
                                    <h3 className="font-black text-slate-800 dark:text-white">المبيعات حسب نوع الوقود</h3>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {data.sales.by_fuel.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">لا توجد مبيعات اليوم</div>
                                ) : (
                                    data.sales.by_fuel.map((f, i) => {
                                        const pct = data.sales.total_amount > 0 ? (f.total_amount / data.sales.total_amount * 100) : 0;
                                        return (
                                            <div key={i} className="p-4 bg-white/60 dark:bg-white/5 rounded-xl border border-slate-100/80 dark:border-white/10 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-slate-800 dark:text-white">{f.fuel_name}</span>
                                                    <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">{fmt(f.total_amount)} ج.س</span>
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                    <span>{fmtN(f.total_liters)} لتر</span>
                                                    <span>{f.sale_count} عملية</span>
                                                </div>
                                                <div className="h-2 bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.15 }}
                                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                {/* Total Row */}
                                {data.sales.by_fuel.length > 0 && (
                                    <div className="mt-2 pt-3 border-t border-slate-200/50 dark:border-white/10 flex justify-between items-center px-1">
                                        <span className="font-black text-sm text-slate-700 dark:text-white">الإجمالي</span>
                                        <div className="text-left">
                                            <span className="font-black font-mono text-indigo-600 dark:text-indigo-400">{fmt(data.sales.total_amount)} ج.س</span>
                                            <span className="text-xs text-slate-400 mr-2">({fmtN(data.sales.total_liters)} لتر)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Cash Balances */}
                    <motion.div variants={item}>
                        <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg">
                            <div className="px-6 py-4 border-b border-slate-100/50 dark:border-white/10 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:from-indigo-500/10 dark:to-violet-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🏦</span>
                                        <h3 className="font-black text-slate-800 dark:text-white">الأرصدة النقدية</h3>
                                    </div>
                                    <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 text-lg">{fmt(data.cash.total_cash)}</span>
                                </div>
                            </div>
                            <div className="p-5 space-y-2">
                                {data.cash.safes.map((s, i) => (
                                    <div key={`s${i}`} className="flex justify-between items-center p-3 bg-white/60 dark:bg-white/5 rounded-xl border border-blue-100/50 dark:border-blue-500/10 hover:bg-white/90 dark:hover:bg-white/10 hover:shadow-md transition-all">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">🔐 {s.name}</span>
                                        <span className="font-bold font-mono text-blue-700 dark:text-blue-400">{fmt(s.balance)}</span>
                                    </div>
                                ))}
                                {data.cash.banks.map((b, i) => (
                                    <div key={`b${i}`} className="flex justify-between items-center p-3 bg-white/60 dark:bg-white/5 rounded-xl border border-violet-100/50 dark:border-violet-500/10 hover:bg-white/90 dark:hover:bg-white/10 hover:shadow-md transition-all">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">🏦 {b.name}</span>
                                        <span className="font-bold font-mono text-violet-700 dark:text-violet-400">{fmt(b.balance)}</span>
                                    </div>
                                ))}

                                {/* Expenses Breakdown */}
                                {data.financial.expenses_breakdown.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10">
                                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3">مصروفات اليوم</div>
                                        {data.financial.expenses_breakdown.map((e, i) => (
                                            <div key={i} className="flex justify-between items-center py-2 px-3 text-sm">
                                                <span className="text-slate-500 dark:text-slate-400">↳ {e.category_name}</span>
                                                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{fmt(e.total_amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Inventory Status ── */}
                <motion.div variants={item}>
                    <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg">
                        <div className="px-6 py-4 border-b border-slate-100/50 dark:border-white/10 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-500/10 dark:to-orange-500/10">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⛽</span>
                                <h3 className="font-black text-slate-800 dark:text-white">مخزون الوقود (البير)</h3>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.inventory.map((t, i) => {
                                    const isCritical = t.fill_pct < 15;
                                    const isLow = t.fill_pct < 30;
                                    const fuelColor = (t.fuel || '').includes('ديزل') || (t.fuel || '').toLowerCase().includes('diesel')
                                        ? { gradient: 'from-amber-400 to-orange-500', border: 'border-amber-200 dark:border-amber-500/30', bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' }
                                        : { gradient: 'from-emerald-400 to-teal-500', border: 'border-emerald-200 dark:border-emerald-500/30', bg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' };

                                    return (
                                        <div key={i} className={`relative overflow-hidden rounded-xl p-4 bg-white/60 dark:bg-white/5 border-2 ${fuelColor.border} ${isCritical ? 'ring-2 ring-red-400/50' : ''} hover:shadow-md transition-all`}>
                                            <div className={`absolute inset-0 bg-gradient-to-br ${fuelColor.bg}`} />
                                            
                                            {/* Fill BG */}
                                            <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${fuelColor.bg} opacity-30 transition-all`} style={{ height: `${Math.min(t.fill_pct, 100)}%` }} />
                                            
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white">{t.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.fuel}</div>
                                                    </div>
                                                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${fuelColor.gradient} text-white shadow-md`}>
                                                        {t.fill_pct}%
                                                    </div>
                                                </div>
                                                
                                                {/* Progress Bar */}
                                                <div className="h-2.5 bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${Math.min(t.fill_pct, 100)}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                                                        className={`h-full bg-gradient-to-r ${fuelColor.gradient} rounded-full shadow-sm`}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div>
                                                        <div className="text-slate-500 dark:text-slate-400">الحجم</div>
                                                        <div className="font-bold font-mono text-slate-800 dark:text-white">{fmtN(t.volume)} L</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-500 dark:text-slate-400">السعة</div>
                                                        <div className="font-mono text-slate-600 dark:text-slate-400">{fmtN(t.capacity)} L</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-500 dark:text-slate-400">القيمة</div>
                                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(t.value)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-500 dark:text-slate-400">يكفي لـ</div>
                                                        <div className={`font-bold ${t.days_remaining !== null && t.days_remaining <= 3 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            {t.days_remaining !== null ? `${t.days_remaining} يوم` : '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── AI Notes ── */}
                <motion.div variants={item}>
                    <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-500/30 shadow-lg">
                        <div className="px-6 py-4 border-b border-indigo-100/50 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-500/10 dark:to-purple-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                    <Brain className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-black text-slate-800 dark:text-white">ملاحظات الذكاء الاصطناعي</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-3">
                            {data.ai_notes.map((note, i) => {
                                const style = noteStyles[note.type] || noteStyles.info;
                                return (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.15 }}
                                        className={`p-4 rounded-xl border ${style.bg} ${style.border} flex items-start gap-3`}
                                    >
                                        <span className="text-xl flex-shrink-0 mt-0.5">{note.icon}</span>
                                        <p className={`text-sm font-semibold leading-relaxed ${style.text}`}>{note.text}</p>
                                    </motion.div>
                                );
                            })}
                            {data.ai_notes.length === 0 && (
                                <div className="text-center py-6 text-slate-400 dark:text-slate-500">لا توجد ملاحظات خاصة لهذا اليوم.</div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Footer ── */}
                <motion.div variants={item} className="text-center py-4">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        تم التوليد بواسطة نظام بترودييزل — تقرير ذكي تلقائي • PetroDiesel ERP v2.0 • {data.date}
                    </p>
                </motion.div>
            </motion.div>

            {/* ═══════════════ A4 PRINT VIEW (hidden on screen) ═══════════════ */}
            <div id="daily-report-a4" className="hidden print:block" style={{
                width: '210mm', minHeight: '297mm', padding: '15mm 18mm',
                fontFamily: "'Segoe UI', Tahoma, sans-serif",
                direction: 'rtl', color: '#1e293b', fontSize: '11px', lineHeight: '1.6'
            }}>
                {/* Print Header */}
                <div style={{ borderBottom: '3px solid #4f46e5', paddingBottom: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={logoUrl} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e1b4b', margin: 0 }}>تقرير تقفيل اليوم</h1>
                                <p style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700', margin: '2px 0 0' }}>Daily Closing Report — AI Generated</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800' }}>{data.station_name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{formatDate(data.date)}</div>
                        </div>
                    </div>
                </div>

                {/* Print Sales Table */}
                <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>📊 ملخص المبيعات</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9' }}>
                                <th style={thStyle}>نوع الوقود</th><th style={thStyle}>الكمية (لتر)</th><th style={thStyle}>المبلغ (ج.س)</th><th style={thStyle}>العمليات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.sales.by_fuel.map((f, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{f.fuel_name}</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmtN(f.total_liters)}</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700' }}>{fmt(f.total_amount)}</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{f.sale_count}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#eef2ff', fontWeight: '800' }}>
                                <td style={tdStyle}>الإجمالي</td>
                                <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmtN(data.sales.total_liters)}</td>
                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#4f46e5' }}>{fmt(data.sales.total_amount)}</td>
                                <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{data.sales.total_count}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Print Financial + Cash */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>💵 الموقف المالي</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                            <tbody>
                                <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ ...tdStyle, fontWeight: '700' }}>إجمالي الإيرادات</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#16a34a', fontWeight: '700' }}>{fmt(data.financial.total_income)}</td>
                                </tr>
                                <tr style={{ background: '#fef2f2', borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ ...tdStyle, fontWeight: '700' }}>إجمالي المصروفات</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#dc2626', fontWeight: '700' }}>{fmt(data.financial.total_expenses)}</td>
                                </tr>
                                {data.financial.expenses_breakdown.map((e, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ ...tdStyle, paddingRight: '24px', color: '#64748b', fontSize: '10px' }}>↳ {e.category_name}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8' }}>{fmt(e.total_amount)}</td>
                                    </tr>
                                ))}
                                <tr style={{ background: netProfit >= 0 ? '#ecfdf5' : '#fef2f2', borderTop: '2px solid #e2e8f0' }}>
                                    <td style={{ ...tdStyle, fontWeight: '800', fontSize: '12px' }}>صافي الربح/الخسارة</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '900', fontSize: '13px', color: netProfit >= 0 ? '#059669' : '#dc2626' }}>{netProfit >= 0 ? '+' : ''}{fmt(netProfit)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>🏦 الأرصدة النقدية</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                            <thead><tr style={{ background: '#f1f5f9' }}><th style={thStyle}>الحساب</th><th style={thStyle}>الرصيد</th></tr></thead>
                            <tbody>
                                {data.cash.safes.map((s, i) => (
                                    <tr key={`s${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>🔐 {s.name}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>{fmt(s.balance)}</td>
                                    </tr>
                                ))}
                                {data.cash.banks.map((b, i) => (
                                    <tr key={`b${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>🏦 {b.name}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700', color: '#7c3aed' }}>{fmt(b.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: '#eef2ff', fontWeight: '800' }}>
                                    <td style={tdStyle}>الإجمالي</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#4f46e5' }}>{fmt(data.cash.total_cash)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Print Inventory */}
                <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>⛽ مخزون الوقود</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                        <thead><tr style={{ background: '#f1f5f9' }}>
                            <th style={thStyle}>الخزان</th><th style={thStyle}>الصنف</th><th style={thStyle}>الحجم</th><th style={thStyle}>السعة</th><th style={thStyle}>النسبة</th><th style={thStyle}>القيمة</th><th style={thStyle}>يكفي لـ</th>
                        </tr></thead>
                        <tbody>
                            {data.inventory.map((t, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: t.fill_pct < 15 ? '#fef2f2' : 'transparent' }}>
                                    <td style={{ ...tdStyle, fontWeight: '700' }}>{t.name}</td>
                                    <td style={tdStyle}>{t.fuel}</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700' }}>{fmtN(t.volume)}</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#64748b' }}>{fmtN(t.capacity)}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: t.fill_pct < 20 ? '#dc2626' : '#64748b' }}>{t.fill_pct}%</td>
                                    <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmt(t.value)}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: t.days_remaining !== null && t.days_remaining <= 3 ? '#dc2626' : '#64748b' }}>{t.days_remaining !== null ? `${t.days_remaining} يوم` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Print AI Notes */}
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>🤖 ملاحظات الذكاء الاصطناعي</h2>
                    <div style={{ border: '1px solid #c7d2fe', borderRadius: '8px', overflow: 'hidden' }}>
                        {data.ai_notes.map((note, i) => (
                            <div key={i} style={{
                                padding: '10px 14px', borderBottom: i < data.ai_notes.length - 1 ? '1px solid #e0e7ff' : 'none',
                                background: note.type === 'warning' ? '#fffbeb' : note.type === 'success' ? '#f0fdf4' : '#f8fafc',
                                display: 'flex', alignItems: 'flex-start', gap: '8px'
                            }}>
                                <span style={{ fontSize: '16px', flexShrink: 0 }}>{note.icon}</span>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: note.type === 'warning' ? '#92400e' : note.type === 'success' ? '#166534' : '#334155', lineHeight: '1.7' }}>{note.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Print Footer */}
                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}>
                    <span>تم التوليد بواسطة نظام بترودييزل — تقرير ذكي تلقائي</span>
                    <span>PetroDiesel ERP v2.0 • {data.date}</span>
                </div>
            </div>

            {/* ═══ Preview Modal ═══ */}
            {showPreview && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto print:hidden" onClick={() => setShowPreview(false)}>
                    <div className="relative my-8 bg-white rounded-2xl shadow-2xl max-w-[240mm] w-full" onClick={(e) => e.stopPropagation()}>
                        {/* Preview Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white/95 backdrop-blur-xl border-b border-slate-200 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-emerald-600" />
                                <span className="font-bold text-slate-800">معاينة قبل الطباعة</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setShowPreview(false); handlePrint(); }} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2">
                                    <Printer className="w-4 h-4" /> طباعة
                                </button>
                                <button onClick={() => setShowPreview(false)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Preview Content - renders the same A4 layout */}
                        <div style={{
                            width: '210mm', minHeight: '297mm', padding: '15mm 18mm',
                            fontFamily: "'Segoe UI', Tahoma, sans-serif",
                            direction: 'rtl', color: '#1e293b', fontSize: '11px', lineHeight: '1.6',
                            margin: '0 auto'
                        }}>
                            {/* Preview Header */}
                            <div style={{ borderBottom: '3px solid #4f46e5', paddingBottom: '10px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={logoUrl} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                        <div>
                                            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1e1b4b', margin: 0 }}>تقرير تقفيل اليوم</h1>
                                            <p style={{ fontSize: '12px', color: '#6366f1', fontWeight: '700', margin: '2px 0 0' }}>Daily Closing Report — AI Generated</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '800' }}>{data.station_name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{formatDate(data.date)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Sales Table */}
                            <div style={{ marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>📊 ملخص المبيعات</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                                    <thead>
                                        <tr style={{ background: '#f1f5f9' }}>
                                            <th style={thStyle}>نوع الوقود</th><th style={thStyle}>الكمية (لتر)</th><th style={thStyle}>المبلغ (ج.س)</th><th style={thStyle}>العمليات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.sales.by_fuel.map((f, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ ...tdStyle, fontWeight: '700' }}>{f.fuel_name}</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmtN(f.total_liters)}</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700' }}>{fmt(f.total_amount)}</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{f.sale_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ background: '#eef2ff', fontWeight: '800' }}>
                                            <td style={tdStyle}>الإجمالي</td>
                                            <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmtN(data.sales.total_liters)}</td>
                                            <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#4f46e5' }}>{fmt(data.sales.total_amount)}</td>
                                            <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{data.sales.total_count}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Preview Financial + Cash */}
                            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>💵 الموقف المالي</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                                        <tbody>
                                            <tr style={{ background: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ ...tdStyle, fontWeight: '700' }}>إجمالي الإيرادات</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#16a34a', fontWeight: '700' }}>{fmt(data.financial.total_income)}</td>
                                            </tr>
                                            <tr style={{ background: '#fef2f2', borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ ...tdStyle, fontWeight: '700' }}>إجمالي المصروفات</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#dc2626', fontWeight: '700' }}>{fmt(data.financial.total_expenses)}</td>
                                            </tr>
                                            {data.financial.expenses_breakdown.map((e, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ ...tdStyle, paddingRight: '24px', color: '#64748b', fontSize: '10px' }}>↳ {e.category_name}</td>
                                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '10px', color: '#94a3b8' }}>{fmt(e.total_amount)}</td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: netProfit >= 0 ? '#ecfdf5' : '#fef2f2', borderTop: '2px solid #e2e8f0' }}>
                                                <td style={{ ...tdStyle, fontWeight: '800', fontSize: '12px' }}>صافي الربح/الخسارة</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '900', fontSize: '13px', color: netProfit >= 0 ? '#059669' : '#dc2626' }}>{netProfit >= 0 ? '+' : ''}{fmt(netProfit)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>🏦 الأرصدة النقدية</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                                        <thead><tr style={{ background: '#f1f5f9' }}><th style={thStyle}>الحساب</th><th style={thStyle}>الرصيد</th></tr></thead>
                                        <tbody>
                                            {data.cash.safes.map((s, i) => (
                                                <tr key={`s${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ ...tdStyle, fontWeight: '600' }}>🔐 {s.name}</td>
                                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>{fmt(s.balance)}</td>
                                                </tr>
                                            ))}
                                            {data.cash.banks.map((b, i) => (
                                                <tr key={`b${i}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ ...tdStyle, fontWeight: '600' }}>🏦 {b.name}</td>
                                                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700', color: '#7c3aed' }}>{fmt(b.balance)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ background: '#eef2ff', fontWeight: '800' }}>
                                                <td style={tdStyle}>الإجمالي</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#4f46e5' }}>{fmt(data.cash.total_cash)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Preview Inventory */}
                            <div style={{ marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>⛽ مخزون الوقود</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                                    <thead><tr style={{ background: '#f1f5f9' }}>
                                        <th style={thStyle}>الخزان</th><th style={thStyle}>الصنف</th><th style={thStyle}>الحجم</th><th style={thStyle}>السعة</th><th style={thStyle}>النسبة</th><th style={thStyle}>القيمة</th><th style={thStyle}>يكفي لـ</th>
                                    </tr></thead>
                                    <tbody>
                                        {data.inventory.map((t, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: t.fill_pct < 15 ? '#fef2f2' : 'transparent' }}>
                                                <td style={{ ...tdStyle, fontWeight: '700' }}>{t.name}</td>
                                                <td style={tdStyle}>{t.fuel}</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700' }}>{fmtN(t.volume)}</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#64748b' }}>{fmtN(t.capacity)}</td>
                                                <td style={{ ...tdStyle, fontWeight: '700', color: t.fill_pct < 20 ? '#dc2626' : '#64748b' }}>{t.fill_pct}%</td>
                                                <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{fmt(t.value)}</td>
                                                <td style={{ ...tdStyle, fontWeight: '700', color: t.days_remaining !== null && t.days_remaining <= 3 ? '#dc2626' : '#64748b' }}>{t.days_remaining !== null ? `${t.days_remaining} يوم` : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Preview AI Notes */}
                            <div>
                                <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 8px' }}>🤖 ملاحظات الذكاء الاصطناعي</h2>
                                <div style={{ border: '1px solid #c7d2fe', borderRadius: '8px', overflow: 'hidden' }}>
                                    {data.ai_notes.map((note, i) => (
                                        <div key={i} style={{
                                            padding: '10px 14px', borderBottom: i < data.ai_notes.length - 1 ? '1px solid #e0e7ff' : 'none',
                                            background: note.type === 'warning' ? '#fffbeb' : note.type === 'success' ? '#f0fdf4' : '#f8fafc',
                                            display: 'flex', alignItems: 'flex-start', gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '16px', flexShrink: 0 }}>{note.icon}</span>
                                            <span style={{ fontSize: '11px', fontWeight: '600', color: note.type === 'warning' ? '#92400e' : note.type === 'success' ? '#166534' : '#334155', lineHeight: '1.7' }}>{note.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Footer */}
                            <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8' }}>
                                <span>تم التوليد بواسطة نظام بترودييزل — تقرير ذكي تلقائي</span>
                                <span>PetroDiesel ERP v2.0 • {data.date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print CSS */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #daily-report-a4, #daily-report-a4 * { visibility: visible !important; }
                    #daily-report-a4 {
                        display: block !important;
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 210mm !important; min-height: 297mm !important;
                        margin: 0 !important; box-shadow: none !important;
                    }
                    @page { size: A4; margin: 0; }
                }
            `}
            </style>
        </div>
    );
}

const thStyle = { padding: '8px 10px', textAlign: 'right', fontSize: '10px', fontWeight: '800', color: '#475569', borderBottom: '2px solid #cbd5e1', letterSpacing: '0.5px' };
const tdStyle = { padding: '7px 10px', textAlign: 'right', fontSize: '11px', color: '#334155' };
