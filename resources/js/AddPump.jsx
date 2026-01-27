import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, DonutChart, Title, Text, Metric, Flex, Badge, ProgressBar } from '@tremor/react';
import { Fuel, Users, Gauge, Save, X, Activity, Droplets, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AddPump({ stats, tanks, workers }) {
    const [formData, setFormData] = useState({
        name: '',
        tank_id: '',
        counter_count: 1,
        readings: [''],
        workers: [''],
        counter_names: ['']
    });

    const [selectedTank, setSelectedTank] = useState(null);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'tank_id') {
            const tank = tanks.find(t => t.id == value);
            setSelectedTank(tank);
        }
    };

    // Handle Array Inputs (Readings/Workers)
    const handleArrayChange = (index, field, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    // Update Arrays size when counter count changes
    useEffect(() => {
        const count = parseInt(formData.counter_count);
        setFormData(prev => ({
            ...prev,
            readings: Array(count).fill('').map((_, i) => prev.readings[i] || ''),
            workers: Array(count).fill('').map((_, i) => prev.workers[i] || ''),
            counter_names: Array(count).fill('').map((_, i) => prev.counter_names[i] || '')
        }));
    }, [formData.counter_count]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', formData.name);
        form.append('tank_id', formData.tank_id);
        form.append('counter_count', formData.counter_count);

        formData.readings.forEach(r => form.append('readings[]', r));
        formData.workers.forEach(w => form.append('workers[]', w));
        formData.counter_names.forEach(n => form.append('counter_names[]', n));

        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/store', {
                method: 'POST',
                body: form
            });

            if (response.redirected || response.ok) {
                toast.success('تمت إضافة الماكينة بنجاح!', {
                    description: 'جاري حفظ البيانات وإعادة التوجيه...'
                });
                setTimeout(() => window.location.href = '/PETRODIESEL2/public/pumps', 1500);
            } else {
                toast.error('حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            toast.error('فشل الاتصال بالخادم');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 50, damping: 20 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 max-w-[1600px] mx-auto bg-slate-50"
        >
            <div className="grid grid-cols-12 gap-6 h-full">
                
                {/* Left Panel: Visual Feedback (4 Cols) */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-6 h-fit">
                    
                    {/* Live Status Card - Styled like Accounting Summary Cards */}
                    <Card className="relative overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm bg-white p-6">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0F2FE] rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        
                        <div className="relative z-10">
                            <Flex alignItems="start" className="mb-4">
                                <div>
                                    <Text className="text-slate-500 mb-1">إجمالي الماكينات</Text>
                                    <Metric className="text-3xl font-bold text-slate-900 font-mono">{stats.totalPumps}</Metric>
                                </div>
                                <div className="p-3 bg-[#E0F2FE] text-blue-600 rounded-xl">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </Flex>
                            
                            <div className="space-y-4 pt-2">
                                <div>
                                    <Flex className="mb-2">
                                        <Text className="text-slate-500 text-xs">حالة النظام</Text>
                                        <Text className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded">ممتاز</Text>
                                    </Flex>
                                    <ProgressBar value={85} color="emerald" className="h-1.5" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Preview Context Card */}
                    <Card className="border-0 ring-1 ring-slate-200 shadow-sm bg-white p-6 rounded-2xl">
                        <Title className="text-center mb-2 text-navy-900 font-cairo">المحاكاة الحية</Title>
                        <Text className="text-center text-slate-400 text-xs mb-8">معاينة فورية للبيانات المدخلة</Text>

                        <div className="relative flex justify-center mb-8">
                            {selectedTank ? (
                                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                    <div className="relative w-48 h-48">
                                        <DonutChart
                                            className="h-48 w-48"
                                            data={[
                                                { name: 'مستخدم', value: 40 },
                                                { name: 'متاح', value: 60 },
                                            ]}
                                            category="value"
                                            index="name"
                                            colors={["slate-100", "emerald-500"]}
                                            showLabel={false}
                                            variant="pie"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <Droplets className="w-8 h-8 text-emerald-500 mb-1" />
                                            <span className="text-2xl font-bold text-navy-900">40%</span>
                                        </div>
                                    </div>
                                    <Text className="mt-4 font-bold text-lg text-navy-800">{selectedTank.name}</Text>
                                    <Badge size="xs" color="emerald" className="mt-2">{selectedTank.product_type}</Badge>
                                </div>
                            ) : (
                                <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                    <Fuel className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="text-xs font-medium">اختر خزاناً</span>
                                </div>
                            )}
                        </div>

                        {/* Dynamic Pump Preview */}
                        <motion.div 
                            className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 shadow-sm"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 ${formData.name ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30' : 'bg-white text-slate-300 shadow-slate-200'}`}>
                                    <Fuel className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-navy-900 text-lg leading-tight">{formData.name || 'اسم الماكينة'}</h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${formData.tank_id ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        {formData.tank_id ? 'جاهزة للربط' : 'بانتظار الإعداد'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </Card>

                </motion.div>

                {/* Right Panel: Form (8 Cols) */}
                <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Section 1: Main Config */}
                        <Card className="border-0 ring-1 ring-slate-200 shadow-sm bg-white p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold text-lg ring-4 ring-blue-50/50">1</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-navy-900">بيانات التكوين الأساسية</h2>
                                        <p className="text-slate-400 text-sm">اربط الماكينة بخزان الوقود المناسب</p>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {selectedTank && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 font-bold shadow-sm"
                                        >
                                            <Droplets className="w-5 h-5 fill-emerald-500/20" />
                                            <span>{selectedTank.product_type}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-blue-600 transition-colors">اسم الماكينة</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full h-14 bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-5 pl-12 font-bold text-navy-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                                            placeholder="مثال: الطلمبة الرئيسية"
                                            required
                                        />
                                        <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3 group-focus-within:text-emerald-600 transition-colors">الخزان المصدر</label>
                                    <div className="relative">
                                        <select
                                            name="tank_id"
                                            value={formData.tank_id}
                                            onChange={handleChange}
                                            className="w-full h-14 bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-5 pl-12 font-bold text-navy-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">اختر الخزان...</option>
                                            {tanks.map(tank => (
                                                <option key={tank.id} value={tank.id}>{tank.name} ({tank.product_type})</option>
                                            ))}
                                        </select>
                                        <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                        <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none">
                                            {/* Custom arrow icon override if needed, but standard select arrow is hidden via appearance-none */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Section 2: Nozzles */}
                        <Card className="border-0 ring-1 ring-slate-200 shadow-sm bg-white p-6 rounded-2xl relative overflow-hidden">
                             {/* Accents */}
                             <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>

                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-lg ring-4 ring-indigo-50/50">2</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-navy-900">تكوين المسدسات</h2>
                                        <p className="text-slate-400 text-sm">حدد عدد المسدسات والعدادات لكل ماكينة</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-600 px-2">عدد المسدسات:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, counter_count: num }))}
                                                className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${formData.counter_count == num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'bg-white text-slate-400 hover:bg-indigo-50'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <AnimatePresence mode='popLayout'>
                                    {Array.from({ length: parseInt(formData.counter_count) }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative bg-slate-50/50 hover:bg-white rounded-2xl p-6 border-2 border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/5"
                                        >
                                            <div className="absolute -left-3 top-6 bg-white border border-slate-200 text-slate-400 font-mono text-xs px-2 py-1 rounded-lg shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-500 transition-colors">
                                                Nozzle #{String(i + 1).padStart(2,'0')}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اسم العداد</label>
                                                    <input
                                                        type="text"
                                                        value={formData.counter_names[i] || ''}
                                                        onChange={e => handleArrayChange(i, 'counter_names', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-navy-900 outline-none focus:border-indigo-500 transition-colors"
                                                        placeholder={`مثال: عداد ${i + 1}`}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">قراءة العداد الحالية</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.readings[i] || ''}
                                                            onChange={e => handleArrayChange(i, 'readings', e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-mono font-bold text-navy-900 outline-none focus:border-indigo-500 transition-colors"
                                                            placeholder="000000.00"
                                                            required
                                                        />
                                                        <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">تعيين لعامل</label>
                                                    <div className="relative">
                                                        <select
                                                            value={formData.workers[i] || ''}
                                                            onChange={e => handleArrayChange(i, 'workers', e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-bold text-navy-900 outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                                                            required
                                                        >
                                                            <option value="">-- اختر عامل --</option>
                                                            {workers.map(w => (
                                                                <option key={w.id} value={w.id}>{w.name}</option>
                                                            ))}
                                                        </select>
                                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </Card>

                        {/* Action Bar */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                             <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => window.location.href = '/PETRODIESEL2/public/pumps'}
                                className="px-8 py-4 rounded-2xl bg-white text-slate-500 font-bold border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            >
                                إلغاء
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(16 185 129 / 0.15), 0 8px 10px -6px rgb(16 185 129 / 0.15)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="flex-1 lg:flex-none px-12 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-3"
                            >
                                <Save className="w-6 h-6" />
                                <span>حفظ بيانات الماكينة</span>
                            </motion.button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}
