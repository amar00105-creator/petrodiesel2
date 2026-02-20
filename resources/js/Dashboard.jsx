import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    Wallet, 
    DollarSign,
    Fuel,
    Activity,
    Plus, 
    Truck, 
    Banknote, 
    Clock, 
    ArrowRight,
    FileText,
    BarChart3,
    Droplets,
    Vault,
    Building2,
    ArrowDownToLine,
    Gauge,
    CircleDot,
    ShieldCheck,
    Layers
} from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import InventoryWidget from './components/dashboard/InventoryWidget';
import AddTransactionModal from './AddTransactionModal';

// Color palette for inline styles (prevents Tailwind purging)
const colorPalette = {
    emerald:  { main: '#10b981', light: '#34d399', dark: '#059669', bg: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.35)', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
    blue:     { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', bg: 'rgba(59,130,246,0.12)', glow: 'rgba(59,130,246,0.35)', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
    amber:    { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.35)', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
    red:      { main: '#ef4444', light: '#f87171', dark: '#dc2626', bg: 'rgba(239,68,68,0.12)', glow: 'rgba(239,68,68,0.35)', gradient: 'linear-gradient(135deg, #ef4444, #f43f5e)' },
    indigo:   { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', bg: 'rgba(99,102,241,0.12)', glow: 'rgba(99,102,241,0.35)', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
    orange:   { main: '#f97316', light: '#fb923c', dark: '#ea580c', bg: 'rgba(249,115,22,0.12)', glow: 'rgba(249,115,22,0.35)', gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
    cyan:     { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', bg: 'rgba(6,182,212,0.12)', glow: 'rgba(6,182,212,0.35)', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
    purple:   { main: '#a855f7', light: '#c084fc', dark: '#9333ea', bg: 'rgba(168,85,247,0.12)', glow: 'rgba(168,85,247,0.35)', gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
};

// Theme-aware token factory
function useThemeTokens() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return {
        isDark,
        // Page background
        pageBg: isDark
            ? 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)'
            : 'linear-gradient(135deg, #f0f4ff 0%, #e8ecf4 50%, #dfe6f0 100%)',
        // Glass card
        cardBg: isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.75)',
        cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        cardShadow: isDark
            ? '0 4px 24px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 4px 24px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        cardBlur: isDark ? 'blur(24px)' : 'blur(20px)',
        // Section panel (lighter card)
        panelBg: isDark ? 'rgba(30,41,59,0.4)' : 'rgba(255,255,255,0.6)',
        panelBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        panelShadow: isDark ? '0 4px 24px -4px rgba(0,0,0,0.3)' : '0 4px 16px -4px rgba(0,0,0,0.06)',
        // Inner block (bars area)
        innerBg: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)',
        innerBorder: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        // Bar track
        barTrack: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
        // Text colors
        textPrimary: isDark ? '#f1f5f9' : '#1e293b',
        textSecondary: isDark ? '#e2e8f0' : '#334155',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        textDimmed: isDark ? '#64748b' : '#94a3b8',
        // Table header
        tableHeaderBg: isDark ? 'rgba(15,23,42,0.5)' : 'rgba(0,0,0,0.03)',
        tableRowBorder: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
        tableRowHover: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.06)',
        // Separator
        separator: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        // Quick action button
        qaBg: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.7)',
        qaBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        qaShadow: isDark ? '0 2px 12px -2px rgba(0,0,0,0.3)' : '0 2px 12px -2px rgba(0,0,0,0.06)',
        // Value text color (uses colored palette in dark, darker shade in light)
        valueColor: (palette) => isDark ? palette.light : palette.dark,
        valueGlow: (palette) => isDark ? `0 0 20px ${palette.glow}` : 'none',
        // Glass reflection
        reflectionOpacity: isDark ? '0.03' : '0.15',
        reflectionHoverOpacity: isDark ? '0.06' : '0.25',
        // Glow blob opacity multiplier
        glowBlobBg: (palette) => isDark ? palette.bg : palette.bg.replace('0.12', '0.08'),
    };
}

// Animation Variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

