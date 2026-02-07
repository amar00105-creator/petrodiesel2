import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Fuel, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTankModal({ isOpen, onClose, onSuccess, fuelTypes = [], fuelSettings = [], tank = null }) {
    // fuelTypes is now passed directly from the array of objects (id, name, code, price_per_liter)
    // If 'tank' is provided, we are in Edit Mode
    
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        fuel_type_id: '', // Store ID directly
        capacity_liters: '',
        current_volume: '0',
        current_price: ''
    });

    // Populate form when modal opens or tank changes
    React.useEffect(() => {
        if (isOpen) {
            if (tank) {
                // Edit Mode
                setFormData({
                    id: tank.id,
                    name: tank.name,
                    fuel_type_id: tank.fuel_type_id || '', 
                    capacity_liters: tank.total_cap || tank.capacity_liters,
                    current_volume: tank.current || tank.current_volume,
                    current_price: tank.current_price || ''
                });
            } else {
                // Add Mode
                const first = fuelTypes.length > 0 ? fuelTypes[0] : null;
                setFormData({
                    name: '',
                    fuel_type_id: first ? first.id : '',
                    capacity_liters: '',
                    current_volume: '0',
                    current_price: first ? (first.price_per_liter || '0') : ''
                });
            }
        }
    }, [isOpen, tank, fuelTypes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let updatedData = { ...formData, [name]: value };

        // Auto-update price if product type changes
        if (name === 'fuel_type_id') {
            const selectedFuel = fuelTypes.find(f => String(f.id) === String(value));
            if (selectedFuel) {
                updatedData.current_price = selectedFuel.price_per_liter || '0';
            }
        }

        setFormData(updatedData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Frontend validation for volume bounds
        const currentVol = parseFloat(formData.current_volume) || 0;
        const capacity = parseFloat(formData.capacity_liters) || 0;
        
        if (currentVol < 0) {
            toast.error('الكمية الحالية لا يمكن أن تكون أقل من صفر');
            return;
        }
        
        if (currentVol > capacity) {
            toast.error('الكمية الحالية لا يمكن أن تتجاوز سعة الخزان');
            return;
        }
        
        setIsLoading(true);

        // Use dynamic base URL defined in main.jsx
        const baseUrl = window.BASE_URL || '/PETRODIESEL2/public';
        const url = tank 
            ? `${baseUrl}/tanks/update` 
            : `${baseUrl}/tanks/store`;
            
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                onSuccess(); // Close modal and refresh parent
            } else {
                toast.error(result.message || 'حدث خطأ ما');
            }
        } catch (error) {
            console.error('Error saving tank:', error);
            toast.error('فشل الاتصال بالخادم');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 dark:bg-white/5 dark:border-white/10">
                            <div>
                                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2 dark:text-white">
                                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    {tank ? 'تعديل بيانات الخزان' : 'إضافة خزان جديد'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                                    {tank ? 'تعديل البيانات الأساسية وسعة الخزان' : 'أدخل بيانات الخزان الجديد والسعة'}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors dark:text-slate-400 dark:hover:bg-white/10">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">اسم الخزان</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    required
                                    placeholder="مثال: خزان الديزل الرئيسي"
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500/20"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Product Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">نوع الوقود</label>
                                <div className="relative">
                                    <Fuel className="absolute right-3 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                                    <select 
                                        name="fuel_type_id"
                                        className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500/20"
                                        value={formData.fuel_type_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>اختر نوع الوقود</option>
                                        {fuelTypes.length > 0 ? (
                                            fuelTypes.map((type) => (
                                                <option key={type.id} value={type.id}>{type.name}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled className="dark:bg-slate-700">لا توجد أنواع وقود معرفة في الإعدادات</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Capacity */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">السعة الكلية (لتر)</label>
                                    <input 
                                        type="number" 
                                        name="capacity_liters"
                                        required
                                        min="0"
                                        placeholder="0"
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500/20"
                                        value={formData.capacity_liters}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Current Volume */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">الكمية الحالية (لتر)</label>
                                    <input 
                                        type="number" 
                                        name="current_volume"
                                        required
                                        min="0"
                                        placeholder="0"
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:ring-blue-500/20"
                                        value={formData.current_volume}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Current Price */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">السعر الحالي للتر (من الإعدادات)</label>
                                <input 
                                    type="number" 
                                    name="current_price"
                                    step="0.01"
                                    readOnly
                                    placeholder="0.00"
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-mono dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
                                    value={formData.current_price}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Footer */}
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={onClose}
                                    className="flex-1 p-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-white/5"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex-[2] p-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? 'جاري الحفظ...' : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {tank ? 'حفظ التعديلات' : 'حفظ الخزان'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
