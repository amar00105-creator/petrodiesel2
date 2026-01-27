import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@tremor/react';
import { X, Save, User, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function EditWorkerModal({ isOpen, onClose, worker, onSuccess }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (worker) {
            setFormData({
                id: worker.id || '',
                name: worker.name || '',
                phone: worker.phone || '',
            });
        }
    }, [worker]);

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
            const response = await fetch('/PETRODIESEL2/public/workers/update_ajax', {
                method: 'POST',
                body: form
            });
            const data = await response.json();

            if (data.success) {
                toast.success('تم تحديث بيانات العامل بنجاح');
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
                onSuccess({
                    ...worker,
                    name: formData.name,
                    phone: formData.phone
                });
                onClose();
            } catch (err) {
                console.error("Error updating UI state:", err);
            }
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} static={true} className="z-[100]">
            <DialogPanel className="max-w-md w-full bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 p-0 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-navy-900" />
                            تعديل بيانات العامل
                        </h2>
                        <p className="text-slate-500 text-sm">تعديل اسم أو رقم العامل</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">الاسم</label>
                        <div className="relative">
                            <User className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="اسم العامل"
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">رقم الهاتف</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="05xxxxxxxx"
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ml-2"
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
