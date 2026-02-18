import React, { useState } from 'react';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Check, X, Shield, Plus, Trash2, Edit, Save, AlertCircle, ShieldCheck, CheckCheck, Eye, PenLine, FilePlus, Eraser, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Permission Categories ────────────────────────────────────────
const PERMISSION_CATEGORIES = [
    {
        id: 'sales',
        label: 'المبيعات',
        icon: '💰',
        color: 'emerald',
        permissions: [
            { id: 'sales.view', label: 'عرض المبيعات', icon: Eye },
            { id: 'sales.create', label: 'إضافة مبيعات', icon: FilePlus },
            { id: 'sales.edit', label: 'تعديل المبيعات', icon: PenLine },
            { id: 'sales.delete', label: 'حذف المبيعات', icon: Eraser },
        ]
    },
    {
        id: 'purchases',
        label: 'المشتريات',
        icon: '🛒',
        color: 'blue',
        permissions: [
            { id: 'purchases.view', label: 'عرض المشتريات', icon: Eye },
            { id: 'purchases.create', label: 'إضافة مشتريات', icon: FilePlus },
            { id: 'purchases.edit', label: 'تعديل المشتريات', icon: PenLine },
            { id: 'purchases.delete', label: 'حذف المشتريات', icon: Eraser },
        ]
    },
    {
        id: 'inventory',
        label: 'المخزون والخزانات',
        icon: '🏗️',
        color: 'amber',
        permissions: [
            { id: 'inventory.view', label: 'عرض المخزون', icon: Eye },
            { id: 'inventory.create', label: 'إضافة مخزون', icon: FilePlus },
            { id: 'inventory.edit', label: 'تعديل المخزون', icon: PenLine },
            { id: 'inventory.delete', label: 'حذف المخزون', icon: Eraser },
        ]
    },
    {
        id: 'pumps',
        label: 'المكائن والعدادات',
        icon: '⛽',
        color: 'violet',
        permissions: [
            { id: 'pumps.view', label: 'عرض المكائن', icon: Eye },
            { id: 'pumps.create', label: 'إضافة مكائن', icon: FilePlus },
            { id: 'pumps.edit', label: 'تعديل المكائن', icon: PenLine },
            { id: 'pumps.delete', label: 'حذف المكائن', icon: Eraser },
        ]
    },
    {
        id: 'finance',
        label: 'المالية (الخزن والبنوك)',
        icon: '🏦',
        color: 'cyan',
        permissions: [
            { id: 'finance.view', label: 'عرض المالية', icon: Eye },
            { id: 'finance.create', label: 'إضافة معاملات مالية', icon: FilePlus },
            { id: 'finance.edit', label: 'تعديل المالية', icon: PenLine },
            { id: 'finance.delete', label: 'حذف المالية', icon: Eraser },
        ]
    },
    {
        id: 'expenses',
        label: 'المصروفات',
        icon: '📋',
        color: 'rose',
        permissions: [
            { id: 'expenses.view', label: 'عرض المصروفات', icon: Eye },
            { id: 'expenses.create', label: 'إضافة مصروفات', icon: FilePlus },
            { id: 'expenses.edit', label: 'تعديل المصروفات', icon: PenLine },
            { id: 'expenses.delete', label: 'حذف المصروفات', icon: Eraser },
        ]
    },
    {
        id: 'hr',
        label: 'الموظفين والموارد البشرية',
        icon: '👥',
        color: 'indigo',
        permissions: [
            { id: 'hr.view', label: 'عرض الموظفين', icon: Eye },
            { id: 'hr.create', label: 'إضافة موظفين', icon: FilePlus },
            { id: 'hr.edit', label: 'تعديل الموظفين', icon: PenLine },
            { id: 'hr.delete', label: 'حذف الموظفين', icon: Eraser },
        ]
    },
    {
        id: 'suppliers',
        label: 'الموردين والعملاء',
        icon: '🤝',
        color: 'teal',
        permissions: [
            { id: 'suppliers.view', label: 'عرض الموردين', icon: Eye },
            { id: 'suppliers.create', label: 'إضافة موردين', icon: FilePlus },
            { id: 'suppliers.edit', label: 'تعديل الموردين', icon: PenLine },
            { id: 'suppliers.delete', label: 'حذف الموردين', icon: Eraser },
        ]
    },
    {
        id: 'settings',
        label: 'الإعدادات',
        icon: '⚙️',
        color: 'slate',
        permissions: [
            { id: 'settings.view', label: 'الوصول للإعدادات', icon: Eye },
            { id: 'settings.edit', label: 'تعديل الإعدادات العامة', icon: PenLine },
            { id: 'settings.general', label: 'تبويب: عام', icon: Eye },
            { id: 'settings.stations', label: 'تبويب: إدارة المحطات', icon: Eye },
            { id: 'settings.fuel', label: 'تبويب: الوقود والأسعار', icon: Eye },
            { id: 'settings.security', label: 'تبويب: الصلاحيات والأمان', icon: Eye },
            { id: 'settings.activity', label: 'تبويب: سجل العمليات', icon: Eye },
            { id: 'settings.backup', label: 'تبويب: النسخ الاحتياطي', icon: Eye },
        ]
    },
    {
        id: 'reports',
        label: 'التقارير ولوحة التحكم',
        icon: '📊',
        color: 'cyan',
        permissions: [
            { id: 'dashboard.view', label: 'عرض لوحة التحكم', icon: Eye },
            { id: 'reports.view', label: 'عرض التقارير', icon: Eye },
            { id: 'reports.export', label: 'تصدير التقارير', icon: FilePlus },
            { id: 'stations.view', label: 'عرض المحطات', icon: Eye },
            { id: 'stations.edit', label: 'تعديل المحطات', icon: PenLine },
        ]
    },
    {
        id: 'security',
        label: 'الصلاحيات والأمان',
        icon: '🔒',
        color: 'red',
        permissions: [
            { id: 'roles.view', label: 'عرض الأدوار', icon: Eye },
            { id: 'roles.create', label: 'إنشاء دور جديد', icon: FilePlus },
            { id: 'roles.edit', label: 'تعديل الأدوار', icon: PenLine },
            { id: 'roles.delete', label: 'حذف الأدوار', icon: Eraser },
            { id: 'users.view', label: 'عرض المستخدمين', icon: Eye },
            { id: 'users.create', label: 'إنشاء مستخدم', icon: FilePlus },
            { id: 'users.edit', label: 'تعديل المستخدمين', icon: PenLine },
            { id: 'users.delete', label: 'حذف المستخدمين', icon: Eraser },
        ]
    },

];

