import React, { useState } from 'react';
import { Card, Title, Text, TextInput, Select, SelectItem, Badge } from '@tremor/react';
import { User, Edit, Save, X, Building2, ShieldCheck, Mail, Lock, KeyRound, Search, Trash2, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserManager({ users = [], roles = [], stations = [], onSave, onCreate, onDelete, isSuperAdmin = false }) {
    const [editingUser, setEditingUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, userId: null, userName: '' });

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return user.name?.toLowerCase().includes(term) ||
               user.email?.toLowerCase().includes(term) ||
               user.username?.toLowerCase().includes(term) ||
               user.role_name?.toLowerCase().includes(term) ||
               user.station_name?.toLowerCase().includes(term);
    });

    const handleEdit = (user) => {
        const stationIds = user.stations ? user.stations.map(s => String(s.id)) : 
                           (user.station_id ? [String(user.station_id)] : []);

        setEditingUser({ ...user, station_ids: stationIds, mode: 'edit' });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingUser({ 
            id: null, 
            name: '', 
            username: '',
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
            if (onCreate) {
                onCreate(editingUser);
            }
        } else {
            onSave(editingUser);
        }
        setIsModalOpen(false);
    };

    const handleRequestDelete = (user) => {
        setDeleteConfirmation({ isOpen: true, userId: user.id, userName: user.name });
    };

    const confirmDelete = () => {
        if (onDelete && deleteConfirmation.userId) {
            onDelete(deleteConfirmation.userId);
            setDeleteConfirmation({ isOpen: false, userId: null, userName: '' });
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.12] dark:ring-0 dark:shadow-[0_0_30px_rgba(16,185,129,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <Title className="dark:text-white">إدارة المستخدمين وتعيين الأدوار</Title>
                        <Badge color="blue">{users.length} مستخدم</Badge>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" /> إضافة مستخدم جديد
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="بحث بالاسم، البريد، الدور، أو المحطة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white text-right text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200 dark:bg-white/[0.03] dark:text-slate-400 dark:border-white/[0.08]">
                            <tr>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">المحطة (مكان العمل)</th>
                                <th className="p-4">الدور (الصلاحية)</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm dark:divide-white/[0.06]">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                                        <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                        <p>{searchTerm ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد مستخدمون'}</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.map((user, index) => {
                                const roleName = user.role_name || (user.role === 'super_admin' ? 'مدير عام (Legacy)' : user.role);
                                const stationName = user.station_name || 'عام / جميع المحطات';
                                
                                return (
                                    <motion.tr 
                                        key={user.id} 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="hover:bg-slate-50/50 transition-colors dark:hover:bg-white/[0.04] dark:border-white/[0.06]"
                                    >
                                        <td className="p-4 font-bold text-slate-800 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{user.name}</p>
                                                    {user.username && (
                                                        <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-xs dark:text-slate-400">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${user.station_id ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'}`}>
                                                <Building2 className="w-3 h-3" />
                                                {stationName}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${user.role_id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-400'}`}>
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
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                    title="تعديل"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {isSuperAdmin && (
                                                    <button 
                                                        onClick={() => handleRequestDelete(user)}
                                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg dark:bg-slate-900 dark:border dark:border-white/10 dark:text-white"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-white/5 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <Title className="dark:text-white">{editingUser.mode === 'create' ? 'إضافة مستخدم جديد' : editingUser.name}</Title>
                                        <Text className="text-xs dark:text-slate-400">{editingUser.mode === 'create' ? 'أدخل بيانات المستخدم الجديد' : editingUser.email}</Text>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Name & Email fields — shown always in create, only for super admin in edit */}
                                {(editingUser.mode === 'create' || isSuperAdmin) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">الاسم الكامل</label>
                                        <TextInput 
                                            value={editingUser.name} 
                                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} 
                                            placeholder="الاسم الكامل"
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">اسم المستخدم (للدخول)</label>
                                        <TextInput 
                                            value={editingUser.username || ''} 
                                            onChange={(e) => setEditingUser({...editingUser, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')})} 
                                            placeholder="username"
                                            className="text-left dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono"
                                            dir="ltr"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">حروف إنجليزية وأرقام فقط — يُستخدم لتسجيل الدخول</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">البريد الإلكتروني</label>
                                        <TextInput 
                                            value={editingUser.email} 
                                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} 
                                            placeholder="example@email.com"
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                            disabled={editingUser.mode === 'edit'}
                                        />
                                        {editingUser.mode === 'edit' && (
                                            <p className="text-xs text-slate-400 mt-1">البريد الإلكتروني لا يمكن تغييره</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">
                                            <KeyRound className="w-4 h-4" />
                                            {editingUser.mode === 'create' ? 'كلمة المرور' : 'تغيير كلمة المرور'}
                                        </label>
                                        <TextInput 
                                            type="password"
                                            value={editingUser.password || ''} 
                                            onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} 
                                            placeholder={editingUser.mode === 'create' ? '********' : 'اتركه فارغاً للإبقاء على كلمة المرور الحالية'}
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                        {editingUser.mode === 'edit' && (
                                            <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                                                <Lock className="w-3 h-3" />
                                                اتركه فارغاً إذا لم ترد تغيير كلمة المرور
                                            </p>
                                        )}
                                    </div>
                                </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-slate-300 text-right">مناطق العمل (المحطات)</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/50">
                                        {stations.length === 0 ? (
                                            <p className="col-span-2 text-center text-sm text-slate-400 py-2">لا توجد محطات متاحة</p>
                                        ) : stations.map(station => {
                                            const isSelected = (editingUser.station_ids || []).includes(String(station.id));
                                            return (
                                                <label 
                                                    key={station.id} 
                                                    className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border transition-all text-right text-sm ${
                                                        isSelected 
                                                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/30' 
                                                            : 'border-slate-200 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700/50'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            const currentIds = editingUser.station_ids || [];
                                                            const stationIdStr = String(station.id);
                                                            const newIds = isSelected 
                                                                ? currentIds.filter(id => id !== stationIdStr)
                                                                : [...currentIds, stationIdStr];
                                                            setEditingUser({...editingUser, station_ids: newIds});
                                                        }}
                                                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                                                    />
                                                    <Building2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                                                    <span className={`font-medium truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {station.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {(editingUser.station_ids || []).length > 0 && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium text-right">
                                            ✓ تم اختيار {editingUser.station_ids.length} محطة
                                        </p>
                                    )}
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
                                    <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">حالة الحساب</label>
                                    <div className="flex gap-4">
                                        <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 transition-all ${editingUser.status === 'active' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-500/30' : 'border-slate-200 hover:bg-emerald-50/50 dark:border-white/10 dark:hover:bg-emerald-900/10'}`}>
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                checked={editingUser.status === 'active'} 
                                                onChange={() => setEditingUser({...editingUser, status: 'active'})}
                                                className="w-4 h-4 text-emerald-600"
                                            />
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400">نشط (Active)</span>
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 transition-all ${editingUser.status === 'inactive' ? 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-500/30' : 'border-slate-200 hover:bg-red-50/50 dark:border-white/10 dark:hover:bg-red-900/10'}`}>
                                            <input 
                                                type="radio" 
                                                name="status" 
                                                checked={editingUser.status === 'inactive'} 
                                                onChange={() => setEditingUser({...editingUser, status: 'inactive'})}
                                                className="w-4 h-4 text-red-600"
                                            />
                                            <span className="font-bold text-red-700 dark:text-red-400">موقوف (Inactive)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3 dark:bg-white/5 dark:border-white/10">
                                <div>
                                    {editingUser.mode === 'edit' && isSuperAdmin && (
                                        <button 
                                            onClick={() => handleRequestDelete(editingUser)}
                                            className="px-4 py-2 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" /> حذف المستخدم
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-white/10"
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
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden dark:bg-slate-900 dark:border dark:border-white/[0.12] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)]"
                        >
                            <div className="p-6 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/30">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">حذف المستخدم</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    هل أنت متأكد من حذف المستخدم <span className="font-bold text-slate-800 dark:text-white">"{deleteConfirmation.userName}"</span>؟
                                    <br />
                                    <span className="text-red-500 text-sm">⚠️ لا يمكن التراجع عن هذا الإجراء.</span>
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-3 justify-center border-t border-slate-100 dark:bg-white/[0.03] dark:border-white/[0.08]">
                                <button 
                                    onClick={() => setDeleteConfirmation({ isOpen: false, userId: null, userName: '' })}
                                    className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-white/10"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="px-6 py-2 rounded-xl font-bold bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> نعم، حذف
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
