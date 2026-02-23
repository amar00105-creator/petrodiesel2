import React, { useState } from 'react';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Check, X, Shield, Plus, Trash2, Edit, Save, AlertCircle, ShieldCheck, CheckCheck, Eye, PenLine, FilePlus, Eraser, ChevronDown, ChevronUp, LayoutDashboard, ShoppingCart, Receipt, Gauge, Container, Landmark, Users, Handshake, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Permission Categories (10 Categories) ────────────────────────────────
const PERMISSION_CATEGORIES = [
    {
        id: 'dashboard',
        number: 1,
        label: 'لوحة التحكم',
        icon: LayoutDashboard,
        gradient: 'from-slate-600 to-slate-800',
        ring: 'ring-slate-200 dark:ring-slate-700',
        subSections: [
            {
                label: 'لوحة التحكم',
                permissions: [
                    { id: 'dashboard.view', label: 'عرض لوحة التحكم', icon: Eye },
                ]
            }
        ]
    },
    {
        id: 'purchases',
        number: 2,
        label: 'المشتريات',
        icon: ShoppingCart,
        gradient: 'from-blue-500 to-blue-700',
        ring: 'ring-blue-200 dark:ring-blue-800',
        subSections: [
            {
                label: 'إدارة المشتريات',
                permissions: [
                    { id: 'purchases.view', label: 'عرض المشتريات', icon: Eye },
                    { id: 'purchases.create', label: 'إضافة مشتريات', icon: FilePlus },
                    { id: 'purchases.edit', label: 'تعديل المشتريات', icon: PenLine },
                    { id: 'purchases.delete', label: 'حذف المشتريات', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'sales',
        number: 3,
        label: 'المبيعات',
        icon: Receipt,
        gradient: 'from-emerald-500 to-emerald-700',
        ring: 'ring-emerald-200 dark:ring-emerald-800',
        subSections: [
            {
                label: 'إدارة المبيعات',
                permissions: [
                    { id: 'sales.view', label: 'عرض المبيعات', icon: Eye },
                    { id: 'sales.create', label: 'إضافة مبيعات', icon: FilePlus },
                    { id: 'sales.edit', label: 'تعديل المبيعات', icon: PenLine },
                    { id: 'sales.delete', label: 'حذف المبيعات', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'pumps',
        number: 4,
        label: 'المكائن والعدادات',
        icon: Gauge,
        gradient: 'from-violet-500 to-violet-700',
        ring: 'ring-violet-200 dark:ring-violet-800',
        subSections: [
            {
                label: 'إدارة المكائن',
                permissions: [
                    { id: 'pumps.view', label: 'عرض المكائن', icon: Eye },
                    { id: 'pumps.create', label: 'إضافة مكائن', icon: FilePlus },
                    { id: 'pumps.edit', label: 'تعديل المكائن', icon: PenLine },
                    { id: 'pumps.delete', label: 'حذف المكائن', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'tanks',
        number: 5,
        label: 'الخزانات والمعايرة',
        icon: Container,
        gradient: 'from-amber-500 to-amber-700',
        ring: 'ring-amber-200 dark:ring-amber-800',
        subSections: [
            {
                label: 'الخزانات',
                permissions: [
                    { id: 'inventory.view', label: 'عرض الخزانات', icon: Eye },
                    { id: 'inventory.create', label: 'إضافة خزان', icon: FilePlus },
                    { id: 'inventory.edit', label: 'تعديل خزان', icon: PenLine },
                    { id: 'inventory.delete', label: 'حذف خزان', icon: Eraser },
                ]
            },
            {
                label: 'المعايرة',
                permissions: [
                    { id: 'calibration.view', label: 'عرض المعايرة', icon: Eye },
                    { id: 'calibration.create', label: 'إضافة معايرة', icon: FilePlus },
                    { id: 'calibration.edit', label: 'تعديل معايرة', icon: PenLine },
                    { id: 'calibration.delete', label: 'حذف معايرة', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'finance',
        number: 6,
        label: 'الحسابات المالية',
        icon: Landmark,
        gradient: 'from-cyan-500 to-cyan-700',
        ring: 'ring-cyan-200 dark:ring-cyan-800',
        subSections: [
            {
                label: 'الإيرادات والمعاملات',
                permissions: [
                    { id: 'finance.view', label: 'عرض المالية', icon: Eye },
                    { id: 'finance.create', label: 'إضافة إيراد / معاملة', icon: FilePlus },
                    { id: 'finance.edit', label: 'تعديل إيراد / معاملة', icon: PenLine },
                    { id: 'finance.delete', label: 'حذف إيراد / معاملة', icon: Eraser },
                ]
            },
            {
                label: 'المصروفات',
                permissions: [
                    { id: 'expenses.view', label: 'عرض المصروفات', icon: Eye },
                    { id: 'expenses.create', label: 'تسجيل مصروف', icon: FilePlus },
                    { id: 'expenses.edit', label: 'تعديل مصروف', icon: PenLine },
                    { id: 'expenses.delete', label: 'حذف مصروف', icon: Eraser },
                ]
            },
            {
                label: 'الخزن النقدية',
                permissions: [
                    { id: 'safes.view', label: 'عرض الخزن', icon: Eye },
                    { id: 'safes.create', label: 'إضافة خزنة', icon: FilePlus },
                    { id: 'safes.edit', label: 'تعديل خزنة', icon: PenLine },
                    { id: 'safes.delete', label: 'حذف خزنة', icon: Eraser },
                ]
            },
            {
                label: 'البنوك',
                permissions: [
                    { id: 'banks.view', label: 'عرض البنوك', icon: Eye },
                    { id: 'banks.create', label: 'إضافة بنك', icon: FilePlus },
                    { id: 'banks.edit', label: 'تعديل بنك', icon: PenLine },
                    { id: 'banks.delete', label: 'حذف بنك', icon: Eraser },
                ]
            },
            {
                label: 'التحويلات',
                permissions: [
                    { id: 'transfers.view', label: 'عرض التحويلات', icon: Eye },
                    { id: 'transfers.create', label: 'إضافة تحويل', icon: FilePlus },
                    { id: 'transfers.edit', label: 'تعديل تحويل', icon: PenLine },
                    { id: 'transfers.delete', label: 'حذف تحويل', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'hr',
        number: 7,
        label: 'الموارد البشرية',
        icon: Users,
        gradient: 'from-indigo-500 to-indigo-700',
        ring: 'ring-indigo-200 dark:ring-indigo-800',
        subSections: [
            {
                label: 'الموظفين',
                permissions: [
                    { id: 'hr.view', label: 'عرض الموظفين', icon: Eye },
                    { id: 'hr.create', label: 'إضافة موظف', icon: FilePlus },
                    { id: 'hr.edit', label: 'تعديل موظف', icon: PenLine },
                    { id: 'hr.delete', label: 'حذف موظف', icon: Eraser },
                ]
            },
            {
                label: 'العمال',
                permissions: [
                    { id: 'workers.view', label: 'عرض العمال', icon: Eye },
                    { id: 'workers.create', label: 'إضافة عامل', icon: FilePlus },
                    { id: 'workers.edit', label: 'تعديل عامل', icon: PenLine },
                    { id: 'workers.delete', label: 'حذف عامل', icon: Eraser },
                ]
            },
            {
                label: 'السائقين',
                permissions: [
                    { id: 'drivers.view', label: 'عرض السائقين', icon: Eye },
                    { id: 'drivers.create', label: 'إضافة سائق', icon: FilePlus },
                    { id: 'drivers.edit', label: 'تعديل سائق', icon: PenLine },
                    { id: 'drivers.delete', label: 'حذف سائق', icon: Eraser },
                ]
            },
            {
                label: 'الرواتب',
                permissions: [
                    { id: 'payroll.view', label: 'عرض الرواتب', icon: Eye },
                    { id: 'payroll.create', label: 'إضافة راتب', icon: FilePlus },
                    { id: 'payroll.edit', label: 'تعديل راتب', icon: PenLine },
                    { id: 'payroll.delete', label: 'حذف راتب', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'partners',
        number: 8,
        label: 'الموردين والعملاء',
        icon: Handshake,
        gradient: 'from-teal-500 to-teal-700',
        ring: 'ring-teal-200 dark:ring-teal-800',
        subSections: [
            {
                label: 'الموردين',
                permissions: [
                    { id: 'suppliers.view', label: 'عرض الموردين', icon: Eye },
                    { id: 'suppliers.create', label: 'إضافة مورد', icon: FilePlus },
                    { id: 'suppliers.edit', label: 'تعديل مورد', icon: PenLine },
                    { id: 'suppliers.delete', label: 'حذف مورد', icon: Eraser },
                ]
            },
            {
                label: 'العملاء',
                permissions: [
                    { id: 'customers.view', label: 'عرض العملاء', icon: Eye },
                    { id: 'customers.create', label: 'إضافة عميل', icon: FilePlus },
                    { id: 'customers.edit', label: 'تعديل عميل', icon: PenLine },
                    { id: 'customers.delete', label: 'حذف عميل', icon: Eraser },
                ]
            }
        ]
    },
    {
        id: 'reports',
        number: 9,
        label: 'التقارير',
        icon: BarChart3,
        gradient: 'from-sky-500 to-sky-700',
        ring: 'ring-sky-200 dark:ring-sky-800',
        subSections: [
            {
                label: 'أقسام التقارير',
                permissions: [
                    { id: 'reports.financial', label: 'التقارير المالية', icon: Eye },
                    { id: 'reports.inventory', label: 'تقارير المستودعات', icon: Eye },
                    { id: 'reports.sales', label: 'تقارير المبيعات', icon: Eye },
                    { id: 'reports.hr', label: 'تقارير الموظفين', icon: Eye },
                    { id: 'reports.closing', label: 'تقفيل اليوم', icon: Eye },
                    { id: 'reports.supplier', label: 'تقرير مورد', icon: Eye },
                    { id: 'reports.customer', label: 'تقرير عميل', icon: Eye },
                ]
            }
        ]
    },
    {
        id: 'settings',
        number: 10,
        label: 'إعدادات النظام',
        icon: SettingsIcon,
        gradient: 'from-rose-500 to-rose-700',
        ring: 'ring-rose-200 dark:ring-rose-800',
        subSections: [
            {
                label: 'الإعدادات العامة',
                permissions: [
                    { id: 'settings.general.view', label: 'عرض الإعدادات العامة', icon: Eye },
                    { id: 'settings.general.edit', label: 'تعديل الإعدادات العامة', icon: PenLine },
                ]
            },
            {
                label: 'إدارة المحطات',
                permissions: [
                    { id: 'settings.stations.view', label: 'عرض المحطات', icon: Eye },
                    { id: 'settings.stations.edit', label: 'تعديل المحطات', icon: PenLine },
                    { id: 'stations.create', label: 'إضافة محطة', icon: FilePlus },
                    { id: 'stations.delete', label: 'حذف محطة', icon: Eraser },
                ]
            },
            {
                label: 'الوقود والأسعار',
                permissions: [
                    { id: 'settings.fuel.view', label: 'عرض الوقود والأسعار', icon: Eye },
                    { id: 'settings.fuel.edit', label: 'تعديل الوقود والأسعار', icon: PenLine },
                ]
            },
            {
                label: 'الصلاحيات والأمان',
                permissions: [
                    { id: 'settings.security.view', label: 'عرض الصلاحيات', icon: Eye },
                    { id: 'settings.security.edit', label: 'تعديل الصلاحيات', icon: PenLine },
                    { id: 'roles.view', label: 'عرض الأدوار', icon: Eye },
                    { id: 'roles.create', label: 'إنشاء دور', icon: FilePlus },
                    { id: 'roles.edit', label: 'تعديل دور', icon: PenLine },
                    { id: 'roles.delete', label: 'حذف دور', icon: Eraser },
                    { id: 'users.view', label: 'عرض المستخدمين', icon: Eye },
                    { id: 'users.create', label: 'إنشاء مستخدم', icon: FilePlus },
                    { id: 'users.edit', label: 'تعديل مستخدم', icon: PenLine },
                    { id: 'users.delete', label: 'حذف مستخدم', icon: Eraser },
                ]
            },
            {
                label: 'سجل العمليات',
                permissions: [
                    { id: 'settings.activity.view', label: 'عرض سجل العمليات', icon: Eye },
                ]
            },
            {
                label: 'التنبيهات',
                permissions: [
                    { id: 'settings.alerts.view', label: 'عرض التنبيهات', icon: Eye },
                    { id: 'settings.alerts.edit', label: 'تعديل التنبيهات', icon: PenLine },
                ]
            },
            {
                label: 'الذكاء الاصطناعي',
                permissions: [
                    { id: 'settings.ai.view', label: 'عرض إعدادات AI', icon: Eye },
                    { id: 'settings.ai.edit', label: 'تعديل إعدادات AI', icon: PenLine },
                ]
            },
            {
                label: 'النسخ الاحتياطي',
                permissions: [
                    { id: 'settings.backup.view', label: 'عرض النسخ الاحتياطي', icon: Eye },
                    { id: 'settings.backup.create', label: 'إنشاء / استعادة نسخة', icon: FilePlus },
                ]
            }
        ]
    },
];

// Flatten all permissions for counting
const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.subSections.flatMap(s => s.permissions));

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

    // Filter roles: Hide system roles from non-super-admins
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

    const getCategoryPermissions = (category) => {
        return category.subSections.flatMap(s => s.permissions);
    };

    const toggleCategoryPermissions = (category) => {
        if (editingRole.isSuper) return;
        const catPerms = getCategoryPermissions(category);
        const allSelected = catPerms.every(p => editingRole._permissions.has(p.id));
        const newSet = new Set(editingRole._permissions);

        if (allSelected) {
            catPerms.forEach(p => newSet.delete(p.id));
        } else {
            catPerms.forEach(p => newSet.add(p.id));
        }
        setEditingRole({ ...editingRole, _permissions: newSet });
    };

    const toggleSubSectionPermissions = (subSection) => {
        if (editingRole.isSuper) return;
        const perms = subSection.permissions;
        const allSelected = perms.every(p => editingRole._permissions.has(p.id));
        const newSet = new Set(editingRole._permissions);

        if (allSelected) {
            perms.forEach(p => newSet.delete(p.id));
        } else {
            perms.forEach(p => newSet.add(p.id));
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
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <Title className="dark:text-white">أدوار النظام والصلاحيات</Title>
                            <Text className="text-xs dark:text-slate-400">{ALL_PERMISSIONS.length} صلاحية عبر {PERMISSION_CATEGORIES.length} فئة</Text>
                        </div>
                        <Badge color="blue">{visibleRoles.length} دور</Badge>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" /> دور جديد
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {visibleRoles.map(role => {
                        const permCount = getPermissionCount(role);
                        let permissions = [];
                        try { permissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions; } catch(e) {}
                        const isSuper = permissions.includes('*');
                        const pct = isSuper ? 100 : Math.round((permCount / ALL_PERMISSIONS.length) * 100);

                        return (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative p-5 border rounded-2xl hover:shadow-lg transition-all duration-300 bg-white dark:bg-white/[0.04] dark:border-white/[0.1] dark:hover:border-emerald-500/30 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:backdrop-blur-xl"
                                style={{ borderColor: isSuper ? 'rgb(245, 158, 11)' : undefined }}
                            >
                                {/* Top accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${isSuper ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} />

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-2 rounded-xl ${isSuper ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                                            <Shield className={`w-5 h-5 ${isSuper ? 'text-amber-600' : role.is_system == 1 ? 'text-amber-500' : 'text-blue-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">{role.name}</h3>
                                            <span className="text-[10px] text-slate-400 font-mono">ID: {role.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleEdit(role)}
                                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
                                            title="تعديل"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        {role.is_system != 1 && (
                                            <button
                                                onClick={() => handleRequestDelete(role)}
                                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/40"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500 mb-4 h-8 line-clamp-2 dark:text-slate-400">
                                    {role.description || 'لا يوجد وصف'}
                                </p>

                                {/* Permission Progress */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                            {isSuper ? '✨ صلاحيات كاملة' : `${permCount} / ${ALL_PERMISSIONS.length} صلاحية`}
                                        </span>
                                        <span className={`text-[10px] font-bold ${pct === 100 ? 'text-amber-600' : pct > 50 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {pct}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${isSuper ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-50 dark:border-white/[0.06] flex justify-between items-center">
                                    <Badge size="xs" color={role.is_system == 1 ? 'amber' : 'slate'}>
                                        {role.is_system == 1 ? 'نظام' : 'مخصص'}
                                    </Badge>
                                    {isSuper && <Badge size="xs" color="amber">Super Admin</Badge>}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Card>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col dark:bg-slate-900 dark:border dark:border-white/10 dark:text-white"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-white/[0.04] dark:to-blue-900/10 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                                            {editingRole.id ? 'تعديل الدور' : 'إنشاء دور جديد'}
                                        </h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {editingRole.isSuper
                                                ? `✨ صلاحيات كاملة (${ALL_PERMISSIONS.length} صلاحية)`
                                                : `${editingRole._permissions.size} / ${ALL_PERMISSIONS.length} صلاحية محددة`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                {/* Name & Description */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 dark:text-slate-300 text-right">اسم الدور *</label>
                                        <TextInput
                                            value={editingRole.name}
                                            onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                                            placeholder="مثال: مدير مبيعات"
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 dark:text-slate-300 text-right">وصف الدور</label>
                                        <TextInput
                                            value={editingRole.description}
                                            onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                                            placeholder="وصف مختصر..."
                                            className="text-right dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Super Admin Toggle */}
                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-500/20">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">صلاحيات كاملة (Super Admin)</h4>
                                        <p className="text-[11px] text-amber-700 dark:text-amber-400/80">منح جميع الصلاحيات في النظام دون استثناء</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={editingRole.isSuper} onChange={toggleSuperAdmin} />
                                        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 dark:bg-slate-700"></div>
                                    </label>
                                </div>

                                {/* Permissions Grid */}
                                {!editingRole.isSuper && (
                                    <div className="space-y-4">
                                        {/* Global Controls */}
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-700 flex items-center gap-2 dark:text-slate-300 text-sm">
                                                <ShieldCheck className="w-4 h-4 text-slate-500" />
                                                تحديد الصلاحيات
                                                <Badge size="xs" color="blue">{editingRole._permissions.size} / {ALL_PERMISSIONS.length}</Badge>
                                            </h4>
                                            <button
                                                onClick={toggleAllPermissions}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                                                    ALL_PERMISSIONS.every(p => editingRole._permissions.has(p.id))
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                                                }`}
                                            >
                                                <CheckCheck className="w-4 h-4" />
                                                {ALL_PERMISSIONS.every(p => editingRole._permissions.has(p.id)) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                                            </button>
                                        </div>

                                        {/* Category Panels */}
                                        <div className="space-y-3">
                                            {PERMISSION_CATEGORIES.map(category => {
                                                const catPerms = getCategoryPermissions(category);
                                                const selectedCount = catPerms.filter(p => editingRole._permissions.has(p.id)).length;
                                                const allSelected = selectedCount === catPerms.length;
                                                const someSelected = selectedCount > 0 && !allSelected;
                                                const isCollapsed = collapsedCategories[category.id];
                                                const CatIcon = category.icon;

                                                return (
                                                    <div
                                                        key={category.id}
                                                        className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                                                            allSelected
                                                                ? 'border-emerald-300 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/30'
                                                                : someSelected
                                                                    ? 'border-blue-200 dark:border-blue-500/20'
                                                                    : 'border-slate-200 dark:border-white/[0.1]'
                                                        }`}
                                                    >
                                                        {/* Category Header */}
                                                        <div className={`flex items-center justify-between px-4 py-3 transition-all ${
                                                            allSelected
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/10'
                                                                : someSelected
                                                                    ? 'bg-blue-50/50 dark:bg-blue-900/5'
                                                                    : 'bg-slate-50/80 dark:bg-white/[0.03]'
                                                        }`}>
                                                            <button
                                                                onClick={() => toggleCategoryCollapse(category.id)}
                                                                className="flex items-center gap-3 flex-1"
                                                            >
                                                                {/* Number badge */}
                                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-sm`}>
                                                                    <span className="text-white text-xs font-bold">{category.number}</span>
                                                                </div>

                                                                <CatIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{category.label}</span>

                                                                <div className="flex items-center gap-2 mr-auto">
                                                                    <Badge size="xs" color={allSelected ? 'emerald' : someSelected ? 'blue' : 'slate'}>
                                                                        {selectedCount}/{catPerms.length}
                                                                    </Badge>
                                                                    {isCollapsed
                                                                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                                                                        : <ChevronUp className="w-4 h-4 text-slate-400" />
                                                                    }
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={() => toggleCategoryPermissions(category)}
                                                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                                                    allSelected
                                                                        ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                                                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                }`}
                                                                title={allSelected ? 'إلغاء تحديد الفئة' : 'تحديد كل الفئة'}
                                                            >
                                                                <CheckCheck className="w-3 h-3" />
                                                                <span className="hidden sm:inline">{allSelected ? 'إلغاء' : 'تحديد الكل'}</span>
                                                            </button>
                                                        </div>

                                                        {/* Category Body with Sub-sections */}
                                                        <AnimatePresence initial={false}>
                                                            {!isCollapsed && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-3 space-y-3">
                                                                        {category.subSections.map((subSection, sIdx) => {
                                                                            const subPerms = subSection.permissions;
                                                                            const subSelectedCount = subPerms.filter(p => editingRole._permissions.has(p.id)).length;
                                                                            const subAllSelected = subSelectedCount === subPerms.length;

                                                                            return (
                                                                                <div key={sIdx}>
                                                                                    {/* Sub-section header (only if more than 1 sub-section) */}
                                                                                    {category.subSections.length > 1 && (
                                                                                        <div className="flex items-center justify-between mb-2 px-1">
                                                                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                                                {subSection.label}
                                                                                                <span className="text-[9px] text-slate-400">({subSelectedCount}/{subPerms.length})</span>
                                                                                            </span>
                                                                                            <button
                                                                                                onClick={() => toggleSubSectionPermissions(subSection)}
                                                                                                className="text-[9px] font-bold text-blue-500 hover:text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                                                            >
                                                                                                {subAllSelected ? 'إلغاء' : 'تحديد الكل'}
                                                                                            </button>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Permission chips */}
                                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                                                                                        {subPerms.map(perm => {
                                                                                            const isChecked = editingRole._permissions.has(perm.id);
                                                                                            const PermIcon = perm.icon;
                                                                                            return (
                                                                                                <div
                                                                                                    key={perm.id}
                                                                                                    onClick={() => togglePermission(perm.id)}
                                                                                                    className={`
                                                                                                        cursor-pointer select-none px-2.5 py-2 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all duration-150
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

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between gap-3 dark:bg-white/[0.03] dark:border-white/10">
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
                                        className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-white/10"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={saveRole}
                                        className="px-8 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 hover:shadow-xl hover:shadow-blue-500/20"
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
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-slate-900 dark:border dark:border-white/[0.12]"
                        >
                            <div className="p-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center dark:bg-red-900/30">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">حذف الدور</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    هل أنت متأكد من حذف الدور <span className="font-bold text-slate-800 dark:text-white">"{deleteConfirmation.roleName}"</span>؟
                                    <br />
                                    <span className="text-red-500 text-xs">لا يمكن التراجع عن هذا الإجراء</span>
                                </p>
                            </div>
                            <div className="p-5 bg-slate-50 flex gap-3 justify-center border-t border-slate-100 dark:bg-white/[0.03] dark:border-white/[0.08]">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, roleId: null, roleName: '' })}
                                    className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors dark:text-slate-400 dark:hover:bg-white/10"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-2.5 rounded-xl font-bold bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
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