// === Glass Financial Card ===
function GlassFinancialCard({ title, value, subtitle, icon: Icon, color = 'emerald', children, t }) {
    const palette = colorPalette[color] || colorPalette.emerald;
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03, boxShadow: `0 8px 40px -8px ${palette.glow}` }}
            className="relative overflow-hidden rounded-2xl p-5 group transition-all duration-500 cursor-default"
            style={{ 
                background: t.cardBg,
                backdropFilter: t.cardBlur,
                WebkitBackdropFilter: t.cardBlur,
                border: `1px solid ${t.cardBorder}`,
                boxShadow: t.cardShadow,
            }}
        >
            {/* Glow blob */}
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150" 
                style={{ background: t.glowBlobBg(palette) }}
            ></div>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100" 
                style={{ background: t.glowBlobBg(palette) }}
            ></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-xs font-bold mb-1.5" style={{ color: t.textMuted }}>{title}</p>
                    <h3 className="text-2xl font-black font-mono" style={{ color: t.valueColor(palette), textShadow: t.valueGlow(palette) }}>
                        {value}
                    </h3>
                    {subtitle && <p className="text-[10px] mt-1.5 font-medium tracking-wider uppercase" style={{ color: t.textDimmed }}>{subtitle}</p>}
                </div>
                <div 
                    className="p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ 
                        background: palette.gradient,
                        color: '#fff',
                        boxShadow: `0 8px 24px -4px ${palette.glow}`,
                    }}
                >
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                </div>
            </div>

            {/* Children (e.g. fuel volume breakdown) */}
            {children && <div className="relative z-10 mt-3">{children}</div>}
            
            {/* Bottom highlight bar */}
            <div 
                className="absolute bottom-0 left-0 w-full h-[2px] opacity-40 group-hover:opacity-100 transition-all duration-500"
                style={{ background: `linear-gradient(to right, transparent, ${palette.main}, transparent)` }}
            ></div>
            
            {/* Glass reflection */}
            <div className={`absolute top-0 left-0 w-full h-1/2 transition-opacity duration-500`}
                style={{ 
                    background: 'linear-gradient(to bottom, white, transparent)', 
                    opacity: t.isDark ? 0.03 : 0.15,
                }}
            ></div>
        </motion.div>
    );
}

// === Glass Quick Action Button ===
function GlassQuickAction({ label, desc, icon: Icon, color, link, onClick, t }) {
    const palette = colorPalette[color] || colorPalette.blue;
    return (
        <motion.button
            onClick={() => onClick ? onClick() : (window.location.href = window.BASE_URL ? window.BASE_URL + link : link)}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="relative group overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all duration-300"
            style={{ 
                background: t.qaBg,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${t.qaBorder}`,
                boxShadow: t.qaShadow,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${palette.main}50`;
                e.currentTarget.style.boxShadow = `0 8px 32px -8px ${palette.glow}, inset 0 1px 0 ${t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'}`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = `1px solid ${t.qaBorder}`;
                e.currentTarget.style.boxShadow = t.qaShadow;
            }}
        >
            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                style={{ background: `radial-gradient(circle at center, ${palette.bg}, transparent 70%)` }}
            ></div>
            
            {/* Icon */}
            <div 
                className="relative z-10 p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ background: palette.gradient, color: '#fff', boxShadow: `0 6px 20px -4px ${palette.glow}` }}
            >
                <Icon className="w-5 h-5" strokeWidth={2.5} />
            </div>

            {/* Label */}
            <span className="font-bold text-xs tracking-wide z-10 relative" style={{ color: t.textSecondary }}>{label}</span>
            {desc && <span className="text-[9px] z-10 relative font-medium -mt-1" style={{ color: t.textDimmed }}>{desc}</span>}
        </motion.button>
    );
}

// === Compact Horizontal Bar Component ===
function HorizontalBar({ label, value, maxValue, color, displayValue, delay = 0, t }) {
    const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
    return (
        <div className="flex items-center gap-3 group" style={{ direction: 'rtl' }}>
            <span className="text-[11px] font-bold w-[70px] text-right truncate" style={{ color: t.textSecondary }}>{label}</span>
            <div className="flex-1 h-[18px] rounded-full overflow-hidden relative" style={{ background: t.barTrack }}>
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay, ease: 'easeOut' }}
                    className="h-full rounded-full relative"
                    style={{ 
                        background: `linear-gradient(90deg, ${color}80, ${color})`, 
                        boxShadow: t.isDark ? `0 0 16px ${color}50` : `0 0 8px ${color}30`, 
                        minWidth: pct > 0 ? 6 : 0 
                    }}
                >
                    <div className="absolute inset-0 rounded-full opacity-30" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)' }}></div>
                </motion.div>
            </div>
            <span className="text-[11px] font-mono font-bold w-[60px] text-left" style={{ color, textShadow: t.isDark ? `0 0 8px ${color}40` : 'none' }}>{displayValue}</span>
        </div>
    );
}

