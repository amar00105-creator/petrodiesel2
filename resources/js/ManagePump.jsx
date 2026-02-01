import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, Badge, Flex, Grid, Metric, Button, TextInput, Select, SelectItem } from '@tremor/react';
import { Fuel, Gauge, User, Settings, Trash2, ArrowRight, Save, Edit3, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagePump({ pump, counters, workers, tanks, user }) {
    const [editingCounter, setEditingCounter] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [isEditingPump, setIsEditingPump] = useState(false);
    const [isAddingCounter, setIsAddingCounter] = useState(false);

    // Helper to extract number from name
    const getCounterNumber = (name, index) => {
        const matches = name.match(/\d+/);
        return matches ? matches[0] : index + 1;
    };

    const handleUpdateCounter = async (e, counterId) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/updateCounter', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json().catch(() => ({}));

            if (data.success || response.redirected) {
                toast.success('تم حفظ التغييرات بنجاح');
                window.location.reload();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل الاتصال بالخادم');
        }
    };

    const handleDelete = (id) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/PETRODIESEL2/public/pumps/deleteCounter';
        
        const idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.name = 'id';
        idInput.value = id;
        
        const pumpInput = document.createElement('input');
        pumpInput.type = 'hidden';
        pumpInput.name = 'pump_id';
        pumpInput.value = pump.id;

        form.appendChild(idInput);
        form.appendChild(pumpInput);
        document.body.appendChild(form);
        form.submit();
    };

    const handleUpdateName = (e) => {
        e.preventDefault();
        const form = e.target;
        form.submit();
    };

    const handleUpdatePump = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/updatePump', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json().catch(() => ({}));

            if (data.success || response.redirected) {
                toast.success('تم تحديث بيانات الماكينة بنجاح');
                window.location.reload();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء التحديث');
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل الاتصال بالخادم');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-6 max-w-7xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <a href="/PETRODIESEL2/public/pumps" className="text-slate-500 hover:text-blue-600 mb-2 flex items-center gap-1 text-sm font-bold transition-colors">
                        <ArrowRight className="w-4 h-4 ml-1" /> العودة للمكائن
                    </a>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Settings className="w-8 h-8 text-blue-600" />
                            تعديل الماكينة: <span className="text-blue-600">{pump.name}</span>
                        </h1>
                        <button 
                            onClick={() => setIsEditingPump(true)}
                            className="p-1.5 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsAddingCounter(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                    >
                        <Trash2 className="w-4 h-4 hidden" /> {/* Dummy icon entry for layout consistency if needed, but using Plus here */}
                        <Settings className="w-4 h-4" /> إضافة عداد جديد
                    </button>
                    <Badge size="lg" color="slate" icon={Fuel}>
                        {pump.tank_name}
                    </Badge>
                </div>
            </div>

            {/* Counters Grid */}
            <Grid numItems={1} numItemsMd={2} className="gap-6">
                {counters.map((counter, idx) => (
                    <motion.div 
                        key={counter.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="h-full border-t-4 border-t-amber-500 relative overflow-hidden group hover:shadow-lg transition-shadow bg-white">
                            <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
                                <Gauge className="w-32 h-32" />
                            </div>

                            <div className="relative">
                                {/* Card Header */}
                                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shadow-sm">
                                            <Gauge className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">
                                                {counter.name || `العداد ${getCounterNumber(counter.name, idx)}`}
                                            </h3>
                                            <span className="text-xs text-slate-400 font-mono">ID: #{counter.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => setEditingCounter(counter)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="تعديل الاسم"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setShowDeleteModal(counter)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="حذف العداد"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                <form onSubmit={(e) => handleUpdateCounter(e, counter.id)} className="space-y-5">
                                    <input type="hidden" name="pump_id" value={pump.id} />
                                    <input type="hidden" name="counter_id" value={counter.id} />

                                    {/* Worker Select */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            العامل المسؤول
                                        </label>
                                        <div className="relative">
                                            <select 
                                                name="worker_id" 
                                                defaultValue={counter.current_worker_id || ""}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none font-bold text-slate-700"
                                            >
                                                <option value="">-- غير محدد --</option>
                                                {workers.map(worker => (
                                                    <option key={worker.id} value={worker.id}>
                                                        {worker.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                        <p className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                                            <CheckCircle className="w-3 h-3" />
                                            سيتم ربط المبيعات بهذا العامل
                                        </p>
                                    </div>

                                    {/* Reading Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            قراءة العداد الحالية
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                name="current_reading"
                                                defaultValue={counter.current_reading}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono text-lg font-bold text-slate-800 pl-16 text-right"
                                            />
                                            <div className="absolute left-0 top-0 bottom-0 px-3 bg-slate-100 border-r border-slate-200 rounded-l-xl flex items-center text-slate-500 font-mono text-sm font-bold">
                                                Liters
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button 
                                        type="submit"
                                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold flex justify-center items-center gap-2 mt-2"
                                    >
                                        <Save className="w-4 h-4" /> حفظ التغييرات
                                    </button>
                                </form>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </Grid>

            {/* Edit Name Modal */}
            <AnimatePresence>
                {editingCounter && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setEditingCounter(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-blue-500" /> تعديل اسم العداد
                            </h3>
                            <form action="/PETRODIESEL2/public/pumps/updateCounterName" method="POST" onSubmit={handleUpdateName}>
                                <input type="hidden" name="pump_id" value={pump.id} />
                                <input type="hidden" name="counter_id" value={editingCounter.id} />
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الجديد</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        defaultValue={editingCounter.name} 
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setEditingCounter(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                                    >
                                        إلغاء
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md"
                                    >
                                        حفظ
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border-t-4 border-red-500"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-red-600 mb-4">
                                <div className="p-3 bg-red-50 rounded-full">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">تأكيد الحذف</h3>
                            </div>
                            
                            <p className="text-slate-600 mb-6 font-medium">
                                هل أنت متأكد من حذف هذا العداد؟ <br/>
                                <span className="text-sm text-red-500">لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المرتبطة.</span>
                            </p>

                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowDeleteModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    onClick={() => handleDelete(showDeleteModal.id)}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md"
                                >
                                    حذف نهائي
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Pump Modal */}
            <AnimatePresence>
                {isEditingPump && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setIsEditingPump(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-500" /> تعديل بيانات الماكينة
                            </h3>
                            <form action="/PETRODIESEL2/public/pumps/updatePump" method="POST" onSubmit={handleUpdatePump}>
                                <input type="hidden" name="id" value={pump.id} />
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">اسم الماكينة</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            defaultValue={pump.name} 
                                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">الخزان (نوع الوقود)</label>
                                        <div className="relative">
                                            <select 
                                                name="tank_id" 
                                                defaultValue={pump.tank_id} 
                                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none font-bold"
                                            >
                                                {tanks.map(tank => (
                                                    <option key={tank.id} value={tank.id}>
                                                        {tank.name} ({tank.product_type})
                                                    </option>
                                                ))}
                                            </select>
                                            <Fuel className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditingPump(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                                    >
                                        إلغاء
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md"
                                    >
                                        حفظ التعديلات
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Counter Modal */}
            <AnimatePresence>
                {isAddingCounter && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setIsAddingCounter(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" /> إضافة عداد جديد
                            </h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                try {
                                    const response = await fetch('/PETRODIESEL2/public/pumps/addCounter', {
                                        method: 'POST',
                                        body: formData,
                                        headers: {
                                            'Accept': 'application/json',
                                            'X-Requested-With': 'XMLHttpRequest'
                                        }
                                    });
                                    
                                    const data = await response.json().catch(() => ({}));

                                    if (data.success || response.ok) {
                                        toast.success('تمت إضافة العداد بنجاح');
                                        window.location.reload();
                                    } else {
                                        toast.error(data.message || data.error || 'حدث خطأ أثناء الإضافة');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    toast.error('فشل الاتصال بالخادم');
                                }
                            }}>
                                <input type="hidden" name="pump_id" value={pump.id} />
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">اسم العداد</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-bold placeholder:text-slate-300"
                                            placeholder="مثال: مسدس 1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">القراءة الأولية</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                name="initial_reading" 
                                                className="w-full p-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono font-bold"
                                                placeholder="0.00"
                                                required
                                            />
                                            <Gauge className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Requested Feature: Responsible Worker Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">العامل المسؤول</label>
                                        <div className="relative">
                                            <select 
                                                name="worker_id" 
                                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none font-bold text-slate-700 cursor-pointer"
                                            >
                                                <option value="">-- اختر عامل --</option>
                                                {workers.map(worker => (
                                                    <option key={worker.id} value={worker.id}>
                                                        {worker.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                                        </div>
                                        <p className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                                            <CheckCircle className="w-3 h-3" />
                                            تعيين مباشر للعامل عند الإنشاء
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingCounter(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                                    >
                                        إلغاء
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md"
                                    >
                                        إضافة العداد
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </motion.div>
    );
}
