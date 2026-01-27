import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@tremor/react';
import { X, Save, User, Phone, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AddCustomerModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const form = new FormData();
        form.append('name', formData.name);
        form.append('phone', formData.phone);
        form.append('address', formData.address);
        form.append('notes', formData.notes);

        try {
            const response = await fetch('/PETRODIESEL2/public/hr/api?entity=customer&action=store', {
                method: 'POST',
                body: form
            });
            const data = await response.json();

            if (data.success) {
                // Professional Success Message with Motion Effect
                toast.custom((t) => (
                  <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl shadow-xl w-full">
                    <div className="p-2 bg-emerald-500 rounded-full text-white animate-pulse">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-emerald-900 font-bold">تم حفظ العميل الجديد!</h3>
                      <p className="text-emerald-700 text-sm">تم إضافة {formData.name} إلى القائمة بنجاح</p>
                    </div>
                  </div>
                ), { duration: 4000 });

                // Construct new customer object for local state update
                const newCustomer = {
                    id: data.id, 
                    ...formData
                };
                
                onSuccess(newCustomer);
                onClose();
                setFormData({ name: '', phone: '', address: '', notes: '' });
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
                            <User className="w-5 h-5 text-indigo-600" />
                            إضافة عميل جديد
                        </h2>
                        <p className="text-slate-500 text-sm">أدخل بيانات العميل</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">اسم العميل</label>
                        <div className="relative">
                            <User className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="الاسم الكامل"
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">العنوان</label>
                        <div className="relative">
                            <MapPin className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="المدينة، الحي..."
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">ملاحظات</label>
                        <div className="relative">
                            <FileText className="absolute right-3 top-3 text-slate-400 w-5 h-5" />
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="ملاحظات إضافية..."
                                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px]"
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