// === Performance Summary Section ===
function PerformanceSummary({ recentSales, stock, todaySales, safeBalance, todayPetrolVolume, todayDieselVolume, bankBalance, todayIncoming, wells, t }) {
    const sales = recentSales || [];
    const maxAmount = Math.max(...sales.map(s => parseFloat(s.total_amount) || 0), 1);
    const maxVolume = Math.max(...sales.map(s => parseFloat(s.volume_sold) || 0), 1);

    const activeWells = (wells || []).length;

    return (
        <div className="space-y-5">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryMiniCard label="إجمالي المبيعات" value={parseFloat(todaySales || 0).toLocaleString()} color={colorPalette.emerald} icon={TrendingUp} t={t} />
                <SummaryMiniCard label="رصيد الخزينة" value={parseFloat(safeBalance || 0).toLocaleString()} color={colorPalette.amber} icon={Vault} t={t} />
                <SummaryMiniCard label="رصيد البنك" value={parseFloat(bankBalance || 0).toLocaleString()} color={colorPalette.blue} icon={Building2} t={t} />
                <SummaryMiniCard label="الوقود الوارد اليوم" value={`${parseFloat(todayIncoming || 0).toLocaleString()} لتر`} color={colorPalette.cyan} icon={ArrowDownToLine} t={t} />
            </div>

            {/* Sales Bars Section */}
            {sales.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Sales Amount */}
                    <div className="rounded-xl p-4" style={{ background: t.innerBg, border: `1px solid ${t.innerBorder}` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 8px #10b98180' }}></div>
                            <span className="text-xs font-bold" style={{ color: t.textSecondary }}>المبيعات (المبلغ)</span>
                        </div>
                        <div className="space-y-2">
                            {sales.slice(0, 5).map((sale, i) => (
                                <HorizontalBar key={i} label={sale.pump_name || sale.time || `#${i + 1}`} value={parseFloat(sale.total_amount) || 0} maxValue={maxAmount} color="#10b981" displayValue={parseFloat(sale.total_amount || 0).toLocaleString()} delay={i * 0.08} t={t} />
                            ))}
                        </div>
                    </div>

                    {/* Volume Sold */}
                    <div className="rounded-xl p-4" style={{ background: t.innerBg, border: `1px solid ${t.innerBorder}` }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f680' }}></div>
                            <span className="text-xs font-bold" style={{ color: t.textSecondary }}>الكميات المباعة (لتر)</span>
                        </div>
                        <div className="space-y-2">
                            {sales.slice(0, 5).map((sale, i) => (
                                <HorizontalBar key={i} label={sale.pump_name || sale.time || `#${i + 1}`} value={parseFloat(sale.volume_sold) || 0} maxValue={maxVolume} color="#3b82f6" displayValue={`${parseFloat(sale.volume_sold || 0).toFixed(1)}L`} delay={i * 0.08} t={t} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Levels */}
            <div className="rounded-xl p-4" style={{ background: t.innerBg, border: `1px solid ${t.innerBorder}` }}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b80' }}></div>
                        <span className="text-xs font-bold" style={{ color: t.textSecondary }}>مستوى المخزون</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                        {activeWells} خزان
                    </span>
                </div>
                <div className="space-y-2">
                    <HorizontalBar label="بنزين" value={stock.petrol?.current || 0} maxValue={stock.petrol?.capacity || 1} color="#10b981" displayValue={`${(stock.petrol?.current || 0).toLocaleString()}L`} delay={0} t={t} />
                    <HorizontalBar label="ديزل" value={stock.diesel?.current || 0} maxValue={stock.diesel?.capacity || 1} color="#3b82f6" displayValue={`${(stock.diesel?.current || 0).toLocaleString()}L`} delay={0.08} t={t} />
                    {(stock.gas?.capacity || 0) > 0 && (
                        <HorizontalBar label="غاز" value={stock.gas?.current || 0} maxValue={stock.gas?.capacity || 1} color="#f59e0b" displayValue={`${(stock.gas?.current || 0).toLocaleString()}L`} delay={0.16} t={t} />
                    )}
                </div>
            </div>
        </div>
    );
}

// === Summary Mini Card ===
function SummaryMiniCard({ label, value, color, icon: Icon, t }) {
    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl p-3 text-center group transition-all duration-300 hover:scale-105"
            style={{ 
                background: t.isDark ? color.bg : `${color.main}08`,
                border: `1px solid ${color.main}20`,
                cursor: 'default',
            }}
        >
            <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-3 h-3" style={{ color: color.main }} />
                <div className="text-[10px] font-bold" style={{ color: t.textMuted }}>{label}</div>
            </div>
            <div className="text-sm font-black font-mono" style={{ color: t.valueColor(color), textShadow: t.valueGlow(color) }}>
                {value}
            </div>
        </motion.div>
    );
}

// === Fuel Volume Breakdown Tag ===
function FuelVolumeTag({ label, volume, color, t }) {
    return (
        <div 
            className="flex items-center justify-between px-3 py-1.5 rounded-lg"
            style={{ background: `${color}${t.isDark ? '10' : '08'}`, border: `1px solid ${color}${t.isDark ? '25' : '18'}` }}
        >
            <div className="flex items-center gap-1.5">
                <Droplets className="w-3 h-3" style={{ color }} />
                <span className="text-[10px] font-bold" style={{ color: t.textMuted }}>{label}</span>
            </div>
            <span className="text-xs font-black font-mono" style={{ color: t.isDark ? color : `${color}dd`, textShadow: t.isDark ? `0 0 8px ${color}30` : 'none' }}>
                {parseFloat(volume || 0).toLocaleString()} لتر
            </span>
        </div>
    );
}

// === Quick Stat Row for sidebar ===
function QuickStatRow({ label, value, color, icon: Icon, t }) {
    return (
        <div 
            className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group hover:scale-[1.02]"
            style={{ 
                background: t.isDark ? color.bg : `${color.main}08`,
                border: `1px solid ${color.main}15`,
            }}
        >
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: color.gradient, color: '#fff', boxShadow: `0 2px 8px -2px ${color.glow}` }}>
                    <Icon className="w-3 h-3" strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: t.textMuted }}>{label}</span>
            </div>
            <span className="text-xs font-black font-mono" style={{ color: t.valueColor(color), textShadow: t.valueGlow(color) }}>
                {value}
            </span>
        </div>
    );
}


