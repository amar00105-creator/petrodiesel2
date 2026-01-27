import React, { useState } from 'react';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Check, X, Shield, Plus, Trash2, Edit, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoleManager({ roles = [], onSave, onDelete }) {
    const [editingRole, setEditingRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Permission Dictionary
    // Categories: sales, purchases, inventory, finance, hr, settings, reports
    // Actions: view, create, edit, delete
    
    // Flattened list for Compact Grid
    const allPermissions = [
        { id: 'sales.view', label: 'عرض المبيعات' }, { id: 'sales.create', label: 'إضافة مبيعات' }, { id: 'sales.edit', label: 'تعديل المبيعات' }, { id: 'sales.delete', label: 'حذف المبيعات' },
        { id: 'purchases.view', label: 'عرض المشتريات' }, { id: 'purchases.create', label: 'إضافة مشتريات' }, { id: 'purchases.edit', label: 'تعديل المشتريات' }, { id: 'purchases.delete', label: 'حذف المشتريات' },
        { id: 'inventory.view', label: 'عرض المخزون' }, { id: 'inventory.create', label: 'إضافة مخزون' }, { id: 'inventory.edit', label: 'تعديل المخزون' }, { id: 'inventory.delete', label: 'حذف المخزون' },
        { id: 'finance.view', label: 'عرض المالية' }, { id: 'finance.create', label: 'إضافة مالية' }, { id: 'finance.edit', label: 'تعديل المالية' }, { id: 'finance.delete', label: 'حذف المالية' },
        { id: 'hr.view', label: 'عرض الموظفين' }, { id: 'hr.create', label: 'إضافة موظفين' }, { id: 'hr.edit', label: 'تعديل الموظفين' }, { id: 'hr.delete', label: 'حذف الموظفين' },
        { id: 'settings.view', label: 'عرض الإعدادات' }, { id: 'settings.edit', label: 'تعديل الإعدادات' },
        { id: 'reports.view', label: 'عرض التقارير' }, { id: 'reports.export', label: 'تصدير التقارير' }
    ];

    const handleEdit = (role) => {
        let permissions = [];
        try {
            permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
        } catch (e) {
            permissions = [];
        }
        
        const isSuper = permissions.includes('*');

        setEditingRole({
            ...role,
            _permissions: new Set(permissions),
            isSuper
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingRole({
            id: null,
            name: '',
            description: '',
            _permissions: new Set(),
            isSuper: false
        });
        setIsModalOpen(true);
    };

    const togglePermission = (permId) => {
        if (editingRole.isSuper) return;

        const newSet = new Set(editingRole._permissions);
        if (newSet.has(permId)) {
            newSet.delete(permId);
        } else {
            newSet.add(permId);
        }
        setEditingRole({ ...editingRole, _permissions: newSet });
    };

    const toggleSuperAdmin = () => {
        setEditingRole(prev => ({
            ...prev,
            isSuper: !prev.isSuper,
            _permissions: !prev.isSuper ? new Set(['*']) : new Set()
        }));
    };

    const saveRole = () => {
        if (!editingRole.name) {
            toast.error('اسم الدور مطلوب');
            return;
        }

        const permissionsArray = editingRole.isSuper ? ['*'] : Array.from(editingRole._permissions);
        
        onSave({
            id: editingRole.id,
            name: editingRole.name,
            description: editingRole.description,
            permissions: permissionsArray
        });
        setIsModalOpen(false);
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, roleId: null, roleName: '' });

    const handleRequestDelete = (role) => {
        setDeleteConfirmation({
            isOpen: true,
            roleId: role.id,
            roleName: role.name
        });
    };

    const confirmDelete = () => {
        if (onDelete && deleteConfirmation.roleId) {
            onDelete(deleteConfirmation.roleId);
            setDeleteConfirmation({ isOpen: false, roleId: null, roleName: '' });
            setIsModalOpen(false); // Also close edit modal if open
        }
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <Title>أدوار النظام والصلاحيات</Title>
                    <button 
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> دور جديد
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {roles.map(role => (
                        <div key={role.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Shield className={`w-5 h-5 ${role.is_system == 1 ? 'text-amber-500' : 'text-blue-500'}`} />
                                    <h3 className="font-bold text-lg text-slate-800">{role.name}</h3>
                                </div>
                                <div className="flex gap-2 opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(role)}
                                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="تعديل"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    {role.is_system != 1 && (
                                        <button 
                                            onClick={() => handleRequestDelete(role)}
                                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">
                                {role.description || 'لا يوجد وصف'}
                            </p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                                <Badge size="xs" color={role.is_system == 1 ? 'amber' : 'slate'}>
                                    {role.is_system == 1 ? 'نظام' : 'مخصص'}
                                </Badge>
                                <span className="text-xs text-slate-400 font-mono">ID: {role.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <Title>{editingRole.id ? 'تعديل الدور' : 'إنشاء دور جديد'}</Title>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">اسم الدور</label>
                                        <TextInput 
                                            value={editingRole.name} 
                                            onChange={(e) => setEditingRole({...editingRole, name: e.target.value})} 
                                            placeholder="مثال: مدير مبيعات" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">الوصف</label>
                                        <TextInput 
                                            value={editingRole.description} 
                                            onChange={(e) => setEditingRole({...editingRole, description: e.target.value})} 
                                            placeholder="وصف مختصر..." 
                                        />
                                    </div>
                                </div>

                                {/* Super Admin Toggle */}
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <Shield className="w-6 h-6 text-amber-600" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-900">صلاحيات كاملة (Super Admin)</h4>
                                        <p className="text-xs text-amber-700">منح هذا الدور جميع الصلاحيات في النظام دون استثناء.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={editingRole.isSuper} onChange={toggleSuperAdmin} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                {/* Compact Permission Grid */}
                                {!editingRole.isSuper && (
                                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-slate-500" /> تحديد الصلاحيات الدقيقة
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {allPermissions.map(perm => {
                                                const isChecked = editingRole._permissions.has(perm.id);
                                                return (
                                                    <div 
                                                        key={perm.id}
                                                        onClick={() => togglePermission(perm.id)}
                                                        className={`
                                                            cursor-pointer select-none px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all
                                                            ${isChecked 
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-white'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-white/20 border-transparent' : 'border-slate-300'}`}>
                                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        {perm.label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3">
                                <div>
                                    {editingRole.id && editingRole.is_system != 1 && (
                                        <button 
                                            onClick={() => handleRequestDelete(editingRole)}
                                            className="px-4 py-2 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" /> حذف الدور
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button 
                                        onClick={saveRole}
                                        className="px-8 py-2 rounded-xl font-bold bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Save className="w-5 h-5" /> حفظ الدور
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">حذف الدور</h3>
                                <p className="text-slate-500">
                                    هل أنت متأكد من حذف الدور <span className="font-bold text-slate-800">"{deleteConfirmation.roleName}"</span>؟
                                    <br />
                                    لا يمكن التراجع عن هذا الإجراء، وسيتم إزالة الصلاحيات من جميع المستخدمين المرتبطين به.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-3 justify-center border-t border-slate-100">
                                <button 
                                    onClick={() => setDeleteConfirmation({ isOpen: false, roleId: null, roleName: '' })}
                                    className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
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
