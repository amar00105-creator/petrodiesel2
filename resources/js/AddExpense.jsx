import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric } from '@tremor/react';
import { Wallet, Save, FileText, Banknote, Calendar, Tag, User, Users } from 'lucide-react';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = [
    { id: 'maintenance', name: 'صيانة وإصلاحات' },
    { id: 'electricity', name: 'كهرباء ومياه' },
    { id: 'salaries', name: 'رواتب موظفين' },
    { id: 'government', name: 'رسوم حكومية' },
    { id: 'hospitality', name: 'ضيافة ونثريات' },
    { id: 'other', name: 'أخرى' }
];

export default function AddExpense() {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'cash', // cash, bank
        notes: '',
        related_entity_type: '', // '', 'supplier', 'customer'
        related_entity_id: ''
    });

    const [suppliers, setSuppliers] = useState([]);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        // Fetch Suppliers and Customers
        fetch('/PETRODIESEL2/public/expenses/get_entities')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuppliers(data.suppliers);
                    setCustomers(data.customers);
                }
            })
            .catch(err => console.error('Failed to load entities', err));
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEntityTypeChange = (type) => {
        setFormData(prev => ({ 
            ...prev, 
            related_entity_type: type, 
            related_entity_id: '' // Reset selection when type changes
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = new FormData();
        Object.keys(formData).forEach(key => form.append(key, formData[key]));
        
        // Ensure source_type and source_id are set if needed by backend, 
        // though currently backend defaults or we assume handled.
        // The backend expects 'source_type' and 'source_id' for deduction.
        // Current form only has 'payment_method' (cash/bank). 
        // We need to map this.
        form.append('source_type', formData.payment_method === 'cash' ? 'safe' : 'bank');
        // We don't have a specific safe/bank selector in UI yet, backend might use fallback or we need to add it?
        // Use default behavior logic from backend or add selector if crucial.
        // For now, mapping payment_method is key.

        try {
            const response = await fetch('/PETRODIESEL2/public/expenses/store', {
                method: 'POST',
                body: form
            });

            if (response.redirected || response.ok) {
                toast.success('تم تسجيل المصروف بنجاح');
                setTimeout(() => window.location.href = '/PETRODIESEL2/public/expenses', 1000);
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
            className="grid grid-cols-12 gap-6 p-6 h-full max-w-[1800px] mx-auto"
        >
             {/* Left: Intelligence */}
             <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit">
                 <Card className="bg-navy-900 border-none shadow-2xl relative overflow-hidden p-8 flex flex-col items-center text-center">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     
                     <div className="relative z-10 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-white/5">
                        <Wallet className="w-10 h-10 text-red-400" />
                     </div>
                     
                     <Title className="text-3xl text-white mb-2 font-bold font-cairo">تسجيل مصروف</Title>
                     <Text className="text-slate-400 mb-6">خصم من الخزينة/البنك</Text>

                     <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10">
                        <Text className="text-slate-400 text-xs mb-1">القيمة المسجلة</Text>
                        <Metric className="text-white font-mono text-4xl">
                            {formData.amount ? Number(formData.amount).toLocaleString() : '0.00'} 
                            <span className="text-base font-normal text-slate-500 ml-2">SAR</span>
                        </Metric>
                     </div>
                 </Card>

                 <Card className="bg-red-50 border-red-100 shadow-sm">
                    <div className="flex items-start gap-4">
                        <FileText className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <Text className="font-bold text-red-900">ملاحظة محاسبية</Text>
                            <Text className="text-xs text-red-700 mt-1">
                                سيتم خصم هذا المبلغ مباشرة من رصيد {formData.payment_method === 'cash' ? 'الخزينة (Cash)' : 'البنك (Bank Account)'} وتحديث التقارير المالية.
                            </Text>
                        </div>
                    </div>
                 </Card>
             </div>

             {/* Right: Form */}
             <div className="col-span-12 lg:col-span-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <Card className="bg-white ring-1 ring-slate-100 shadow-lg p-8">
                        <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-50">
                            <div>
                                <Title className="text-navy-900 font-bold text-2xl">بيانات المصروف</Title>
                                <Text className="text-slate-500">إدخال تفاصيل العملية المالية</Text>
                            </div>
                            <div className="p-3 bg-red-50 rounded-2xl">
                                <Banknote className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 mb-2 block">عنوان المصروف</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    required 
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-bold text-lg"
                                    placeholder="مثال: فاتورة كهرباء شهر يناير"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">المبلغ (SAR)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    name="amount" 
                                    required 
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono font-bold text-xl text-red-600"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">التاريخ</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
                                    <input 
                                        type="date" 
                                        name="date" 
                                        required 
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">التصنيف</label>
                                <div className="relative">
                                    <Tag className="absolute right-4 top-4 text-slate-400 w-5 h-5" />
                                    <select 
                                        name="category" 
                                        required 
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer"
                                    >
                                        <option value="">اختر التصنيف...</option>
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">طريقة الدفع</label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, payment_method: 'cash'})}
                                        className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${formData.payment_method === 'cash' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        نقدي (خزنة)
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, payment_method: 'bank'})}
                                        className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${formData.payment_method === 'bank' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        تحويل بنكي
                                    </button>
                                </div>
                            </div>

                            {/* --- Related Entity Section --- */}
                            <div className="md:col-span-2 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-500" />
                                    جهة مرتبطة (اختياري)
                                </label>
                                
                                <div className="flex gap-4 mb-4">
                                     <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                                        <input 
                                            type="radio" 
                                            name="entity_type" 
                                            checked={formData.related_entity_type === ''}
                                            onChange={() => handleEntityTypeChange('')}
                                            className="accent-blue-600"
                                        />
                                        <span className="text-sm">لا يوجد</span>
                                     </label>
                                     
                                     <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                                        <input 
                                            type="radio" 
                                            name="entity_type" 
                                            checked={formData.related_entity_type === 'supplier'}
                                            onChange={() => handleEntityTypeChange('supplier')}
                                            className="accent-blue-600"
                                        />
                                        <span className="text-sm">مورد</span>
                                     </label>

                                     <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                                        <input 
                                            type="radio" 
                                            name="entity_type" 
                                            checked={formData.related_entity_type === 'customer'}
                                            onChange={() => handleEntityTypeChange('customer')}
                                            className="accent-blue-600"
                                        />
                                        <span className="text-sm">عميل</span>
                                     </label>
                                </div>

                                {formData.related_entity_type && (
                                    <div className="relative animate-in fade-in slide-in-from-top-2">
                                        
                                        <select
                                            name="related_entity_id"
                                            value={formData.related_entity_id}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">
                                                {formData.related_entity_type === 'supplier' ? 'اختر المورد...' : 'اختر العميل...'}
                                            </option>
                                            
                                            {formData.related_entity_type === 'supplier' && suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                            ))}

                                            {formData.related_entity_type === 'customer' && customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            {/* --------------------------- */}

                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 mb-2 block">ملاحظات / وصف إضافي</label>
                                <textarea 
                                    name="notes" 
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none"
                                    placeholder="أي تفاصيل إضافية..."
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end gap-4">
                             <button 
                                type="button" 
                                className="px-8 py-3.5 text-slate-500 hover:bg-slate-50 font-bold rounded-xl transition-colors"
                            >
                                إلغاء
                            </button>
                            <button 
                                type="submit" 
                                className="px-10 py-3.5 bg-navy-900 text-white font-bold rounded-xl shadow-xl shadow-navy-900/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5"/> حفظ المصروف
                            </button>
                        </div>
                    </Card>
                </form>
             </div>
        </motion.div>
    );
}
