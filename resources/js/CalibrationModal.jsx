import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calculator, Ruler, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CalibrationModal({ isOpen, onClose, tank }) {
    const [points, setPoints] = useState([]);
    const [newPoint, setNewPoint] = useState({ height_mm: '', volume_liters: '' });
    const [testHeight, setTestHeight] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && tank) {
            loadPoints();
            setTestHeight('');
            setTestResult(null);
        }
    }, [isOpen, tank]);

    const loadPoints = async () => {
        try {
            const res = await fetch(`${window.BASE_URL}/tanks/getCalibrationPoints?tank_id=${tank.id}`);
            const data = await res.json();
            if (data.success) {
                setPoints(data.points || []);
            }
        } catch (e) {
            toast.error('خطأ في تحميل نقاط المعايرة');
        }
    };

    const handleAddPoint = async () => {
        if (!newPoint.height_mm || !newPoint.volume_liters) {
            toast.error('يرجى إدخال جميع الحقول');
            return;
        }

        try {
            const res = await fetch(`${window.BASE_URL}/tanks/addCalibrationPoint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tank_id: tank.id,
                    height_mm: parseFloat(newPoint.height_mm),
                    volume_liters: parseFloat(newPoint.volume_liters)
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تمت الإضافة بنجاح');
                setNewPoint({ height_mm: '', volume_liters: '' });
                loadPoints();
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (e) {
            toast.error('خطأ في الإضافة');
        }
    };

    const handleDeletePoint = async (pointId) => {
        if (!confirm('هل أنت متأكد من حذف هذه النقطة؟')) return;
        
        try {
            const res = await fetch(`${window.BASE_URL}/tanks/deleteCalibrationPoint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ point_id: pointId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم الحذف');
                loadPoints();
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (e) {
            toast.error('خطأ في الحذف');
        }
    };

    const handleTestCalculate = async () => {
        if (!testHeight) {
            toast.error('يرجى إدخال الارتفاع');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${window.BASE_URL}/tanks/calculateVolume?tank_id=${tank.id}&height_mm=${testHeight}`);
            const data = await res.json();
            if (data.success) {
                setTestResult(data.result);
            } else {
                toast.error(data.message || 'حدث خطأ في الحساب');
            }
        } catch (e) {
            toast.error('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !tank) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-cairo flex items-center gap-2">
                            <Ruler size={28} />
                            معايرة الخزان
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">{tank.name}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add Point Section */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                        <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                            <Plus size={20} /> إضافة نقطة معايرة جديدة
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">الارتفاع (ملم)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newPoint.height_mm}
                                    onChange={(e) => setNewPoint({...newPoint, height_mm: e.target.value})}
                                    className="w-full px-4 py-2.5 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                                    placeholder="مثال: 1000"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">الحجم (لتر)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={newPoint.volume_liters}
                                    onChange={(e) => setNewPoint({...newPoint, volume_liters: e.target.value})}
                                    className="w-full px-4 py-2.5 border-2 border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                                    placeholder="مثال: 5000"
                                />
                            </div>
                            <div className="flex items-end">
                                <button 
                                    onClick={handleAddPoint}
                                    className="w-full px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                                >
                                    إضافة النقطة
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Calibration Points Table */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-lg">
                            <TrendingUp size={20} className="text-blue-600" />
                            نقاط المعايرة المسجلة ({points.length})
                        </h3>
                        <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="p-4 text-right text-sm font-bold text-slate-700">الارتفاع (ملم)</th>
                                        <th className="p-4 text-right text-sm font-bold text-slate-700">الحجم (لتر)</th>
                                        <th className="p-4 text-center text-sm font-bold text-slate-700">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {points.map((point) => (
                                        <tr key={point.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="p-4 font-mono font-bold text-slate-900">{parseFloat(point.height_mm).toLocaleString()}</td>
                                            <td className="p-4 font-mono font-bold text-slate-900">{parseFloat(point.volume_liters).toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleDeletePoint(point.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {points.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="p-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <AlertCircle size={32} className="text-slate-300" />
                                                    <p>لا توجد نقاط معايرة مسجلة بعد</p>
                                                    <p className="text-xs">أضف نقاط المعايرة أعلاه للبدء</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Test Calculator */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                            <Calculator size={20} /> اختبار الحساب (Linear Interpolation)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">أدخل الارتفاع (ملم)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={testHeight}
                                    onChange={(e) => setTestHeight(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                                    placeholder="مثال: 1250"
                                    onKeyPress={(e) => e.key === 'Enter' && handleTestCalculate()}
                                />
                            </div>
                            <div className="flex items-end">
                                <button 
                                    onClick={handleTestCalculate}
                                    disabled={loading || !testHeight || points.length === 0}
                                    className="w-full px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                                >
                                    {loading ? 'جاري الحساب...' : 'احسب الحجم'}
                                </button>
                            </div>
                        </div>
                        
                        {testResult && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-white border-2 border-blue-200 rounded-xl shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-slate-600">النتيجة:</span>
                                    <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                                        {testResult.method === 'linear_interpolation' ? 'استيفاء خطي' : 
                                         testResult.method === 'exact' ? 'تطابق تام' :
                                         testResult.method === 'below_range' ? 'أقل من النطاق' :
                                         testResult.method === 'above_range' ? 'أعلى من النطاق' : testResult.method}
                                    </span>
                                </div>
                                <div className="text-4xl font-black text-blue-900 font-mono mb-2">
                                    {testResult.volume.toLocaleString()} لتر
                                </div>
                                {testResult.message && (
                                    <div className="text-sm text-slate-600 mb-2">
                                        {testResult.message}
                                    </div>
                                )}
                                {testResult.warning && (
                                    <div className="text-sm text-amber-600 flex items-center gap-1 bg-amber-50 p-2 rounded-lg">
                                        <AlertCircle size={16} />
                                        {testResult.warning}
                                    </div>
                                )}
                                {testResult.calculation_details && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs font-mono space-y-1">
                                        <div className="text-slate-600">المعادلة: {testResult.calculation_details.formula}</div>
                                        <div className="text-slate-800">{testResult.calculation_details.substituted}</div>
                                        <div className="text-blue-700 font-bold">النتيجة = {testResult.calculation_details.result} لتر</div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                        
                        {points.length === 0 && (
                            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} />
                                يرجى إضافة نقاط معايرة أولاً لاستخدام حاسبة الاختبار
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 border-t flex justify-end gap-2">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition"
                    >
                        إغلاق
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
