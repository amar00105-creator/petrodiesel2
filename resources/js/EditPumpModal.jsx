import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@tremor/react';
import { X, Save, Plus, Trash2, User, Gauge, Fuel, Settings } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';

export default function EditPumpModal({ isOpen, onClose, pump, tanks, workers }) {
    const [formData, setFormData] = useState({
        id: pump.id,
        name: pump.name,
        tank_id: pump.tank_id,
        counters: pump.counters || []
    });

    React.useEffect(() => {
        setFormData({
            id: pump.id,
            name: pump.name,
            tank_id: pump.tank_id,
            counters: pump.counters || []
        });
    }, [pump]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCounterChange = (index, field, value) => {
        const newCounters = [...formData.counters];
        newCounters[index] = { ...newCounters[index], [field]: value };
        setFormData(prev => ({ ...prev, counters: newCounters }));
    };

    const handleSaveAll = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/updateBulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                 toast.success('تم حفظ التغييرات بنجاح');
                 setTimeout(() => window.location.reload(), 800);
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (counterId) => {
        setItemToDelete(counterId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const form = new FormData();
        form.append('id', itemToDelete);
        form.append('pump_id', formData.id);

        try {
            await fetch('/PETRODIESEL2/public/pumps/deleteCounter', { method: 'POST', body: form });
            toast.success('تم الحذف بنجاح');
            setFormData(prev => ({
                ...prev,
                counters: prev.counters.filter(c => c.id !== itemToDelete)
            }));
        } catch (error) {
            toast.error('فشل عملية الحذف');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleDeleteCounter = (counterId) => {
        openDeleteModal(counterId);
    };

    const handleAddCounter = async (name, reading) => {
        if (!name || reading === '') {
            toast.error('يرجى ملء جميع الحقول');
            return;
        }

        const form = new FormData();
        form.append('pump_id', formData.id);
        form.append('name', name);
        form.append('initial_reading', reading);

        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/addCounter', {
                method: 'POST',
                body: form
            });
            const data = await response.json();

            if (data.success) {
                toast.success('تمت إضافة العداد بنجاح');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error('فشل إضافة العداد: ' + (data.error || 'خطأ غير معروف'));
            }
        } catch (e) {
            toast.error('خطأ في الاتصال');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} static={true} className="z-[100]">
             <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف عداد"
                message="هل أنت متأكد من حذف هذا العداد؟"
                isDeleting={isDeleting}
            />
            <DialogPanel className="max-w-4xl p-0 overflow-hidden bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" />
                            إدارة الماكينة: {pump.name}
                        </h2>
                        <p className="text-slate-500 text-sm">تعديل البيانات والعدادات والعمال</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
                    {/* Pump Details Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-r-4 border-blue-500 pr-3">
                            <Fuel className="w-5 h-5 text-blue-500" />
                            <h3>بيانات الماكينة</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">اسم الماكينة</label>
                                <input 
                                    type="text"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                    value={formData.name} 
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="مثال: ماكينة 1"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">الخزان المرتبط</label>
                                <select 
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                    value={String(formData.tank_id)} 
                                    onChange={(e) => handleChange('tank_id', e.target.value)}
                                >
                                    {tanks.map(tank => (
                                        <option key={tank.id} value={String(tank.id)}>
                                            {tank.name} ({tank.product_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2 flex justify-end">
                                {/* Removed individual save button */}
                            </div>
                        </div>
                    </section>

                    {/* Counters Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-r-4 border-emerald-500 pr-3">
                            <Gauge className="w-5 h-5 text-emerald-500" />
                            <h3>العدادات والعمال</h3>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.counters.map((counter, idx) => (
                                <div key={counter.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-colors flex flex-col md:flex-row gap-4 items-end md:items-center">
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400">اسم العداد</label>
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                            value={counter.name} 
                                            onChange={(e) => handleCounterChange(idx, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-32 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400">القراءة الحالية</label>
                                        <input 
                                            type="number"
                                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                            value={counter.current_reading} 
                                            onChange={(e) => handleCounterChange(idx, 'current_reading', e.target.value)}
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400">العامل المسؤول</label>
                                        <select 
                                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                            value={String(counter.current_worker_id || '')} 
                                            onChange={(e) => handleCounterChange(idx, 'current_worker_id', e.target.value)}
                                        >
                                            <option value="">خالي (بدون عامل)</option>
                                            {workers.map(w => (
                                                <option key={w.id} value={String(w.id)}>
                                                    {w.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleDeleteCounter(counter.id)}
                                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            title="حذف العداد"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.counters.length === 0 && (
                                <div className="text-center py-8 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    لا توجد عدادات لهذه الماكينة
                                </div>
                            )}
                        </div>

                        {/* Add Counter Section */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> إضافة عداد جديد
                            </h4>
                            <div className="flex flex-col md:flex-row gap-3 items-end">
                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400">اسم العداد</label>
                                    <input 
                                        type="text"
                                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                        placeholder="مثال: مسدس 3" 
                                        id="new_counter_name"
                                    />
                                </div>
                                <div className="w-full md:w-32 space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400">القراءة الأولية</label>
                                    <input 
                                        type="number"
                                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                                        defaultValue={0} 
                                        min={0} 
                                        step="0.01" 
                                        id="new_counter_reading"
                                    />
                                </div>
                                <button 
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100/50 hover:bg-blue-100 rounded-lg transition-colors"
                                    onClick={() => handleAddCounter(
                                        document.getElementById('new_counter_name').value, 
                                        document.getElementById('new_counter_reading').value
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? 'جاري الحفظ...' : (
                            <>
                                <Save className="w-4 h-4" />
                                حفظ التعديلات
                            </>
                        )}
                    </button>
                </div>
            </DialogPanel>
        </Dialog>
    );
}
