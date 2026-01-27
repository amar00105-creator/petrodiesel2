import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric } from '@tremor/react';
import { Landmark, Save, Wallet, CreditCard, Building, Info, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AddAccount() {
    const [formData, setFormData] = useState({
        name: '',
        type: 'safe', // safe, bank
        account_number: '', // For bank
        bank_name: '', // For bank
        balance: '',
        currency: 'SAR',
        description: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Simulate API
        await new Promise(r => setTimeout(r, 600));
        toast.success('تم إنشاء الحساب المالي بنجاح');
        // Real implementation would POST to /finance/store
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-12 gap-6 p-6 h-full max-w-[1800px] mx-auto"
        >
             {/* Left: Preview */}
             <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit">
                 <Card className={`border-none shadow-2xl relative overflow-hidden p-8 flex flex-col items-center text-center transition-colors ${formData.type === 'safe' ? 'bg-navy-900' : 'bg-blue-900'}`}>
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     
                     <div className="relative z-10 w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white/5">
                        {formData.type === 'safe' ? <Wallet className="w-10 h-10 text-emerald-400" /> : <Landmark className="w-10 h-10 text-blue-400" />}
                     </div>
                     
                     <Title className="text-3xl text-white mb-2 font-bold font-cairo">
                        {formData.name || (formData.type === 'safe' ? 'خزنة جديدة' : 'حساب بنكي جديد')}
                     </Title>
                     <Text className="text-slate-300 mb-6">{formData.type === 'safe' ? 'Cash Safe' : 'Bank Account'}</Text>

                     <div className="w-full bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                        <Text className="text-slate-300 text-xs mb-1">الرصيد الافتتاحي</Text>
                        <Metric className="text-white font-mono text-4xl">
                            {formData.balance ? Number(formData.balance).toLocaleString() : '0.00'} 
                            <span className="text-base font-normal text-slate-400 ml-2">SAR</span>
                        </Metric>
                     </div>
                 </Card>

                 <Card className="bg-white border-slate-100 shadow-sm">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                        <div>
                            <Text className="font-bold text-navy-900">معلومات هامة</Text>
                            <Text className="text-xs text-slate-500 mt-1">
                                الحسابات المالية تستخدم في تتبع المبيعات والمصروفات. تأكد من دقة "الرصيد الافتتاحي" لأنه سيؤثر على تقارير الجرد المالي.
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
                                <Title className="text-navy-900 font-bold text-2xl">بيانات الحساب</Title>
                                <Text className="text-slate-500">تعريف خزنة نقدية أو حساب بنكي</Text>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl">
                                <ShieldCheck className="w-8 h-8 text-slate-600" />
                            </div>
                        </div>

                        <div className="mb-6">
                             <label className="text-sm font-bold text-slate-700 mb-2 block">نوع الحساب</label>
                             <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-200">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'safe'})}
                                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${formData.type === 'safe' ? 'bg-navy-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                    <Wallet className="w-4 h-4" /> خزنة نقدية
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'bank'})}
                                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${formData.type === 'bank' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                    <Landmark className="w-4 h-4" /> حساب بنكي
                                </button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 mb-2 block">اسم الحساب</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required 
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold"
                                    placeholder={formData.type === 'safe' ? "مثال: الخزنة الرئيسية" : "مثال: بنك الراجحي - جاري"}
                                />
                            </div>

                            {formData.type === 'bank' && (
                                <>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-2 block">اسم البنك</label>
                                        <input 
                                            type="text" 
                                            name="bank_name" 
                                            value={formData.bank_name}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="مثال: البنك الأهلي"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-2 block">رقم الحساب / IBAN</label>
                                        <input 
                                            type="text" 
                                            name="account_number" 
                                            value={formData.account_number}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
                                            placeholder="SA0000..."
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">الرصيد الافتتاحي</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    name="balance" 
                                    required 
                                    value={formData.balance}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono font-bold text-emerald-600"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">العملة</label>
                                <select 
                                    name="currency" 
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                >
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-slate-700 mb-2 block">الوصف</label>
                                <textarea 
                                    name="description" 
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                                    placeholder="وصف اختياري..."
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
                                className="px-10 py-3.5 bg-gradient-to-r from-navy-900 to-navy-800 text-white font-bold rounded-xl shadow-xl shadow-navy-900/20 hover:-translate-y-1 hover:shadow-navy-900/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5"/> حفظ الحساب
                            </button>
                        </div>
                    </Card>
                </form>
             </div>
        </motion.div>
    );
}
