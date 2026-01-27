import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Switch, Metric, Badge } from '@tremor/react';
import { ShieldCheck, Lock, Save, LayoutDashboard, ShoppingCart, Truck, Wallet, FileBarChart, Settings, Calculator, Users, Database, ShieldAlert, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const PERMISSIONS = [
    { key: 'dashboard_view', label: 'عرض لوحة التحكم', icon: LayoutDashboard },
    { key: 'sales_view', label: 'عرض المبيعات', icon: ShoppingCart },
    { key: 'sales_create', label: 'إضافة مبيعات', icon: Calculator },
    { key: 'purchases_view', label: 'عرض المشتروات', icon: Truck },
    { key: 'purchases_create', label: 'إضافة مشتروات', icon: Truck },
    { key: 'finance_view', label: 'عرض الحسابات', icon: Wallet },
    { key: 'finance_manage', label: 'إدارة الحسابات', icon: Wallet },
    { key: 'reports_view', label: 'استعراض التقارير', icon: FileBarChart },
    { key: 'settings_view', label: 'الوصول للإعدادات', icon: Settings },
    { key: 'stations_manage', label: 'إدارة المحطات', icon: Database },
    { key: 'users_manage', label: 'إدارة المستخدمين', icon: Users },
    { key: 'tanks_view', label: 'عرض المخزون', icon: Database },
];

export default function AddRole() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: {}
    });

    const handleSwitch = (key, val) => {
        setFormData(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [key]: val }
        }));
    };

    const handleSelectAll = (val) => {
        const newPerms = {};
        PERMISSIONS.forEach(p => newPerms[p.key] = val);
        setFormData(prev => ({ ...prev, permissions: newPerms }));
    };

    const safeSubmit = (e) => {
        e.preventDefault();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/PETRODIESEL2/public/roles/create'; 
        
        ['name', 'description'].forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field;
            input.value = formData[field];
            form.appendChild(input);
        });

        Object.entries(formData.permissions).forEach(([key, val]) => {
             if(val) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = `permissions[${key}]`;
                input.value = 1;
                form.appendChild(input);
             }
        });

        document.body.appendChild(form);
        form.submit();
    };

    // Calculate Access Level
    const count = Object.values(formData.permissions).filter(Boolean).length;
    const accessLevel = count > 10 ? 'حساس (Critical)' : count > 5 ? 'عالي (High)' : 'عادي (Standard)';
    const levelColor = count > 10 ? 'red' : count > 5 ? 'amber' : 'emerald';

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-12 gap-6 p-6 h-full max-w-[1800px] mx-auto"
        >
             {/* Left: Intelligence & Preview */}
             <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit">
                 <Card className="bg-navy-900 border-none shadow-2xl relative overflow-hidden p-8 flex flex-col items-center text-center">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     
                     <div className="relative z-10 w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white/5 rotate-3">
                        <ShieldCheck className="w-12 h-12 text-emerald-400" />
                     </div>
                     
                     <Title className="text-3xl text-white mb-2 font-bold font-cairo">
                        {formData.name || 'دور وظيفي جديد'}
                     </Title>
                     <Text className="text-slate-400 mb-8 max-w-[200px] mx-auto line-clamp-2">
                        {formData.description || 'وصف الدور سيظهر هنا...'}
                     </Text>

                     <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <Text className="text-slate-400 text-xs text-center mb-1">الصلاحيات</Text>
                            <Metric className="text-white text-center font-mono">{count}</Metric>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <Text className="text-slate-400 text-xs text-center mb-1">المستوى</Text>
                            <Badge color={levelColor} size="xs" className="mx-auto mt-1 justify-center">{accessLevel}</Badge>
                        </div>
                     </div>
                 </Card>
                 
                 {count > 8 && (
                     <Card className="bg-red-50 border-red-100 flex items-start gap-4">
                        <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                            <Text className="text-red-800 font-bold">تنبيه أمني</Text>
                            <Text className="text-red-600 text-xs mt-1">
                                يمتلك هذا الدور صلاحيات واسعة جداً. يرجى التأكد من منحه للموظفين الموثوقين فقط.
                            </Text>
                        </div>
                     </Card>
                 )}
             </div>

             {/* Right: Form */}
             <div className="col-span-12 lg:col-span-8">
                <form onSubmit={safeSubmit} className="flex flex-col gap-6">
                    
                    {/* Basic Info */}
                    <Card className="bg-white ring-1 ring-slate-100 shadow-lg p-8">
                        <div className="flex justify-between items-start mb-8 pb-4 border-b border-slate-50">
                            <div>
                                <Title className="text-navy-900 font-bold text-2xl">تعريف الدور</Title>
                                <Text className="text-slate-500">البيانات الأساسية للدور الوظيفي</Text>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl">
                                <KeyRound className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                             <div>
                                 <label className="text-sm font-bold text-slate-700 mb-2 block">اسم الدور</label>
                                 <input 
                                     type="text" 
                                     required 
                                     value={formData.name}
                                     onChange={e => setFormData({...formData, name: e.target.value})}
                                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                     placeholder="مثال: مدير مالي"
                                 />
                             </div>
                             <div>
                                 <label className="text-sm font-bold text-slate-700 mb-2 block">الوصف</label>
                                 <textarea 
                                     rows={3}
                                     value={formData.description}
                                     onChange={e => setFormData({...formData, description: e.target.value})}
                                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                     placeholder="وصف مختصر للمسؤوليات..."
                                 />
                             </div>
                        </div>
                    </Card>

                    {/* Permissions */}
                    <Card className="bg-white ring-1 ring-slate-100 shadow-lg p-8">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
                            <div>
                                <Title className="text-navy-900 font-bold flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-amber-500"/> جدول الصلاحيات
                                </Title>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-600">منح الكل</span>
                                <Switch onChange={handleSelectAll} color="emerald" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PERMISSIONS.map((perm) => (
                                <div 
                                    key={perm.key}
                                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group ${formData.permissions[perm.key] ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                    onClick={() => handleSwitch(perm.key, !formData.permissions[perm.key])}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl transition-colors ${formData.permissions[perm.key] ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                            <perm.icon className="w-5 h-5"/>
                                        </div>
                                        <span className={`text-sm font-bold transition-colors ${formData.permissions[perm.key] ? 'text-navy-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                            {perm.label}
                                        </span>
                                    </div>
                                    <Switch checked={!!formData.permissions[perm.key]} onChange={() => {}} color="emerald" />
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-4">
                        <button 
                            type="button" 
                            className="px-8 py-4 text-slate-500 hover:bg-white hover:shadow-lg font-bold rounded-xl transition-all"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20 hover:-translate-y-1 hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                        >
                            <Save className="w-5 h-5"/> حفظ الدور الوظيفي
                        </button>
                    </div>

                </form>
             </div>
        </motion.div>
    );
}
