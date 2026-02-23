import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Ruler, Save, Loader2, ArrowUpDown, StickyNote, Clock, History } from 'lucide-react';
import { toast } from 'sonner';
import SuccessAnimation from './SuccessAnimation';

/**
 * Professional Glassmorphism Calibration Modal
 * Features: glass edges, dark/light mode, fuel type icon with color, English numbers
 */
const SimpleCalibrationModal = ({ tank, isOpen, onClose, onSuccess }) => {
    const [actualQuantity, setActualQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [variance, setVariance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastCalibration, setLastCalibration] = useState(null);
    const [unit, setUnit] = useState(() => localStorage.getItem('calibration_unit') || 'liters');

    const GALLON_FACTOR = 4.5; // 1 gallon = 4.5 liters
    const toGallons = (liters) => liters / GALLON_FACTOR;
    const toLiters = (gallons) => gallons * GALLON_FACTOR;
    const unitLabel = unit === 'gallons' ? 'جالون' : 'لتر';

    const handleUnitChange = (newUnit) => {
        setUnit(newUnit);
        localStorage.setItem('calibration_unit', newUnit);
        // Convert existing input value to new unit
        if (actualQuantity) {
            const val = parseFloat(actualQuantity);
            if (!isNaN(val)) {
                if (newUnit === 'gallons') {
                    setActualQuantity((val / GALLON_FACTOR).toFixed(2));
                } else {
                    setActualQuantity((val * GALLON_FACTOR).toFixed(2));
                }
            }
        }
    };

    // Fetch last calibration when modal opens
    useEffect(() => {
        if (isOpen && tank?.id) {
            fetchLastCalibration();
        }
    }, [isOpen, tank?.id]);

    const fetchLastCalibration = async () => {
        try {
            const res = await fetch(`${window.BASE_URL}/calibrations/history?tank_id=${tank.id}`);
            const data = await res.json();
            if (data.success && data.calibrations && data.calibrations.length > 0) {
                setLastCalibration(data.calibrations[0]); // First = most recent
            } else {
                setLastCalibration(null);
            }
        } catch (e) {
            console.warn('Could not fetch calibration history', e);
            setLastCalibration(null);
        }
    };

    // Calculate variance automatically (always in the current display unit)
    useEffect(() => {
        if (actualQuantity && tank) {
            const currentVolumeL = parseFloat(tank.current_volume || tank.current || 0);
            const displayCurrent = unit === 'gallons' ? toGallons(currentVolumeL) : currentVolumeL;
            const actualQty = parseFloat(actualQuantity) || 0;
            const diff = actualQty - displayCurrent;
            setVariance(isNaN(diff) ? 0 : diff);
        } else {
            setVariance(0);
        }
    }, [actualQuantity, tank, unit]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setActualQuantity('');
            setNotes('');
            setVariance(0);
            setLastCalibration(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!actualQuantity || parseFloat(actualQuantity) < 0) {
            toast.error('يرجى إدخال الكمية الفعلية');
            return;
        }

        // Convert input to liters for validation and saving
        const inputInLiters = unit === 'gallons' ? toLiters(parseFloat(actualQuantity)) : parseFloat(actualQuantity);

        if (inputInLiters > parseFloat(tank.capacity_liters || tank.total_cap)) {
            toast.error('الكمية تتجاوز سعة الخزان!');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${window.BASE_URL}/calibrations/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tank_id: tank.id,
                    actual_quantity: inputInLiters,
                    notes: notes
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                    onClose();
                }, 3000);
            } else {
                toast.error(data.message || 'فشل في حفظ المعايرة');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    if (!tank) return null;

    // Format numbers in English
    const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const fmtFixed = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Format date/time in English
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const date = d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return { date, time };
    };

    // Fuel type detection & theming
    const productName = tank.product || tank.name || '';
    const isDiesel = productName.includes('Diesel') || productName.includes('ديزل') || productName.includes('جاز');
    const isPetrol = productName.includes('بنزين') || productName.includes('Petrol') || productName.includes('91') || productName.includes('95');

    const fuelTheme = isDiesel ? {
        gradient: 'from-blue-500 to-cyan-600',
        lightGradient: 'from-blue-50 to-cyan-50',
        darkGradient: 'from-blue-950/60 to-cyan-950/60',
        border: 'border-blue-300/50 dark:border-blue-500/30',
        iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        textColor: 'text-blue-600 dark:text-blue-400',
        shadowColor: 'shadow-blue-500/25',
        glowColor: 'rgba(59, 130, 246, 0.15)',
        label: 'ديزل / جاز',
    } : isPetrol ? {
        gradient: 'from-orange-500 to-amber-600',
        lightGradient: 'from-orange-50 to-amber-50',
        darkGradient: 'from-orange-950/60 to-amber-950/60',
        border: 'border-orange-300/50 dark:border-orange-500/30',
        iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',
        textColor: 'text-orange-600 dark:text-orange-400',
        shadowColor: 'shadow-orange-500/25',
        glowColor: 'rgba(249, 115, 22, 0.15)',
        label: 'بنزين',
    } : {
        gradient: 'from-emerald-500 to-teal-600',
        lightGradient: 'from-emerald-50 to-teal-50',
        darkGradient: 'from-emerald-950/60 to-teal-950/60',
        border: 'border-emerald-300/50 dark:border-emerald-500/30',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        shadowColor: 'shadow-emerald-500/25',
        glowColor: 'rgba(16, 185, 129, 0.15)',
        label: 'وقود',
    };

    const currentVolumeL = parseFloat(tank.current_volume || tank.current || 0);
    const capacityL = parseFloat(tank.capacity_liters || tank.total_cap || 0);
    const fillPct = capacityL > 0 ? ((currentVolumeL / capacityL) * 100).toFixed(1) : 0;
    const displayVolume = unit === 'gallons' ? toGallons(currentVolumeL) : currentVolumeL;
    const displayCapacity = unit === 'gallons' ? toGallons(capacityL) : capacityL;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        onClick={onClose}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-3xl rounded-3xl overflow-hidden"
                        >
                            {/* Glass Layer - Light: white / Dark: deep slate */}
                            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl" />

                            {/* Glass Border Glow */}
                            <div className="absolute inset-0 rounded-3xl border border-white/40 dark:border-white/[0.06]" />
                            <div className={`absolute inset-0 rounded-3xl ring-1 ring-inset ${fuelTheme.border}`} />

                            {/* Decorative Glow Blob */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 dark:opacity-[0.07]"
                                 style={{ background: `radial-gradient(circle, ${fuelTheme.glowColor}, transparent 70%)` }}
                            />

                            {/* Content */}
                            <div className="relative z-10">

                                {/* Header */}
                                <div className={`flex items-center justify-between px-8 py-4 border-b border-slate-200/60 dark:border-white/[0.06] bg-gradient-to-r ${fuelTheme.lightGradient} dark:bg-none dark:bg-slate-800/50`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-2xl ${fuelTheme.iconBg} flex items-center justify-center shadow-lg ${fuelTheme.shadowColor}`}>
                                            <Ruler className="w-5 h-5 text-white" strokeWidth={2.2} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-800 dark:text-white">معايرة الخزان</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{tank.name}</p>
                                        </div>
                                    </div>

                                    {/* Fuel Type Badge - Top Left Corner */}
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${fuelTheme.gradient} text-white shadow-lg ${fuelTheme.shadowColor}`}>
                                            <Droplets className="w-4 h-4" />
                                            <span className="text-sm font-bold">{fuelTheme.label}</span>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 rounded-xl bg-white/60 dark:bg-white/[0.06] border border-slate-200/50 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-all"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="px-8 py-5 space-y-4">

                                    {/* Unit Toggle */}
                                    <div className="flex items-center justify-center gap-1 p-1 rounded-2xl bg-white/50 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/[0.08]">
                                        <button
                                            type="button"
                                            onClick={() => handleUnitChange('liters')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                                unit === 'liters'
                                                    ? `bg-gradient-to-r ${fuelTheme.gradient} text-white shadow-lg ${fuelTheme.shadowColor}`
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/[0.06]'
                                            }`}
                                        >
                                            <Droplets className="w-4 h-4" />
                                            لتر
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUnitChange('gallons')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                                unit === 'gallons'
                                                    ? `bg-gradient-to-r ${fuelTheme.gradient} text-white shadow-lg ${fuelTheme.shadowColor}`
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/[0.06]'
                                            }`}
                                        >
                                            <Droplets className="w-4 h-4" />
                                            جالون
                                        </button>
                                    </div>

                                    {/* Current Volume Card - Reduced height 25% */}
                                    <div className="relative overflow-hidden rounded-2xl px-5 py-3 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200/50 dark:border-white/[0.06]">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${fuelTheme.lightGradient} dark:bg-none opacity-50 dark:opacity-0`} />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className={`text-xs font-bold ${fuelTheme.textColor} uppercase tracking-wider`}>الرصيد الحالي في النظام</span>
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${fuelTheme.gradient} text-white shadow-sm`}>
                                                    {fillPct}%
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black text-slate-800 dark:text-white font-mono" dir="ltr">
                                                    {fmt(displayVolume)}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{unitLabel}</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="mt-2 h-2 bg-slate-200/60 dark:bg-white/[0.06] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(fillPct, 100)}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full bg-gradient-to-r ${fuelTheme.gradient} rounded-full shadow-sm`}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                                <span>0</span>
                                                <span>السعة: {fmt(displayCapacity)} {unitLabel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actual Quantity Input */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <Ruler className="w-4 h-4" />
                                            الكمية الفعلية المقاسة ({unitLabel})
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={actualQuantity}
                                            onChange={(e) => setActualQuantity(e.target.value)}
                                            placeholder="أدخل الكمية المقاسة يدوياً"
                                            className="w-full px-5 py-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.04] border-2 border-slate-200/60 dark:border-white/[0.08] focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all text-lg font-mono font-bold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none"
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>

                                    {/* Variance Display */}
                                    <div className={`relative overflow-hidden rounded-2xl p-5 border-2 transition-all duration-500 ${
                                        actualQuantity && variance > 0
                                            ? 'bg-emerald-50/80 dark:bg-emerald-500/[0.07] border-emerald-300/60 dark:border-emerald-500/20'
                                            : actualQuantity && variance < 0
                                                ? 'bg-rose-50/80 dark:bg-rose-500/[0.07] border-rose-300/60 dark:border-rose-500/20'
                                                : 'bg-white/40 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.06]'
                                    }`}>
                                        {/* Decorative Icon */}
                                        <div className="absolute top-3 left-3 opacity-10 dark:opacity-[0.05]">
                                            <ArrowUpDown className="w-12 h-12" />
                                        </div>

                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    actualQuantity && variance > 0
                                                        ? 'bg-emerald-500/20 dark:bg-emerald-500/10'
                                                        : actualQuantity && variance < 0
                                                            ? 'bg-rose-500/20 dark:bg-rose-500/10'
                                                            : 'bg-slate-200/50 dark:bg-white/[0.05]'
                                                }`}>
                                                    <ArrowUpDown className={`w-5 h-5 ${
                                                        actualQuantity && variance > 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : actualQuantity && variance < 0
                                                                ? 'text-rose-600 dark:text-rose-400'
                                                                : 'text-slate-400 dark:text-slate-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">الفرق (العجز/الزيادة)</span>
                                                    <div className={`text-xs mt-0.5 font-semibold ${
                                                        actualQuantity && variance > 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : actualQuantity && variance < 0
                                                                ? 'text-rose-600 dark:text-rose-400'
                                                                : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                        {actualQuantity ? (variance > 0 ? '✓ زيادة عن الرصيد' : variance < 0 ? '✗ عجز في الرصيد' : '= متطابق مع الرصيد') : 'سيظهر بعد إدخال الكمية'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <div className={`text-3xl font-black font-mono ${
                                                    actualQuantity && variance > 0
                                                        ? 'text-emerald-700 dark:text-emerald-400'
                                                        : actualQuantity && variance < 0
                                                            ? 'text-rose-700 dark:text-rose-400'
                                                            : 'text-slate-600 dark:text-slate-500'
                                                }`} dir="ltr">
                                                    {variance > 0 && '+'}{fmtFixed(variance)}
                                                </div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500 text-left font-bold">{unitLabel}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Previous Calibration - Red themed */}
                                    {lastCalibration && (
                                        <div className="relative overflow-hidden rounded-2xl px-5 py-3.5 bg-red-50/60 dark:bg-red-500/[0.06] border border-red-200/60 dark:border-red-500/15">
                                            <div className="absolute top-3 left-3 opacity-[0.06]">
                                                <History className="w-10 h-10" />
                                            </div>
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-red-500/15 dark:bg-red-500/10 flex items-center justify-center">
                                                        <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-red-700 dark:text-red-400">المعايرة السابقة</span>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            {formatDateTime(lastCalibration.created_at) && (
                                                                <>
                                                                    <span className="text-xs font-mono font-bold text-red-600 dark:text-red-300" dir="ltr">
                                                                        {formatDateTime(lastCalibration.created_at).date}
                                                                    </span>
                                                                    <span className="text-red-300 dark:text-red-600">|</span>
                                                                    <span className="text-xs font-mono font-bold text-red-600 dark:text-red-300" dir="ltr">
                                                                        {formatDateTime(lastCalibration.created_at).time}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xl font-black font-mono text-red-700 dark:text-red-400" dir="ltr">
                                                        {fmt(unit === 'gallons' ? toGallons(lastCalibration.actual_quantity) : lastCalibration.actual_quantity)}
                                                    </div>
                                                    <div className="text-[10px] text-red-500 dark:text-red-500 text-left font-bold">
                                                        الفرق: <span dir="ltr">{parseFloat(lastCalibration.variance) > 0 ? '+' : ''}{fmtFixed(unit === 'gallons' ? toGallons(lastCalibration.variance) : lastCalibration.variance)}</span> {unitLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <StickyNote className="w-4 h-4" />
                                            ملاحظات (اختياري)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="أي ملاحظات أو توضيحات إضافية..."
                                            rows="2"
                                            className="w-full px-5 py-3 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none outline-none"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between px-8 py-4 border-t border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                        سيتم تحديث رصيد الخزان تلقائياً
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            disabled={loading}
                                            className="px-6 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-slate-200/60 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading || !actualQuantity}
                                            className={`px-7 py-2.5 rounded-xl bg-gradient-to-r ${fuelTheme.gradient} text-white font-bold text-sm shadow-lg ${fuelTheme.shadowColor} hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2`}
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            حفظ المعايرة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Animation */}
            <SuccessAnimation
                isVisible={showSuccess}
                message="تمت المعايرة بنجاح! 🎊"
                onComplete={() => setShowSuccess(false)}
            />
        </>
    );
};

export default SimpleCalibrationModal;