// Flatten all permissions for counting
const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.permissions);

export default function RoleManager({ roles = [], onSave, onDelete }) {
    const [editingRole, setEditingRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collapsedCategories, setCollapsedCategories] = useState({});

    // Determine Super Admin status from context or DOM
    let isSuperAdmin = false;
    try {
        const userData = document.getElementById('root')?.dataset?.user;
        if (userData) {
            const user = JSON.parse(userData);
            isSuperAdmin = user.role === 'super_admin';
        }
    } catch (e) {
        console.error("Failed to parse user data", e);
    }

    // Filter roles: Hide 'Accountant', 'Admin', 'Staff' from non-super-admins
    const visibleRoles = isSuperAdmin ? roles : roles.filter(r => {
        const name = r.name?.toLowerCase() || '';
        return !['accountant', 'admin', 'staff', 'administrator', 'manager'].some(restricted => name.includes(restricted));
    });

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
        setCollapsedCategories({});
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
        setCollapsedCategories({});
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

    const toggleAllPermissions = () => {
        if (editingRole.isSuper) return;
        const allSelected = ALL_PERMISSIONS.every(p => editingRole._permissions.has(p.id));
        if (allSelected) {
            setEditingRole({ ...editingRole, _permissions: new Set() });
        } else {
            const newSet = new Set(ALL_PERMISSIONS.map(p => p.id));
            setEditingRole({ ...editingRole, _permissions: newSet });
        }
    };

    const toggleCategoryPermissions = (category) => {
        if (editingRole.isSuper) return;
        const categoryPerms = category.permissions;
        const allSelected = categoryPerms.every(p => editingRole._permissions.has(p.id));
        const newSet = new Set(editingRole._permissions);
        
        if (allSelected) {
            categoryPerms.forEach(p => newSet.delete(p.id));
        } else {
            categoryPerms.forEach(p => newSet.add(p.id));
        }
        setEditingRole({ ...editingRole, _permissions: newSet });
    };

    const toggleCategoryCollapse = (catId) => {
        setCollapsedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
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
            setIsModalOpen(false);
        }
    };

    // Helper: count permissions for a role
    const getPermissionCount = (role) => {
        let permissions = [];
        try {
            permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
        } catch (e) { return 0; }
        if (permissions.includes('*')) return ALL_PERMISSIONS.length;
        return permissions.filter(p => ALL_PERMISSIONS.some(ap => ap.id === p)).length;
    };

    return (
        <div className="space-y-6">
            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.12] dark:ring-0 dark:shadow-[0_0_30px_rgba(16,185,129,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Title>أدوار النظام والصلاحيات</Title>
                        <Badge color="blue">{visibleRoles.length} دور</Badge>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" /> دور جديد
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {visibleRoles.map(role => {
                        const permCount = getPermissionCount(role);
                        let permissions = [];
                        try { permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions; } catch(e) {}
                        const isSuper = permissions.includes('*');

                        return (
                            <div key={role.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all bg-white relative group dark:bg-white/[0.04] dark:border-white/[0.1] dark:hover:border-emerald-500/30 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:backdrop-blur-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Shield className={`w-5 h-5 ${role.is_system == 1 ? 'text-amber-500' : 'text-blue-500'}`} />
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{role.name}</h3>
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
                                <p className="text-sm text-slate-500 mb-3 h-10 line-clamp-2 dark:text-slate-400">
                                    {role.description || 'لا يوجد وصف'}
                                </p>
                                {/* Permission Count Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                            {isSuper ? 'صلاحيات كاملة' : `${permCount} / ${ALL_PERMISSIONS.length} صلاحية`}
                                        </span>
                                        {isSuper && <Badge size="xs" color="amber">Super Admin</Badge>}
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            className={`h-full rounded-full ${isSuper ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${isSuper ? 100 : (permCount / ALL_PERMISSIONS.length) * 100}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-white/[0.06]">
                                    <Badge size="xs" color={role.is_system == 1 ? 'amber' : 'slate'}>
                                        {role.is_system == 1 ? 'نظام' : 'مخصص'}
                                    </Badge>
                                    <span className="text-xs text-slate-400 font-mono">ID: {role.id}</span>
                                </div>
                            </div>
                        );
                    })}
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col dark:bg-slate-900 dark:border dark:border-white/10 dark:text-white"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-white/5 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <Title className="dark:text-white">{editingRole.id ? 'تعديل الدور' : 'إنشاء دور جديد'}</Title>
                                        <Text className="text-xs dark:text-slate-400">تحديد الاسم والوصف والصلاحيات</Text>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">اسم الدور</label>
                                        <TextInput 
                                            value={editingRole.name} 
                                            onChange={(e) => setEditingRole({...editingRole, name: e.target.value})} 
                                            placeholder="مثال: مدير مبيعات" 
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300 text-right">الوصف</label>
                                        <TextInput 
                                            value={editingRole.description} 
                                            onChange={(e) => setEditingRole({...editingRole, description: e.target.value})} 
                                            placeholder="وصف مختصر..." 
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Super Admin Toggle */}
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 dark:bg-amber-900/10 dark:border-amber-500/20">
                                    <Shield className="w-6 h-6 text-amber-600" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-900 dark:text-amber-300">صلاحيات كاملة (Super Admin)</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-400/80">منح هذا الدور جميع الصلاحيات في النظام دون استثناء.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={editingRole.isSuper} onChange={toggleSuperAdmin} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                {/* Categorized Permission Grid */}
                                {!editingRole.isSuper && (
                                    <div className="space-y-3">
                                        {/* Global Controls */}
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="font-bold text-slate-700 flex items-center gap-2 dark:text-slate-300">
                                                <ShieldCheck className="w-5 h-5 text-slate-500" /> تحديد الصلاحيات الدقيقة
                                                <Badge size="xs" color="blue">{editingRole._permissions.size} / {ALL_PERMISSIONS.length}</Badge>
                                            </h4>
                                            <button
                                                onClick={toggleAllPermissions}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                                                    ALL_PERMISSIONS.every(p => editingRole._permissions.has(p.id))
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-800/30'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:border-emerald-800/30'
                                                }`}
                                            >
                                                <CheckCheck className="w-4 h-4" />
                                                {ALL_PERMISSIONS.every(p => editingRole._permissions.has(p.id)) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                                            </button>
                                        </div>

                                        {/* Category Groups */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {PERMISSION_CATEGORIES.map(category => {
                                                const catPerms = category.permissions;
                                                const selectedCount = catPerms.filter(p => editingRole._permissions.has(p.id)).length;
                                                const allSelected = selectedCount === catPerms.length;
                                                const someSelected = selectedCount > 0 && !allSelected;
                                                const isCollapsed = collapsedCategories[category.id];

                                                return (
                                                    <div 
                                                        key={category.id}
                                                        className={`border rounded-xl overflow-hidden transition-all ${
                                                            allSelected 
                                                                ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-500/30 dark:bg-emerald-900/10' 
                                                                : someSelected
                                                                    ? 'border-blue-200 bg-blue-50/20 dark:border-blue-500/20 dark:bg-blue-900/5'
                                                                    : 'border-slate-200 bg-white dark:border-white/[0.1] dark:bg-white/[0.02]'
                                                        }`}
                                                    >
                                                        {/* Category Header */}
                                                        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50/80 dark:bg-white/[0.04] border-b border-slate-100 dark:border-white/[0.06]">
                                                            <button 
                                                                onClick={() => toggleCategoryCollapse(category.id)}
                                                                className="flex items-center gap-2 flex-1 text-right"
                                                            >
                                                                <span className="text-base">{category.icon}</span>
                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{category.label}</span>
                                                                <Badge size="xs" color={allSelected ? 'emerald' : someSelected ? 'blue' : 'slate'}>
                                                                    {selectedCount}/{catPerms.length}
                                                                </Badge>
                                                                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-auto" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400 mr-auto" />}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleCategoryPermissions(category)}
                                                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                                                    allSelected
                                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                }`}
                                                                title={allSelected ? 'إلغاء تحديد الفئة' : 'تحديد كل الفئة'}
                                                            >
                                                                <CheckCheck className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Category Permissions */}
                                                        <AnimatePresence initial={false}>
                                                            {!isCollapsed && (
                                                                <motion.div 
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-2 grid grid-cols-2 gap-1.5">
                                                                        {catPerms.map(perm => {
                                                                            const isChecked = editingRole._permissions.has(perm.id);
                                                                            const PermIcon = perm.icon;
                                                                            return (
                                                                                <div 
                                                                                    key={perm.id}
                                                                                    onClick={() => togglePermission(perm.id)}
                                                                                    className={`
                                                                                        cursor-pointer select-none px-2.5 py-2 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all
                                                                                        ${isChecked 
                                                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm dark:bg-emerald-600 dark:border-emerald-600 dark:shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                                                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50 dark:bg-white/[0.04] dark:border-white/[0.1] dark:text-slate-300 dark:hover:border-emerald-500/30'
                                                                                        }
                                                                                    `}
                                                                                >
                                                                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-white/20 border-transparent' : 'border-slate-300 dark:border-slate-600'}`}>
                                                                                        {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                                                                                    </div>
                                                                                    <PermIcon className={`w-3 h-3 flex-shrink-0 ${isChecked ? 'text-white/80' : 'text-slate-400'}`} />
                                                                                    <span className="truncate">{perm.label}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between gap-3 dark:bg-white/5 dark:border-white/10">
                                <div>
                                    {editingRole.id && editingRole.is_system != 1 && (
                                        <button 
                                            onClick={() => handleRequestDelete(editingRole)}
                                            className="px-4 py-2 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" /> حذف الدور
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden dark:bg-slate-900 dark:border dark:border-white/[0.12] dark:shadow-[0_0_40px_rgba(0,0,0,0.4)]"
                        >
                            <div className="p-6 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center dark:bg-red-900/30">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">حذف الدور</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    هل أنت متأكد من حذف الدور <span className="font-bold text-slate-800 dark:text-white">"{deleteConfirmation.roleName}"</span>؟
                                    <br />
                                    لا يمكن التراجع عن هذا الإجراء، وسيتم إزالة الصلاحيات من جميع المستخدمين المرتبطين به.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-3 justify-center border-t border-slate-100 dark:bg-white/[0.03] dark:border-white/[0.08]">
                                <button 
                                    onClick={() => setDeleteConfirmation({ isOpen: false, roleId: null, roleName: '' })}
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