// === MAIN DASHBOARD ===
export default function Dashboard({ data, categories, safes, banks, suppliers, customers }) {
    const [activeModal, setActiveModal] = useState(null);
    const t = useThemeTokens();
    const safeData = data || {};
    
    const stock = {
        petrol: safeData.petrolStock || { current: 0, capacity: 10000 },
        diesel: safeData.dieselStock || { current: 0, capacity: 10000 },
        gas: safeData.gasStock || { current: 0, capacity: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen p-3 pb-8 overflow-y-auto"
            style={{ 
                fontFamily: "'Cairo', sans-serif",
                background: t.pageBg,
            }}
        >
            <div className="max-w-[1920px] mx-auto w-full">
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                    
                    {/* 1. RIGHT SIDEBAR (Quick Actions & Inventory) */}
                    <motion.div variants={itemVariants} className="xl:col-span-3 space-y-3">
                        
                        {/* A. Quick Actions */}
                        <motion.div 
                            variants={itemVariants}
                            className="rounded-2xl p-4"
                            style={{ 
                                background: t.panelBg,
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${t.panelBorder}`,
                                boxShadow: t.panelShadow,
                            }}
                        >
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: t.textSecondary }}>
                                <div className="p-1.5 rounded-lg" style={{ background: colorPalette.blue.gradient, color: '#fff', boxShadow: `0 4px 12px -4px ${colorPalette.blue.glow}` }}>
                                    <Activity className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </div>
                                عمليات سريعة
                            </h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                <GlassQuickAction label="بيع جديد" desc="تسجيل بيع" icon={Plus} color="emerald" link="/sales/create" t={t} />
                                <GlassQuickAction label="استلام وقود" desc="مشتريات" icon={Truck} color="blue" link="/purchases/create" t={t} />
                                <GlassQuickAction label="مصروف" desc="نثريات" icon={Banknote} color="red" onClick={() => setActiveModal('expense')} t={t} />
                                <GlassQuickAction label="تقفيل اليوم" desc="تقرير اليوم" icon={Clock} color="indigo" link="/reports?tab=daily_closing" t={t} />
                                <GlassQuickAction label="مبيعات الآبار" desc="تقرير تفصيلي" icon={Fuel} color="orange" link="/reports?tab=sales&subtab=tank_sales" t={t} />
                                <GlassQuickAction label="كشف حساب" desc="خزنة / بنك" icon={FileText} color="purple" link="/reports?tab=financial&subtab=statement&group=fuel_type" t={t} />
                            </div>
                        </motion.div>

                        {/* B. Inventory Widgets */}
                        <div className="grid grid-cols-2 gap-3" style={{ minHeight: '200px' }}>
                            <div style={{ height: '200px' }}>
                                <InventoryWidget type="بنزين" current={stock.petrol.current} capacity={stock.petrol.capacity} color="emerald" isDark={t.isDark} />
                            </div>
                            <div style={{ height: '200px' }}>
                                <InventoryWidget type="ديزل" current={stock.diesel.current} capacity={stock.diesel.capacity} color="blue" isDark={t.isDark} />
                            </div>
                        </div>

                        {/* C. Station Quick Stats */}
                        <motion.div 
                            variants={itemVariants}
                            className="rounded-2xl p-4"
                            style={{ 
                                background: t.panelBg,
                                backdropFilter: 'blur(16px)',
                                border: `1px solid ${t.panelBorder}`,
                                boxShadow: t.panelShadow,
                            }}
                        >
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: t.textSecondary }}>
                                <div className="p-1.5 rounded-lg" style={{ background: colorPalette.cyan.gradient, color: '#fff', boxShadow: `0 4px 12px -4px ${colorPalette.cyan.glow}` }}>
                                    <Gauge className="w-3.5 h-3.5" strokeWidth={2.5} />
                                </div>
                                نظرة عامة
                            </h3>
                            <div className="space-y-2">
                                <QuickStatRow label="الخزانات النشطة" value={`${(safeData.wells || []).length} خزان`} color={colorPalette.indigo} icon={Layers} t={t} />
                                <QuickStatRow label="الوقود الوارد اليوم" value={`${parseFloat(safeData.todayIncoming || 0).toLocaleString()} لتر`} color={colorPalette.cyan} icon={ArrowDownToLine} t={t} />
                                <QuickStatRow label="رصيد البنك" value={parseFloat(safeData.bankBalance || 0).toLocaleString()} color={colorPalette.blue} icon={Building2} t={t} />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* 2. LEFT CONTENT (Financials, Chart & Table) */}
                    <div className="xl:col-span-9 space-y-3">
                        
                        {/* Financial Cards Row */}
                        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <GlassFinancialCard 
                                title="مبيعات اليوم"
                                value={parseFloat(safeData.todaySales || 0).toLocaleString('en-US')}
                                subtitle="إجمالي مبيعات الوردية"
                                icon={TrendingUp}
                                color="emerald"
                                t={t}
                            >
                                {/* Fuel Volume Breakdown */}
                                <div className="space-y-1.5">
                                    <FuelVolumeTag label="بنزين" volume={safeData.todayPetrolVolume} color="#10b981" t={t} />
                                    <FuelVolumeTag label="ديزل / جاز" volume={safeData.todayDieselVolume} color="#3b82f6" t={t} />
                                </div>
                            </GlassFinancialCard>
                            <GlassFinancialCard 
                                title="المصروفات"
                                value={parseFloat(safeData.todayExpenses || 0).toLocaleString('en-US')}
                                subtitle="نثريات وتشغيل"
                                icon={Wallet}
                                color="red"
                                t={t}
                            />
                            <GlassFinancialCard 
                                title="رصيد الخزينة"
                                value={parseFloat(safeData.safeBalance || 0).toLocaleString('en-US')}
                                subtitle="النقدية الحالية"
                                icon={DollarSign}
                                color="amber"
                                t={t}
                            />
                        </motion.div>

                        {/* Performance Summary */}
                        <motion.div 
                            variants={itemVariants}
                            className="rounded-2xl overflow-hidden"
                            style={{ 
                                background: t.cardBg,
                                backdropFilter: t.cardBlur,
                                border: `1px solid ${t.cardBorder}`,
                                boxShadow: t.cardShadow,
                            }}
                        >
                            <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${t.separator}` }}>
                                <div className="p-2 rounded-xl" style={{ background: colorPalette.indigo.gradient, color: '#fff', boxShadow: `0 4px 16px -4px ${colorPalette.indigo.glow}` }}>
                                    <BarChart3 className="w-4 h-4" strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm" style={{ color: t.textSecondary }}>ملخص الأداء</h3>
                                    <p className="text-[9px] font-medium tracking-wider uppercase" style={{ color: t.textDimmed }}>المبيعات • الكميات • المخزون</p>
                                </div>
                            </div>
                            <div className="px-5 py-4">
                                <PerformanceSummary 
                                    recentSales={safeData.recentSales} stock={stock}
                                    todaySales={safeData.todaySales} safeBalance={safeData.safeBalance}
                                    todayPetrolVolume={safeData.todayPetrolVolume} todayDieselVolume={safeData.todayDieselVolume}
                                    bankBalance={safeData.bankBalance} todayIncoming={safeData.todayIncoming}
                                    wells={safeData.wells} t={t}
                                />
                            </div>
                        </motion.div>

                        {/* Recent Transactions Table */}
                        <motion.div 
                            variants={itemVariants}
                            className="rounded-2xl overflow-hidden"
                            style={{ 
                                background: t.cardBg,
                                backdropFilter: t.cardBlur,
                                border: `1px solid ${t.cardBorder}`,
                                boxShadow: t.cardShadow,
                            }}
                        >
                            <div className="px-5 py-3 flex justify-between items-center" 
                                style={{ borderBottom: `1px solid ${t.separator}`, background: t.isDark ? 'rgba(15,23,42,0.3)' : 'rgba(0,0,0,0.02)' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl" style={{ background: colorPalette.cyan.gradient, color: '#fff', boxShadow: `0 4px 16px -4px ${colorPalette.cyan.glow}` }}>
                                        <FileText className="w-4 h-4" strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm" style={{ color: t.textSecondary }}>سجل العمليات الحديثة</h3>
                                        <p className="text-[9px] font-medium" style={{ color: t.textDimmed }}>آخر المعاملات المسجلة</p>
                                    </div>
                                </div>
                                <button 
                                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                                    style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="overflow-auto scrollbar-thin" style={{ maxHeight: '400px' }}>
                                <table className="w-full text-sm text-right">
                                    <thead>
                                        <tr style={{ background: t.tableHeaderBg }}>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>الوقت</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>النوع</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>الموظف</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>التفاصيل</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-left" style={{ color: '#34d399' }}>المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                        {safeData.recentSales && safeData.recentSales.slice(0, 10).map((sale, idx) => (
                                            <motion.tr 
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.04, duration: 0.25 }}
                                                className="group transition-all duration-200"
                                                style={{ 
                                                    borderLeft: '3px solid #10b981',
                                                    borderBottom: `1px solid ${t.tableRowBorder}`,
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = t.tableRowHover}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td className="p-3 font-mono text-xs" style={{ color: t.textMuted }}>{sale.time}</td>
                                                <td className="p-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                        style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}
                                                    >
                                                        <Fuel className="w-3 h-3" /> بيع
                                                    </span>
                                                </td>
                                                <td className="p-3 font-medium truncate max-w-[120px] text-xs" style={{ color: t.textSecondary }}>{sale.worker_name}</td>
                                                <td className="p-3 truncate max-w-[180px] text-xs" style={{ color: t.textMuted }}>
                                                    {sale.pump_name} <span style={{ opacity: 0.4 }}>|</span> {parseFloat(sale.volume_sold).toFixed(2)}L
                                                </td>
                                                <td className="p-3 font-mono font-bold text-left text-xs" dir="ltr" 
                                                    style={{ color: '#34d399', textShadow: t.isDark ? '0 0 12px rgba(16,185,129,0.4)' : 'none' }}
                                                >
                                                    {parseFloat(sale.total_amount).toLocaleString()}
                                                </td>
                                            </motion.tr>
                                        ))}
                                        </AnimatePresence>
                                        {(!safeData.recentSales || safeData.recentSales.length === 0) && (
                                            <tr>
                                                <td colSpan="5" className="p-12 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FileText className="w-8 h-8 opacity-30" style={{ color: t.textDimmed }} />
                                                        <span className="text-xs font-medium" style={{ color: t.textDimmed }}>لا توجد عمليات مسجلة</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Modal */}
            <AddTransactionModal 
                isOpen={activeModal === 'expense'}
                onClose={() => setActiveModal(null)}
                type={'expense'}
                categories={categories || []}
                safes={safes || []}
                banks={banks || []}
                suppliers={suppliers || []}
                customers={customers || []}
                baseUrl={window.BASE_URL}
            />
        </motion.div>
    );
}
