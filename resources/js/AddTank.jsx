import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric } from '@tremor/react';
import { Cylinder, Fuel, Save, Droplets, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AddTank() {
    const [formData, setFormData] = useState({
        name: '',
        product_type: 'Diesel',
        capacity_liters: '',
        current_volume: '',
        current_price: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // calculate percentage for visual
    const cap = parseFloat(formData.capacity_liters) || 1;
    const curr = parseFloat(formData.current_volume) || 0;
    const percentage = Math.min((curr / cap) * 100, 100);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (curr > cap) {
            toast.error('الرصيد الحالي لا يمكن أن يتجاوز السعة الكلية');
            return;
        }

        const form = new FormData();
        Object.keys(formData).forEach(key => form.append(key, formData[key]));
        
        try {
            const response = await fetch('/PETRODIESEL2/public/tanks/store', {
                method: 'POST',
                body: form
            });

            if (response.redirected || response.ok) {
                toast.success('تمت إضافة الخزان بنجاح');
                setTimeout(() => window.location.href = '/PETRODIESEL2/public/tanks', 1000);
            } else {
                toast.error('حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            toast.error('فشل الاتصال بالخادم');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col lg:flex-row gap-6 p-6 h-full max-w-6xl mx-auto"
        >
             {/* Left: Visualizer */}
             <div className="lg:w-1/3 flex flex-col gap-6">
                 <Card className="bg-navy-900 border-none shadow-2xl relative overflow-hidden h-full flex flex-col items-center justify-center py-12">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 w-full h-full z-10 pointer-events-none"></div>
                     
                     {/* 3D Cylinder Effect */}
                     <div className="relative w-40 h-80 bg-slate-800 rounded-full border-4 border-slate-700 overflow-hidden shadow-inner z-0">
                          {/* Liquid */}
                          <motion.div 
                            initial={{ height: '0%' }}
                            animate={{ height: `${percentage}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className={`absolute bottom-0 w-full transition-colors duration-500 opacity-90 ${
                                formData.product_type === 'Diesel' ? 'bg-amber-600' :
                                formData.product_type === 'Petrol' ? 'bg-emerald-500' : 'bg-blue-400'
                            }`}
                          >
                            <div className="absolute top-0 w-full h-4 bg-white/20 blur-sm"></div>
                            {/* Bubbles */}
                            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                          </motion.div>
                     
                          {/* Glass Highlight */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-full pointer-events-none"></div>
                     </div>

                     <div className="mt-8 text-center text-white z-10 relative">
                         <Text className="text-slate-400">النسبة المئوية</Text>
                         <Metric className="font-mono">{percentage.toFixed(1)}%</Metric>
                         <Text className="text-xs text-slate-500 mt-2">{formData.product_type}</Text>
                     </div>
                 </Card>
             </div>

             {/* Right: Form */}
             <div className="lg:w-2/3">
                <form onSubmit={handleSubmit} className="h-full flex flex-col gap-6">
                    <Card className="bg-white ring-1 ring-slate-100 shadow-lg flex-1">
                        <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-50">
                            <div>
                                <Title className="text-navy-900 font-bold text-2xl">إعداد خزان وقود</Title>
                                <Text className="text-slate-500">أدخل تفاصيل البئر والسعة التخزينية</Text>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <Cylinder className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">اسم الخزان</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        required 
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="مثال: خزان الديزل الرئيسي"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">نوع الوقود</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Diesel', 'Petrol', 'Gas'].map(type => (
                                            <div 
                                                key={type}
                                                onClick={() => setFormData({...formData, product_type: type})}
                                                className={`cursor-pointer rounded-xl p-3 text-center border-2 transition-all ${
                                                    formData.product_type === type 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                                                    : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                {type === 'Diesel' ? 'ديزل' : type === 'Petrol' ? 'بنزين' : 'غاز'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-700">السعة الكلية</label>
                                            <span className="text-xs text-slate-400">لتر</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            name="capacity_liters" 
                                            required 
                                            value={formData.capacity_liters}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold"
                                            placeholder="50000"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-700">الرصيد الافتتاحي</label>
                                            <span className="text-xs text-slate-400">لتر</span>
                                        </div>
                                        <input 
                                            type="number" 
                                            name="current_volume" 
                                            required 
                                            value={formData.current_volume}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg outline-none font-bold text-emerald-600"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">سعر البيع الافتراضي</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        name="current_price" 
                                        required 
                                        value={formData.current_price}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end gap-4">
                            <button 
                                type="button"
                                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                type="submit"
                                className="px-10 py-3 bg-navy-900 text-white font-bold rounded-xl shadow-xl hover:bg-navy-800 transition-all flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" /> حفظ الخزان
                            </button>
                        </div>
                    </Card>
                </form>
             </div>
        </motion.div>
    );
}
