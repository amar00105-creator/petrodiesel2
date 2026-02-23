import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Loader2, Brain, Clock, Eye, X, Lightbulb, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, Sparkles } from 'lucide-react';
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

    // Note type styling — expanded
    const noteStyles = {
        warning:        { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-800 dark:text-amber-300', titleColor: 'text-amber-700 dark:text-amber-400', metricBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300', bar: 'bg-amber-400', actionBg: 'bg-amber-50/80 dark:bg-amber-500/10' },
        success:        { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-800 dark:text-emerald-300', titleColor: 'text-emerald-700 dark:text-emerald-400', metricBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-400', actionBg: 'bg-emerald-50/80 dark:bg-emerald-500/10' },
        fuel:           { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', text: 'text-orange-800 dark:text-orange-300', titleColor: 'text-orange-700 dark:text-orange-400', metricBg: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300', bar: 'bg-orange-400', actionBg: 'bg-orange-50/80 dark:bg-orange-500/10' },
        info:           { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30', text: 'text-blue-800 dark:text-blue-300', titleColor: 'text-blue-700 dark:text-blue-400', metricBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300', bar: 'bg-blue-400', actionBg: 'bg-blue-50/80 dark:bg-blue-500/10' },
        insight:        { bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', text: 'text-violet-800 dark:text-violet-300', titleColor: 'text-violet-700 dark:text-violet-400', metricBg: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300', bar: 'bg-violet-400', actionBg: 'bg-violet-50/80 dark:bg-violet-500/10' },
        recommendation: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/30', text: 'text-indigo-800 dark:text-indigo-300', titleColor: 'text-indigo-700 dark:text-indigo-400', metricBg: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300', bar: 'bg-gradient-to-b from-indigo-400 to-purple-500', actionBg: 'bg-indigo-50/80 dark:bg-indigo-500/10' },
    };

    // Severity colors for the left bar
    const severityBar = {
        high: 'bg-gradient-to-b from-red-500 to-rose-600',
        medium: 'bg-gradient-to-b from-amber-400 to-orange-500',
        low: 'bg-gradient-to-b from-emerald-400 to-teal-500',
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

                {/* ── AI Notes — Premium Redesign ── */}
                <motion.div variants={item}>
                    <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl border border-indigo-200/50 dark:border-indigo-500/20 shadow-2xl">
                        {/* Animated background glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

                        {/* Header with counter badges */}
                        <div className="px-8 py-6 border-b border-indigo-100/50 dark:border-indigo-500/15 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-indigo-50/50 dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-indigo-500/10">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10">
                                        <Sparkles className="w-7 h-7 text-white animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800 dark:text-white tracking-tight">تحليل بترودييزل الذكي</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                                            <Brain className="w-3.5 h-3.5" /> تقرير مولّد بواسطة محرك التحليل المتقدم
                                        </p>
                                    </div>
                                </div>
                                {/* Severity counts */}
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const high = data.ai_notes.filter(n => n.severity === 'high').length;
                                        const medium = data.ai_notes.filter(n => n.severity === 'medium').length;
                                        return (
                                            <div className="flex gap-2 bg-white/50 dark:bg-black/20 p-1 rounded-2xl border border-white/50 dark:border-white/5">
                                                {high > 0 && <span className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-red-500 text-white shadow-lg shadow-red-500/20">{high} عاجل</span>}
                                                {medium > 0 && <span className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-amber-500 text-white shadow-lg shadow-amber-500/20">{medium} تنبيه</span>}
                                                <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/80 dark:bg-white/10 text-slate-600 dark:text-slate-300">{data.ai_notes.length} إجمالي</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Notes List with staggered entrance */}
                        <div className="p-6 sm:p-8 space-y-4">
                            {data.ai_notes.map((note, i) => {
                                const style = noteStyles[note.type] || noteStyles.info;
                                const barColor = severityBar[note.severity] || severityBar.low;
                                const isRecommendation = note.type === 'recommendation';
                                
                                // Dynamic classification label
                                const classification = note.severity === 'high' ? 'إجراء عاجل' : 
                                                     note.severity === 'medium' ? 'تنبيه تشغيلي' : 
                                                     isRecommendation ? 'توصية ذكية' : 'معلومة مفيدة';

                                return (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className={`group relative overflow-hidden rounded-2xl border ${style.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isRecommendation ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="flex min-h-[110px]">
                                            {/* Left Indicator bar */}
                                            <div className={`w-2 flex-shrink-0 ${barColor}`} />
                                            
                                            {/* Body */}
                                            <div className={`flex-1 p-5 ${style.bg} transition-colors duration-300 group-hover:bg-opacity-80`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner ${style.metricBg} group-hover:scale-110 transition-transform`}>
                                                            {note.icon}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`font-black text-base ${style.titleColor}`}>{note.title}</h4>
                                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${style.metricBg}`}>
                                                                    {classification}
                                                                </span>
                                                            </div>
                                                            {/* Metric subtitle if exists */}
                                                            {note.metric && <p className={`text-[11px] font-bold ${style.text} opacity-60`}>{note.metric}</p>}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Impact Badge */}
                                                    {note.metric && (
                                                        <div className={`hidden sm:flex px-4 py-2 rounded-xl text-xs font-black items-center gap-2 ${style.metricBg} border border-white/20`}>
                                                            <Sparkles className="w-3 h-3" />
                                                            {note.metric}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Text Content */}
                                                <div className="pr-2">
                                                    <p className={`text-sm font-semibold leading-relaxed ${style.text}`}>
                                                        {note.text}
                                                    </p>
                                                    
                                                    {/* Action Button styled as info box */}
                                                    {note.action && (
                                                        <div className={`mt-4 p-4 rounded-xl ${style.actionBg} border border-black/[0.03] dark:border-white/[0.05] flex items-start gap-3 shadow-inner group-hover:border-white/10 transition-all`}>
                                                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                                            </div>
                                                            <div>
                                                                <span className="block text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mb-0.5">خطوات مقترحة</span>
                                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                                                    "{note.action}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            
                            {/* Recommendation Summary Section - Only if empty or special case */}
                            {data.ai_notes.length === 0 && (
                                <div className="text-center py-16 px-4">
                                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles className="w-10 h-10 text-indigo-300 dark:text-indigo-500/40" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-700 dark:text-slate-300">اليوم هادئ ومستقر</h4>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 font-bold mt-2 max-w-xs mx-auto">
                                        لم يرصد محرك التحليل أي انحرافات أو مشكلات تتطلب لفت انتباهك حالياً.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Summary Footer Bar */}
                        <div className="px-8 py-4 bg-slate-50/50 dark:bg-black/20 border-t border-indigo-100/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
                            <span>محرك بترودييزل V2.5.0</span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> الحالة: جميع الأنظمة تعمل بكفاءة
                            </span>
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

                {/* Print AI Notes — Enhanced */}
                <div style={{ marginTop: '20px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#1e1b4b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🤖</span> تحليل الأداء الذكي ({data.ai_notes.length} ملاحظة)
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                        {data.ai_notes.map((note, i) => {
                            const sevColor = note.severity === 'high' ? '#ef4444' : note.severity === 'medium' ? '#f59e0b' : '#10b981';
                            const bgColor = note.type === 'warning' ? '#fffbeb' : note.type === 'success' ? '#f0fdf4' : note.type === 'recommendation' ? '#eef2ff' : '#f8fafc';
                            const titleColor = note.type === 'warning' ? '#92400e' : note.type === 'success' ? '#166534' : note.type === 'recommendation' ? '#3730a3' : '#1e40af';
                            return (
                                <div key={i} style={{ 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '10px', 
                                    overflow: 'hidden', 
                                    background: bgColor, 
                                    display: 'flex',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <div style={{ width: '5px', flexShrink: 0, background: sevColor }} />
                                    <div style={{ padding: '12px 16px', flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: titleColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '14px' }}>{note.icon}</span> {note.title}
                                            </span>
                                            {note.metric && (
                                                <span style={{ fontSize: '10px', fontWeight: '900', background: 'rgba(255,255,255,0.6)', padding: '2px 10px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>{note.metric}</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#334155', lineHeight: '1.6', margin: 0 }}>{note.text}</p>
                                        {note.action && (
                                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', gap: '6px', alignItems: 'start' }}>
                                                <span style={{ fontSize: '12px' }}>💡</span>
                                                <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', margin: 0, fontStyle: 'italic' }}>{note.action}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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

                             {/* Preview AI Notes — Enhanced */}
                             <div style={{ marginTop: '20px' }}>
                                <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#1e1b4b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '18px' }}>🤖</span> تحليل الأداء الذكي ({data.ai_notes.length} ملاحظة)
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                    {data.ai_notes.map((note, i) => {
                                        const sevColor = note.severity === 'high' ? '#ef4444' : note.severity === 'medium' ? '#f59e0b' : '#10b981';
                                        const bgColor = note.type === 'warning' ? '#fffbeb' : note.type === 'success' ? '#f0fdf4' : note.type === 'recommendation' ? '#eef2ff' : '#f8fafc';
                                        const titleColor = note.type === 'warning' ? '#92400e' : note.type === 'success' ? '#166534' : note.type === 'recommendation' ? '#3730a3' : '#1e40af';
                                        return (
                                            <div key={i} style={{ 
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '10px', 
                                                overflow: 'hidden', 
                                                background: bgColor, 
                                                display: 'flex'
                                            }}>
                                                <div style={{ width: '5px', flexShrink: 0, background: sevColor }} />
                                                <div style={{ padding: '12px 16px', flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: titleColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '14px' }}>{note.icon}</span> {note.title}
                                                        </span>
                                                        {note.metric && (
                                                            <span style={{ fontSize: '10px', fontWeight: '900', background: 'rgba(255,255,255,0.6)', padding: '2px 10px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>{note.metric}</span>
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#334155', lineHeight: '1.6', margin: 0 }}>{note.text}</p>
                                                    {note.action && (
                                                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', gap: '6px', alignItems: 'start' }}>
                                                            <span style={{ fontSize: '12px' }}>💡</span>
                                                            <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', margin: 0, fontStyle: 'italic' }}>{note.action}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
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
