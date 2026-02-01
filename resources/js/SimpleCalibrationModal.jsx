import React, { useState, useEffect } from 'react';
import { Dialog } from '@tremor/react';
import { toast } from 'sonner';
import SuccessAnimation from './SuccessAnimation';

/**
 * Simplified Calibration Modal
 * Allows manual entry of actual tank quantity with automatic variance calculation
 */
const SimpleCalibrationModal = ({ tank, isOpen, onClose, onSuccess }) => {
    const [actualQuantity, setActualQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [variance, setVariance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Calculate variance automatically
    useEffect(() => {
        if (actualQuantity && tank) {
            const currentVolume = parseFloat(tank.current_volume || tank.current || 0);
            const actualQty = parseFloat(actualQuantity) || 0;
            const diff = actualQty - currentVolume;
            setVariance(isNaN(diff) ? 0 : diff);
        } else {
            setVariance(0);
        }
    }, [actualQuantity, tank]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setActualQuantity('');
            setNotes('');
            setVariance(0);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!actualQuantity || parseFloat(actualQuantity) < 0) {
            toast.error('يرجى إدخال الكمية الفعلية');
            return;
        }

        if (parseFloat(actualQuantity) > parseFloat(tank.capacity_liters)) {
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
                    actual_quantity: parseFloat(actualQuantity),
                    notes: notes
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowSuccess(true);
                // Close modal and refresh after animation
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

    return (
        <>
            <Dialog open={isOpen} onClose={onClose} static={true}>
            <div className="p-6 bg-white rounded-lg max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">معايرة الخزان</h2>
                    <p className="text-slate-500 mt-1">{tank.name}</p>
                </div>

                {/* Current Volume Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700 font-medium">الرصيد الحالي في النظام</span>
                        <span className="text-2xl font-bold text-blue-900">
                            {parseFloat(tank.current_volume || tank.current || 0).toLocaleString('ar-SA')} لتر
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                        السعة: {parseFloat(tank.capacity_liters || tank.total_cap || 0).toLocaleString('ar-SA')} لتر
                    </div>
                </div>

                {/* Actual Quantity Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        الكمية الفعلية المقاسة (لتر) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={actualQuantity}
                        onChange={(e) => setActualQuantity(e.target.value)}
                        placeholder="أدخل الكمية المقاسة يدوياً"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        disabled={loading}
                        autoFocus
                    />
                </div>

                {/* Variance Display - Always visible */}
                <div className={`mb-6 p-4 rounded-lg border-2 transition-all ${
                    actualQuantity && variance > 0 
                        ? 'bg-green-50 border-green-300' 
                        : actualQuantity && variance < 0 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-gray-50 border-gray-300'
                }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">الفرق (العجز/الزيادة)</span>
                        <div className="text-right">
                            <div className={`text-3xl font-bold ${
                                actualQuantity && variance > 0 
                                    ? 'text-green-700' 
                                    : actualQuantity && variance < 0 
                                        ? 'text-red-700' 
                                        : 'text-gray-700'
                            }`}>
                                {variance > 0 && '+'}{variance.toFixed(2)} لتر
                            </div>
                            <div className={`text-sm mt-1 ${
                                actualQuantity && variance > 0 
                                    ? 'text-green-600' 
                                    : actualQuantity && variance < 0 
                                        ? 'text-red-600' 
                                        : 'text-gray-600'
                            }`}>
                                {actualQuantity ? (variance > 0 ? '✓ زيادة' : variance < 0 ? '✗ عجز' : '= متطابق') : 'سيظهر بعد إدخال الكمية'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        ملاحظات (اختياري)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أي ملاحظات أو توضيحات إضافية..."
                        rows="3"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={loading}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !actualQuantity}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                        )}
                        حفظ المعايرة
                    </button>
                </div>
            </div>
            </Dialog>
            
            {/* Success Animation - Outside Dialog for proper z-index */}
            <SuccessAnimation 
                isVisible={showSuccess} 
                message="تمت المعايرة بنجاح! 🎊"
                onComplete={() => setShowSuccess(false)}
            />
        </>
    );
};

export default SimpleCalibrationModal;
