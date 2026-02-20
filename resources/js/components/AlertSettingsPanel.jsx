import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Switch } from '@tremor/react';
import { 
    Droplets, CreditCard, Truck, Users, TrendingDown, Clock, 
    Bell, BellOff, AlertTriangle, Gauge, Wallet, CalendarDays,
    Info, Zap
} from 'lucide-react';

/**
 * AlertSettingsPanel — Configurable alert thresholds for the Settings page.
 * Matches the existing glassmorphism + dark mode aesthetic.
 */
export default function AlertSettingsPanel({ alerts = {}, currency = 'SDG', onSettingsChange }) {
    const [settings, setSettings] = useState({
        // Tank fuel level
        alert_tank_enabled: alerts.alert_tank_enabled ?? '1',
        alert_tank_low_threshold: alerts.alert_tank_low_threshold ?? '20',
        alert_tank_critical_threshold: alerts.alert_tank_critical_threshold ?? '10',
        // Customer credit
        alert_credit_enabled: alerts.alert_credit_enabled ?? '1',
        alert_credit_threshold: alerts.alert_credit_threshold ?? '80',
        // Supplier debt
        alert_supplier_enabled: alerts.alert_supplier_enabled ?? '1',
        alert_supplier_debt_min: alerts.alert_supplier_debt_min ?? '100000',
        // Payroll
        alert_payroll_enabled: alerts.alert_payroll_enabled ?? '1',
        alert_payroll_day: alerts.alert_payroll_day ?? '25',
        // Price review
        alert_price_enabled: alerts.alert_price_enabled ?? '1',
        alert_price_review_days: alerts.alert_price_review_days ?? '30',
        // High loss
        alert_loss_enabled: alerts.alert_loss_enabled ?? '1',
        alert_loss_threshold: alerts.alert_loss_threshold ?? '1',
    });

    const handleChange = (key, value) => {
        const updated = { ...settings, [key]: String(value) };
        setSettings(updated);
        if (onSettingsChange) onSettingsChange(updated);
    };

    // Sync parent on mount
    useEffect(() => {
        if (onSettingsChange) onSettingsChange(settings);
    }, []);

    const cardBase = "rounded-2xl shadow-lg ring-1 p-6 space-y-5 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:shadow-black/20 hover:shadow-xl transition-all duration-300 relative overflow-hidden";

    const alertCards = [
        {
            id: 'tank',
            title: 'مستوى الوقود في الخزانات',
            description: 'تنبيه عند انخفاض مستوى الوقود في الخزانات عن النسبة المحددة',
            icon: Droplets,
            enableKey: 'alert_tank_enabled',
            gradient: 'from-blue-500 via-cyan-500 to-blue-600',
            ringColor: 'ring-blue-100/50 dark:ring-blue-500/20 hover:ring-blue-200/80 dark:hover:ring-blue-500/30',
            iconGradient: 'from-blue-500 to-cyan-600',
            shadowColor: 'shadow-blue-500/20',
            focusRing: 'focus:ring-blue-500',
            fields: [
                {
                    label: 'حد التنبيه (نسبة السعة %)',
                    key: 'alert_tank_low_threshold',
                    type: 'range',
                    min: 5, max: 50, step: 5,
                    suffix: '%',
                    hint: 'عندما ينخفض مستوى الوقود عن هذه النسبة سيظهر تنبيه تحذيري',
                    severity: 'warning'
                },
                {
                    label: 'حد التنبيه الحرج (نسبة السعة %)',
                    key: 'alert_tank_critical_threshold',
                    type: 'range',
                    min: 2, max: 25, step: 1,
                    suffix: '%',
                    hint: 'عندما ينخفض مستوى الوقود عن هذه النسبة سيظهر تنبيه خطير',
                    severity: 'critical'
                }
            ]
        },
        {
            id: 'credit',
            title: 'تجاوز حد ائتمان العملاء',
            description: 'تنبيه عند اقتراب أو تجاوز العميل لحد الائتمان المحدد',
            icon: CreditCard,
            enableKey: 'alert_credit_enabled',
            gradient: 'from-amber-500 via-orange-500 to-amber-600',
            ringColor: 'ring-amber-100/50 dark:ring-amber-500/20 hover:ring-amber-200/80 dark:hover:ring-amber-500/30',
            iconGradient: 'from-amber-500 to-orange-600',
            shadowColor: 'shadow-amber-500/20',
            focusRing: 'focus:ring-amber-500',
            fields: [
                {
                    label: 'نسبة التنبيه من حد الائتمان (%)',
                    key: 'alert_credit_threshold',
                    type: 'range',
                    min: 50, max: 100, step: 5,
                    suffix: '%',
                    hint: 'مثال: 80% يعني التنبيه عندما يصل العميل إلى 80% من حد الائتمان',
                    severity: 'warning'
                }
            ]
        },
        {
            id: 'supplier',
            title: 'مستحقات الموردين',
            description: 'تنبيه عند وجود مبالغ كبيرة مستحقة للموردين',
            icon: Truck,
            enableKey: 'alert_supplier_enabled',
            gradient: 'from-violet-500 via-purple-500 to-violet-600',
            ringColor: 'ring-violet-100/50 dark:ring-violet-500/20 hover:ring-violet-200/80 dark:hover:ring-violet-500/30',
            iconGradient: 'from-violet-500 to-purple-600',
            shadowColor: 'shadow-violet-500/20',
            focusRing: 'focus:ring-violet-500',
            fields: [
                {
                    label: `الحد الأدنى للتنبيه (${currency})`,
                    key: 'alert_supplier_debt_min',
                    type: 'number',
                    min: 0, step: 10000,
                    suffix: currency,
                    hint: 'المبلغ الأدنى لمستحقات المورد الذي يستدعي التنبيه'
                }
            ]
        },
        {
            id: 'payroll',
            title: 'تذكير الرواتب',
            description: 'تنبيه قبل نهاية الشهر بعدم صرف رواتب الموظفين',
            icon: CalendarDays,
            enableKey: 'alert_payroll_enabled',
            gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
            ringColor: 'ring-emerald-100/50 dark:ring-emerald-500/20 hover:ring-emerald-200/80 dark:hover:ring-emerald-500/30',
            iconGradient: 'from-emerald-500 to-teal-600',
            shadowColor: 'shadow-emerald-500/20',
            focusRing: 'focus:ring-emerald-500',
            fields: [
                {
                    label: 'بداية التنبيه من يوم',
                    key: 'alert_payroll_day',
                    type: 'select',
                    options: Array.from({ length: 20 }, (_, i) => ({
                        value: String(i + 10),
                        label: `يوم ${i + 10} من الشهر`
                    })),
                    hint: 'سيظهر التنبيه إذا لم يتم صرف الرواتب بعد هذا اليوم'
                }
            ]
        },
        {
            id: 'price',
            title: 'مراجعة أسعار الوقود',
            description: 'تنبيه عند عدم تحديث أسعار الوقود لفترة طويلة',
            icon: TrendingDown,
            enableKey: 'alert_price_enabled',
            gradient: 'from-rose-500 via-pink-500 to-rose-600',
            ringColor: 'ring-rose-100/50 dark:ring-rose-500/20 hover:ring-rose-200/80 dark:hover:ring-rose-500/30',
            iconGradient: 'from-rose-500 to-pink-600',
            shadowColor: 'shadow-rose-500/20',
            focusRing: 'focus:ring-rose-500',
            fields: [
                {
                    label: 'عدد الأيام بدون تحديث',
                    key: 'alert_price_review_days',
                    type: 'number',
                    min: 7, max: 365, step: 1,
                    suffix: 'يوم',
                    hint: 'سيظهر تنبيه تذكيري بمراجعة الأسعار بعد هذا العدد من الأيام'
                }
            ]
        },
        {
            id: 'loss',
            title: 'كشف الفاقد العالي',
            description: 'تنبيه عند اكتشاف نسبة فاقد عالية في الخزانات',
            icon: AlertTriangle,
            enableKey: 'alert_loss_enabled',
            gradient: 'from-red-500 via-orange-500 to-red-600',
            ringColor: 'ring-red-100/50 dark:ring-red-500/20 hover:ring-red-200/80 dark:hover:ring-red-500/30',
            iconGradient: 'from-red-500 to-orange-600',
            shadowColor: 'shadow-red-500/20',
            focusRing: 'focus:ring-red-500',
            fields: [
                {
                    label: 'نسبة الفاقد المقبولة (%)',
                    key: 'alert_loss_threshold',
                    type: 'range',
                    min: 0.5, max: 5, step: 0.5,
                    suffix: '%',
                    hint: 'إذا تجاوز الفاقد هذه النسبة سيظهر تنبيه'
                }
            ]
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {/* Summary Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="md:col-span-2 xl:col-span-3"
            >
                <div className={`${cardBase} ring-indigo-100/50 dark:ring-indigo-500/20`}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600 rounded-t-2xl"></div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <Title className="dark:text-white text-lg mb-1">مركز التنبيهات الذكية</Title>
                            <Text className="dark:text-slate-400 text-right">
                                قم بضبط حدود التنبيهات لتناسب احتياجاتك. التنبيهات المفعلة ستظهر تلقائياً في لوحة المراقبة وشريط الإشعارات عند تجاوز الحدود المحددة.
                            </Text>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-white/[0.05] px-4 py-2.5 rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            <div className="text-right">
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                                    {Object.keys(settings).filter(k => k.endsWith('_enabled') && settings[k] === '1').length}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block">تنبيه مفعل</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Alert Cards */}
            {alertCards.map((card, idx) => {
                const isEnabled = settings[card.enableKey] === '1';
                const Icon = card.icon;

                return (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + idx * 0.06 }}
                    >
                        <Card className={`${cardBase} ${card.ringColor} ${!isEnabled ? 'opacity-60' : ''}`}>
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} rounded-t-2xl`}></div>
                            
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.iconGradient} shadow-lg ${card.shadowColor}`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <Title className="dark:text-white text-sm mb-0.5">{card.title}</Title>
                                        <Text className="text-xs dark:text-slate-400">{card.description}</Text>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Switch
                                        checked={isEnabled}
                                        onChange={(val) => handleChange(card.enableKey, val ? '1' : '0')}
                                    />
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        {isEnabled ? 'مفعل' : 'معطل'}
                                    </span>
                                </div>
                            </div>

                            {/* Fields */}
                            {isEnabled && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-2 border-t border-slate-100/80 dark:border-white/[0.06]"
                                >
                                    {card.fields.map(field => (
                                        <div key={field.key}>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {field.label}
                                                </label>
                                                {field.severity && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                        field.severity === 'critical' 
                                                            ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
                                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                                    }`}>
                                                        {field.severity === 'critical' ? 'حرج' : 'تحذيري'}
                                                    </span>
                                                )}
                                            </div>

                                            {field.type === 'range' && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="range"
                                                            min={field.min}
                                                            max={field.max}
                                                            step={field.step}
                                                            value={settings[field.key] || field.min}
                                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                                            className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500
                                                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-emerald-400 [&::-webkit-slider-thumb]:to-teal-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-slate-800"
                                                        />
                                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.08] px-3 py-1.5 rounded-lg min-w-[65px] justify-center">
                                                            <span className="text-sm font-black text-slate-800 dark:text-white font-mono">
                                                                {settings[field.key]}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{field.suffix}</span>
                                                        </div>
                                                    </div>
                                                    {/* Range labels */}
                                                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
                                                        <span>{field.min}{field.suffix}</span>
                                                        <span>{field.max}{field.suffix}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {field.type === 'number' && (
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min={field.min}
                                                        max={field.max}
                                                        step={field.step}
                                                        value={settings[field.key] || ''}
                                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                                        className={`w-full rounded-xl border-slate-200 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white px-4 py-2.5 pr-16 text-right ${field.focusRing || 'focus:ring-emerald-500'} focus:ring-2 border outline-none transition-all font-mono font-bold text-lg`}
                                                    />
                                                    <span className="absolute left-4 top-3 text-xs text-slate-400 dark:text-slate-500 font-bold">{field.suffix}</span>
                                                </div>
                                            )}

                                            {field.type === 'select' && (
                                                <select
                                                    value={settings[field.key] || ''}
                                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white px-4 py-2.5 text-right focus:ring-2 focus:ring-emerald-500 border outline-none transition-all font-bold"
                                                >
                                                    {field.options.map(opt => (
                                                        <option key={opt.value} value={opt.value} className="dark:bg-slate-800">{opt.label}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {field.hint && (
                                                <div className="flex items-start gap-1.5 mt-2">
                                                    <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                                                    <Text className="text-[11px] text-slate-400 dark:text-slate-500 text-right leading-relaxed">{field.hint}</Text>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {/* Disabled overlay message */}
                            {!isEnabled && (
                                <div className="flex items-center gap-2 p-3 bg-slate-50/80 dark:bg-white/[0.03] rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                                    <BellOff className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    <Text className="text-xs text-slate-400 dark:text-slate-500">هذا التنبيه معطل حالياً</Text>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
