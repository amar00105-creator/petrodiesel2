import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@tremor/react';
import { X, Save, Building2, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function EditSupplierModal({ isOpen, onClose, supplier, onSuccess }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (supplier) {
            setFormData({
                id: supplier.id || '',
                name: supplier.name || '',
                phone: supplier.phone || '',
            });
        }
    }, [supplier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = new FormData();
        form.append('id', formData.id);
        form.append('name', formData.name);
        form.append('phone', formData.phone);

        let shouldUpdateUI = false;

        try {
            const response = await fetch('/PETRODIESEL2/public/suppliers/update_ajax', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: form
            });
            const data = await response.json();

            if (data.success) {
                toast.success('تم تحديث المورد بنجاح');
                shouldUpdateUI = true;
            } else {
                toast.error(data.message || 'حدث خطأ أثناء التحديث');
            }
        } catch (error) {
            console.error('Update Request Error:', error);
            toast.error('فشل الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }

        if (shouldUpdateUI) {
            try {
                // Pass back the updated fields combined with existing id
                onSuccess({
                    ...supplier,
                    name: formData.name,
                    phone: formData.phone
                });
                onClose();
            } catch (err) {
                console.error("Error updating UI state:", err);
                // We don't show an error to user here because the backend update WAS successful.
                // Just log it so we can debug why the list didn't update if that happens.
            }
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} static={true} className="z-[100]">
            <DialogPanel className="max-w-md w-full bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 p-0 overflow-hidden dark:bg-[#1e293b] dark:ring-white/10 dark:shadow-none">
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center dark:bg-white/5 dark:border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 dark:text-white">
                            <Building2 className="w-5 h-5 text-navy-900 dark:text-blue-400" />
                            تعديل بيانات المورد
                        </h2>
                        <p className="text-slate-500 text-sm dark:text-slate-400">تعديل الاسم أو الهاتف</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 dark:hover:bg-white/10 dark:text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">اسم المورد</label>
                        <div className="relative">
                            <Building2 className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="اسم المورد"
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="05xxxxxxxx"
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ml-2 dark:text-slate-400 dark:hover:bg-white/5"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 text-sm font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? 'جاري الحفظ...' : (
                                <>
                                    <Save className="w-4 h-4" />
                                    حفظ التغييرات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </DialogPanel>
        </Dialog>
    );
}
