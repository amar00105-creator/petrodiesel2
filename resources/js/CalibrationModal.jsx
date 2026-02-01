import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Ruler, Table, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CalibrationModal({ isOpen, onClose, tank }) {
    const [activeTab, setActiveTab] = useState('calibrate'); // 'calibrate' or 'manage'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [stickReading, setStickReading] = useState('');
    const [sensorReading, setSensorReading] = useState('');
    const [lastEditedField, setLastEditedField] = useState(null); // 'stick' or 'sensor'
    const [updateTankVolume, setUpdateTankVolume] = useState(false); // NEW: checkbox state
    
    // Calibration table management
    const [calibrationPoints, setCalibrationPoints] = useState([]);
    const [loadingPoints, setLoadingPoints] = useState(false);
    const [newPoint, setNewPoint] = useState({ height_cm: '', volume_liters: '' });

    // Fetch calibration points when opening manage tab
    const fetchCalibrationPoints = async () => {
        if (!tank) return;
        setLoadingPoints(true);
        try {
            const response = await fetch(`${window.BASE_URL}/tanks/getCalibrationPoints?tank_id=${tank.id}`);
            const data = await response.json();
            if (data.success) {
                setCalibrationPoints(data.points || []);
            }
        } catch (error) {
            console.error('Error fetching calibration points:', error);
        } finally {
            setLoadingPoints(false);
        }
    };

    // Reset when opening
    useEffect(() => {
        if (isOpen && tank) {
            setActiveTab('calibrate');
            setResult(null);
            setStickReading('');
            setSensorReading('');
            setNewPoint({ height_cm: '', volume_liters: '' });
            setUpdateTankVolume(false); // Reset checkbox
        }
    }, [isOpen, tank]);

    // Fetch points when switching to manage tab
    useEffect(() => {
        if (activeTab === 'manage' && tank) {
            fetchCalibrationPoints();
        }
    }, [activeTab, tank]);


    // Auto-calculate sensor reading based on stick reading
    useEffect(() => {
        const calculateAutoVolume = async () => {
            // Only calculate if we have a valid stick reading and user edited stick field
            if (!stickReading || parseFloat(stickReading) <= 0 || activeTab !== 'calibrate' || !tank || lastEditedField !== 'stick') {
                return;
            }

            try {
                const heightMm = parseFloat(stickReading) * 10; // Convert cm to mm
                const response = await fetch(`${window.BASE_URL}/tanks/calculateVolume?tank_id=${tank.id}&height_mm=${heightMm}`);
                const data = await response.json();
                
                if (data.success && data.result && data.result.volume) {
                    // Auto-fill the sensor reading field
                    setSensorReading(parseFloat(data.result.volume).toFixed(2));
                }
            } catch (error) {
                // Silent fail - don't show error for auto-calculation
                console.log('Auto-calculation not available:', error);
            }
        };

        // Debounce the calculation to avoid too many API calls
        const timeoutId = setTimeout(() => {
            calculateAutoVolume();
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [stickReading, activeTab, tank, lastEditedField]);

    // Auto-calculate stick reading based on sensor reading (REVERSE)
    useEffect(() => {
        const calculateAutoHeight = async () => {
            // Only calculate if we have a valid sensor reading and user edited sensor field
            if (!sensorReading || parseFloat(sensorReading) <= 0 || activeTab !== 'calibrate' || !tank || lastEditedField !== 'sensor') {
                return;
            }

            try {
                const volumeLiters = parseFloat(sensorReading);
                const response = await fetch(`${window.BASE_URL}/tanks/calculateHeight?tank_id=${tank.id}&volume_liters=${volumeLiters}`);
                const data = await response.json();
                
                if (data.success && data.result && data.result.height_mm) {
                    // Auto-fill the stick reading field (convert mm to cm)
                    setStickReading((data.result.height_mm / 10).toFixed(1));
                }
            } catch (error) {
                // Silent fail - don't show error for auto-calculation
                console.log('Auto-calculation (reverse) not available:', error);
            }
        };

        // Debounce the calculation to avoid too many API calls
        const timeoutId = setTimeout(() => {
            calculateAutoHeight();
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [sensorReading, activeTab, tank, lastEditedField]);

    // Auto-calculate stick reading from sensor reading (reverse calculation)
    useEffect(() => {
        if (!tank || !sensorReading || parseFloat(sensorReading) <= 0 || lastEditedField !== 'sensor') return;
        
        const calculateStickReading = async () => {
            try {
                const response = await fetch(`${window.BASE_URL}/tanks/calculateHeightFromVolume`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tank_id: tank.id,
                        volume_liters: parseFloat(sensorReading)
                    })
                });
                
                const data = await response.json();
                
                // Only update if successful AND height is valid (> 0)
                if (data.success && data.height_cm && data.height_cm > 0) {
                    setStickReading(data.height_cm.toString());
                }
                // If calculation fails, just don't update stick reading (silent fail)
            } catch (error) {
                // Silent fail - this is just a helper feature
                console.log('Auto-calculation skipped:', error.message);
            }
        };
        
        const timeoutId = setTimeout(calculateStickReading, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [sensorReading, tank, lastEditedField]);

    // Clear stick reading when sensor reading is cleared
    useEffect(() => {
        if (lastEditedField === 'sensor' && (!sensorReading || sensorReading === '' || sensorReading === '0')) {
            setStickReading('');
        }
    }, [sensorReading, lastEditedField]);

    const handleCalculate = async () => {
        // Validation: Must have at least stick reading OR sensor reading
        if (!stickReading && !sensorReading) {
            toast.error('يرجى إدخال قراءة العصا اليدوية أو قراءة النظام الآلي على الأقل');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                tank_id: tank.id,
                stick_reading_cm: stickReading ? parseFloat(stickReading) : 0,
                sensor_reading_liters: sensorReading ? parseFloat(sensorReading) : 0,
                update_tank_volume: updateTankVolume && sensorReading // Only update if checkbox is checked AND sensor reading exists
            };

            const response = await fetch(`${window.BASE_URL}/tanks/processSmartCalibration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            if (data.success) {
                setResult(data.result);
                toast.success('تم المعايرة بنجاح!');
                if (onSuccess) onSuccess(); // Refresh tank list
            } else {
                toast.error(data.message || 'فشل في الحساب');
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل في الاتصال - تحقق من الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPoint = async () => {
        if (!newPoint.height_cm || !newPoint.volume_liters) {
            toast.error('يرجى إدخال القراءة والحجم');
            return;
        }

        try {
            const response = await fetch(`${window.BASE_URL}/tanks/addCalibrationPoint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tank_id: tank.id,
                    height_mm: parseFloat(newPoint.height_cm) * 10, // Convert cm to mm
                    volume_liters: parseFloat(newPoint.volume_liters)
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('تمت إضافة النقطة بنجاح');
                setNewPoint({ height_cm: '', volume_liters: '' });
                fetchCalibrationPoints(); // Refresh list
            } else {
                toast.error(data.message || 'فشل في إضافة النقطة');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ في النظام');
        }
    };

    const handleDeletePoint = async (pointId) => {
        if (!confirm('هل أنت متأكد من حذف هذه النقطة؟')) return;

        try {
            const response = await fetch(`${window.BASE_URL}/tanks/deleteCalibrationPoint`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: pointId })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('تم حذف النقطة بنجاح');
                fetchCalibrationPoints(); // Refresh list
            } else {
                toast.error(data.message || 'فشل في حذف النقطة');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ في النظام');
        }
    };

    if (!isOpen || !tank) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/20"
            >
                {/* Header with Tabs */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white relative">
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition z-10"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-center pt-6 px-6 pb-4">
                        <h2 className="text-2xl font-black font-cairo mb-1">معايرة الخزان</h2>
                        <p className="text-blue-100 text-sm">{tank.name}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-t border-white/20">
                       <button
                            onClick={() => setActiveTab('calibrate')}
                            className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'calibrate' 
                                    ? 'bg-white text-blue-600' 
                                    : 'text-white/80 hover:bg-white/10'
                            }`}
                        >
                            <Ruler size={18} />
                            <span>معايرة ذكية</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`flex-1 px-6 py-4 font-bold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'manage' 
                                    ? 'bg-white text-blue-600' 
                                    : 'text-white/80 hover:bg-white/10'
                            }`}
                        >
                            <Table size={18} />
                            <span>جدول القياسات</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <AnimatePresence mode='wait'>
                        {/* Calibration Tab */}
                        {activeTab === 'calibrate' && !result && (
                            <motion.div 
                                key="calibrate-input" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 border border-blue-100">
                                    <strong>ملاحظة:</strong> سيتم حساب الكمية بناءً على جدول المعايرة المخزن مسبقاً لهذا الخزان.
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        قراءة العصا اليدوية (سم)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            value={stickReading}
                                            onChange={(e) => {
                                                setStickReading(e.target.value);
                                                setLastEditedField('stick');
                                            }}
                                            className="w-full h-14 px-4 pr-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-lg font-bold outline-none" 
                                            placeholder="0.0"
                                            autoFocus
                                        />
                                        <Ruler className="absolute left-4 top-4 text-slate-400 w-6 h-6" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">قراءة العصا اليدوية - اختياري إذا تم إدخال قراءة النظام</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        قراءة النظام الآلي (لتر) - اختياري للمقارنة
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01" 
                                        value={sensorReading}
                                        onChange={(e) => {
                                            setSensorReading(e.target.value);
                                            setLastEditedField('sensor');
                                        }}
                                        className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-lg font-bold outline-none" 
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">يمكن إدخالها بدون قراءة العصا لتحديث الخزان مباشرة</p>
                                </div>

                                {/* Tank Update Checkbox - Only show when sensor reading is entered */}
                                {sensorReading && parseFloat(sensorReading) > 0 && (
                                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox"
                                                checked={updateTankVolume}
                                                onChange={(e) => setUpdateTankVolume(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="font-bold text-amber-900 group-hover:text-amber-700 transition-colors">
                                                    تحديث رصيد الخزان بناءً على القراءة الآلية
                                                </div>
                                                <p className="text-xs text-amber-700 mt-1">
                                                    ⚠️ سيتم تحديث رصيد الخزان الحالي مباشرة إلى <strong>{parseFloat(sensorReading).toLocaleString()} لتر</strong>
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                )}

                                <button 
                                    onClick={handleCalculate}
                                    disabled={loading}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            جاري الحساب...
                                        </>
                                    ) : (
                                        'حساب الكمية'
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Calibration Result */}
                        {activeTab === 'calibrate' && result && (
                            <motion.div 
                                key="calibrate-result" 
                                initial={{ opacity: 0, scale: 0.9 }} 
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${
                                    result.status === 'pass' ? 'bg-emerald-100 text-emerald-600' : 
                                    result.status === 'warning' ? 'bg-amber-100 text-amber-600' : 
                                    'bg-red-100 text-red-600'
                                }`}>
                                    {result.status === 'pass' && <Check size={40} />}
                                    {result.status === 'warning' && <AlertTriangle size={40} />}
                                    {result.status === 'fail' && <X size={40} />}
                                </div>

                                <h3 className="text-2xl font-black text-navy-900 mb-2">
                                    {result.status === 'pass' ? 'معايرة ناجحة ✓' : 
                                     result.status === 'warning' ? 'يوجد فروقات بسيطة' : 
                                     'فشل المعايرة'}
                                </h3>
                                <p className="text-slate-500 mb-6">
                                    {result.status === 'pass' ? 'النتائج ضمن الحدود المسموح بها' : 
                                     'الفرق بين القراءة اليدوية وقراءة النظام يتجاوز الحدود الطبيعية'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">الحجم المحسوب</div>
                                        <div className="text-2xl font-black text-navy-900 font-mono">{result.actual_volume.toLocaleString()}</div>
                                        <div className="text-xs text-slate-400 mt-1">لتر</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">قراءة النظام</div>
                                        <div className="text-2xl font-black text-navy-900 font-mono">{result.sensor_volume.toLocaleString()}</div>
                                        <div className="text-xs text-slate-400 mt-1">لتر</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border-2 ${
                                        result.variance > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
                                    }`}>
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">الفرق</div>
                                        <div className={`text-2xl font-black font-mono ${
                                            result.variance > 0 ? 'text-red-600' : 'text-emerald-600'
                                        }`}>{Math.abs(result.variance).toLocaleString()}</div>
                                        <div className="text-xs text-slate-400 mt-1">لتر</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">نسبة الخطأ</div>
                                        <div className="text-2xl font-black text-navy-900 font-mono">{result.error_percent}</div>
                                        <div className="text-xs text-slate-400 mt-1">%</div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            setResult(null);
                                            setStickReading('');
                                            setSensorReading('');
                                        }}
                                        className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                                    >
                                        معايرة جديدة
                                    </button>
                                    <button 
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Manage Calibration Table Tab */}
                        {activeTab === 'manage' && (
                            <motion.div 
                                key="manage" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-amber-50 p-4 rounded-xl text-sm text-amber-700 border border-amber-200">
                                    <strong>مهم:</strong> هذا الجدول يحدد كيفية حساب الحجم من قراءة العصا. تأكد من إضافة نقاط كافية (5-10 نقاط موزعة بالتساوي).
                                </div>

                                {/* Add New Point */}
                                <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Plus size={20} className="text-blue-600" />
                                        إضافة نقطة جديدة
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-2">قراءة العصا (سم)</label>
                                            <input 
                                                type="number"
                                                step="0.1"
                                                value={newPoint.height_cm}
                                                onChange={(e) => setNewPoint({...newPoint, height_cm: e.target.value})}
                                                className="w-full h-12 px-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 font-mono font-bold outline-none" 
                                                placeholder="0.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-2">الحجم (لتر)</label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={newPoint.volume_liters}
                                                onChange={(e) => setNewPoint({...newPoint, volume_liters: e.target.value})}
                                                className="w-full h-12 px-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 font-mono font-bold outline-none" 
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAddPoint}
                                        className="mt-4 w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} />
                                        إضافة
                                    </button>
                                </div>

                                {/* Calibration Points Table */}
                                <div>
                                    <h3 className="font-bold text-lg mb-3">النقاط المحفوظة ({calibrationPoints.length})</h3>
                                    {loadingPoints ? (
                                        <div className="text-center py-8 text-slate-400">جاري التحميل...</div>
                                    ) : calibrationPoints.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                            <Table size={48} className="mx-auto text-slate-300 mb-3" />
                                            <p className="text-slate-500 font-bold">لا توجد نقاط معايرة</p>
                                            <p className="text-slate-400 text-sm mt-1">أضف نقاط جديدة لبدء المعايرة</p>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                                            <table className="w-full">
                                                <thead className="bg-slate-100 border-b-2 border-slate-200">
                                                    <tr>
                                                        <th className="text-right p-3 font-bold text-sm text-slate-600">قراءة العصا (سم)</th>
                                                        <th className="text-right p-3 font-bold text-sm text-slate-600">الحجم (لتر)</th>
                                                        <th className="text-center p-3 font-bold text-sm text-slate-600 w-20">حذف</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {calibrationPoints.map((point, index) => (
                                                        <tr key={point.id} className={`border-b border-slate-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                            <td className="p-3 font-mono font-bold text-navy-900">{(point.height_mm / 10).toFixed(1)}</td>
                                                            <td className="p-3 font-mono font-bold text-navy-900">{parseFloat(point.volume_liters).toFixed(2)}</td>
                                                            <td className="p-3 text-center">
                                                                <button 
                                                                    onClick={() => handleDeletePoint(point.id)}
                                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
