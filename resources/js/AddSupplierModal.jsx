import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@tremor/react';
import { X, Save, Building2, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function AddSupplierModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // API Create uses JSON, but we can stick to FormData if Controller expects it, 
        // OR Controller api_create expects JSON. Let's check Controller. 
        // Controller api_create reads php://input json_decode. 
        // So we must send JSON.

        try {
            const response = await fetch('/PETRODIESEL2/public/suppliers/api_create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                toast.success('تم إضافة المورد بنجاح');
                onSuccess();
                onClose();
                setFormData({ name: '', phone: '' });
            } else {
                toast.error(data.message || 'حدث خطأ أثناء الإضافة');
            }
        } catch (error) {
            toast.error('فشل الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} static={true} className="z-[100]">
            <DialogPanel className="max-w-md w-full bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 p-0 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-navy-900" />
                            إضافة مورد جديد
                        </h2>
                        <p className="text-slate-500 text-sm">أدخل بيانات الشركة أو المورد</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">اسم المورد / الشركة</label>
                        <div className="relative">
                            <Building2 className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="اسم المورد"
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
                                    حفظ
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </DialogPanel>
        </Dialog>
    );
}
