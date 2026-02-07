import React, { useState } from 'react';
import { Card, Title, Text, TextInput, Select, SelectItem, MultiSelect, MultiSelectItem, Badge } from '@tremor/react';
import { User, Edit, Save, X, Building2, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManager({ users = [], roles = [], stations = [], onSave, onCreate }) {
    const [editingUser, setEditingUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (user) => {
        // Extract station IDs
        const stationIds = user.stations ? user.stations.map(s => String(s.id)) : 
                           (user.station_id ? [String(user.station_id)] : []);

        setEditingUser({ ...user, station_ids: stationIds, mode: 'edit' });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingUser({ 
            id: null, 
            name: '', 
            email: '', 
            password: '', 
            role_id: '', 
            station_ids: [], 
            status: 'active',
            mode: 'create' 
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!editingUser) return;
        
        if (editingUser.mode === 'create') {
            if (!editingUser.name || !editingUser.email || !editingUser.password) {
                toast.error('الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة');
                return;
            }
            // Call onCreate prop (passed from parent)
            if (onCreate) {
                onCreate(editingUser);
            }
        } else {
            // Call onSave prop (existing logic)
            onSave(editingUser);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Title className="dark:text-white">إدارة المستخدمين وتعيين الأدوار</Title>
                        <Badge color="blue">{users.length} مستخدم</Badge>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all"
                    >
                        <User className="w-4 h-4" /> إضافة مستخدم جديد
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10">
                            <tr>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">المحطة (مكان العمل)</th>
                                <th className="p-4">الدور (الصلاحية)</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {users.map(user => {
                                const roleName = user.role_name || (user.role === 'super_admin' ? 'مدير عام (Legacy)' : user.role);
                                const stationName = user.station_name || 'عام / جميع المحطات';
                                
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-white/5 dark:border-white/10">
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3 dark:text-white">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            {user.name}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${user.station_id ? 'bg-sky-50 text-sky-700' : 'bg-purple-50 text-purple-700'}`}>
                                                <Building2 className="w-3 h-3" />
                                                {stationName}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${user.role_id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                <ShieldCheck className="w-3 h-3" />
                                                {roleName}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge size="xs" color={user.status === 'active' ? 'emerald' : 'red'}>
                                                {user.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit User Modal */}
            <AnimatePresence>
                {isModalOpen && editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden dark:bg-slate-900 dark:border dark:border-white/10 dark:text-white"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-white/5 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Title className="dark:text-white">{editingUser.mode === 'create' ? 'إضافة مستخدم جديد' : editingUser.name}</Title>
                                        <Text className="text-xs dark:text-slate-400">{editingUser.mode === 'create' ? 'أدخل بيانات المستخدم الجديد' : editingUser.email}</Text>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {editingUser.mode === 'create' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">اسم المستخدم</label>
                                            <TextInput 
                                                value={editingUser.name} 
                                                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} 
                                                placeholder="الاسم الكامل"
                                                className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">البريد الإلكتروني</label>
                                            <TextInput 
                                                value={editingUser.email} 
                                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} 
                                                placeholder="example@email.com"
                                                className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">كلمة المرور (Secret)</label>
                                            <TextInput 
                                                type="password"
                                                value={editingUser.password} 
                                                onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} 
                                                placeholder="********"
                                                className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">مناطق العمل (المحطات)</label>
                                    <MultiSelect 
                                        value={editingUser.station_ids || []} 
                                        onValueChange={(val) => setEditingUser({...editingUser, station_ids: val})}
                                        placeholder="اختر المحطات..."
                                        className="text-right !dark:bg-slate-800 !dark:fill-slate-800 !dark:border-slate-700 !dark:text-white [&>button]:!dark:bg-slate-800 [&>button]:!dark:text-white"
                                    >
                                        {stations.map(station => (
                                            <MultiSelectItem key={station.id} value={String(station.id)}>
                                                {station.name}
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelect>
                                    <p className="text-xs text-slate-400 mt-1">تحديد المحطة يقيد وصول المستخدم لبيانات هذه المحطة فقط. تركه فارغاً يعني الوصول لجميع المحطات (إدارة مركزية).</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">الدور الوظيفي (الصلاحيات)</label>
                                    <select 
                                        value={String(editingUser.role_id || '0')} 
                                        onChange={(e) => setEditingUser({...editingUser, role_id: e.target.value === '0' ? null : e.target.value})}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 border outline-none transition-all"
                                    >
                                        <option value="0">غير محدد (صلاحيات افتراضية)</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={String(role.id)}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">حالة الحساب</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 hover:bg-emerald-50 peer-checked:border-emerald-500">
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                checked={editingUser.status === 'active'} 
                                                onChange={() => setEditingUser({...editingUser, status: 'active'})}
                                                className="w-4 h-4 text-emerald-600"
                                            />
                                            <span className="font-bold text-emerald-700">نشط (Active)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 hover:bg-red-50">
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                checked={editingUser.status === 'inactive'} 
                                                onChange={() => setEditingUser({...editingUser, status: 'inactive'})}
                                                className="w-4 h-4 text-red-600"
                                            />
                                            <span className="font-bold text-red-700">موقوف (Inactive)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 dark:bg-white/5 dark:border-white/10">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-8 py-2 rounded-xl font-bold bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" /> حفظ التعديلات
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
