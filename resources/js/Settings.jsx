import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, TextInput, Select, SelectItem, Switch, Tab, TabGroup, TabList, Badge } from '@tremor/react';
import { Settings as SettingsIcon, Fuel, Bell, Shield, Save, Globe, Server, UserCog, Database, Download, Upload, Plus, Trash2, Edit, Building2, Activity, DollarSign, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import StationList from './StationList';
import RoleManager from './components/RoleManager';
import UserManager from './components/UserManager';
import ActivityLogPanel from './components/ActivityLogPanel';
import AlertSettingsPanel from './components/AlertSettingsPanel';

export default function Settings({ general = {}, fuel = {}, alerts = {}, roles = [], fuelTypes = [], stations = [], users = [], isSuperAdmin = false, userPermissions = [] }) {
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(() => {
        const saved = localStorage.getItem('settings_active_tab');
        return saved ? parseInt(saved, 10) : 0;
    });
    const tabRefs = useRef([]);

    useEffect(() => {
        localStorage.setItem('settings_active_tab', selectedTab);
    }, [selectedTab]);

    const settingsTabs = [
        { id: 'general', label: 'عام', icon: SettingsIcon, permission: 'settings.general' },
        { id: 'stations', label: 'إدارة المحطات', icon: Building2, permission: 'settings.stations' },
        { id: 'fuel', label: 'الوقود والأسعار', icon: Fuel, permission: 'settings.fuel' },
        { id: 'roles', label: 'الصلاحيات والأمان', icon: Shield, permission: 'settings.security', superAdminOnly: true },
        { id: 'activity', label: 'سجل العمليات', icon: Activity, permission: 'settings.activity' },
        { id: 'alerts', label: 'التنبيهات', icon: Bell, permission: 'settings.general' },
        { id: 'backup', label: 'النسخ الاحتياطي', icon: Server, permission: 'settings.backup' },
    ];

    // Permission-based tab filtering
    const canAccess = (perm) => isSuperAdmin || (Array.isArray(userPermissions) && (userPermissions.includes('*') || userPermissions.includes(perm)));
    const visibleTabs = settingsTabs.filter(tab => {
        if (tab.superAdminOnly) return isSuperAdmin;
        return canAccess(tab.permission);
    });
    
    // settings state
    const [generalSettings, setGeneralSettings] = useState(general);
    const [alertSettings, setAlertSettings] = useState(alerts);
    
    // Dynamic Fuel Types
    const [fuelTypeList, setFuelTypeList] = useState(fuelTypes);
    const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
    const [editingFuel, setEditingFuel] = useState(null); // Full fuel object
    const [showResetModal, setShowResetModal] = useState(false);



    // Initial Load / Sync
    useEffect(() => {
        setGeneralSettings(general);
        setFuelTypeList(fuelTypes);
    }, [general, fuelTypes]);

    // Handlers
    const handleGeneralChange = (key, value) => {
        setGeneralSettings({ ...generalSettings, [key]: value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Save General
            const formData = new FormData();
            formData.append('section', 'general');
            Object.entries(generalSettings).forEach(([k, v]) => formData.append(k, v));
            
            await fetch('/PETRODIESEL2/public/settings/update', { method: 'POST', body: formData });

            // Save Alert Settings
            if (alertSettings && Object.keys(alertSettings).length > 0) {
                const alertFormData = new FormData();
                alertFormData.append('section', 'alerts');
                Object.entries(alertSettings).forEach(([k, v]) => alertFormData.append(k, v));
                await fetch('/PETRODIESEL2/public/settings/update', { method: 'POST', body: alertFormData });
            }

            // Save Fuel (Legacy settings if any, but now we use FuelType table)
            // If there are other fuel settings not in the table, keep this. 
            // Otherwise, fuel types are saved individually via modal.

            toast.success('تم حفظ الإعدادات العامة بنجاح');
            setTimeout(() => window.location.reload(), 1000);
        } catch (e) {
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setLoading(false);
        }
    };

    // Fuel Type Handlers
    const handleSaveFuel = async (fuelData) => {
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/save_fuel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fuelData)
            });
            
            if (!res.ok) {
                const text = await res.text();
                console.error('Server Error:', text);
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();
            if(data.success) {
                toast.success('تم حفظ نوع الوقود');
                // Reloading is still safest for save/edit to get fresh data until we have full state management
                // But let's try to avoid it if possible or delay it.
                // For now, let's keep reload for SAVE as it might change IDs/Codes etc.
                 setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error('فشل حفظ البيانات: ' + e.message);
        }
    };

    const handleDeleteFuel = async (id) => {
        if(!confirm('هل أنت متأكد من حذف هذا النوع؟')) return;
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/delete_fuel', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' // Force AJAX detection
                },
                body: JSON.stringify({ id })
            });
            
            // Try to parse JSON, but handle HTML/Text error responses too
            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('Server returned invalid JSON: ' + text.substring(0, 100));
            }

            if (!res.ok) {
                throw new Error(data.message || `Server Error (${res.status})`);
            }

            if(data.success) {
                toast.success('تم الحذف بنجاح');
                // Remove from local state
                setFuelTypeList(prev => prev.filter(f => f.id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error('فشل الحذف: ' + e.message);
        }
    };

    const handleSaveRole = async (roleData) => {
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/save_role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('تم حفظ الدور بنجاح');
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error('Role save error:', e);
            toast.error('فشل حفظ الدور: ' + e.message);
        }
    };

    const handleDeleteRole = async (roleId) => {
        // Confirmation is now handled in RoleManager.jsx component UI


        try {
            const res = await fetch('/PETRODIESEL2/public/settings/delete_role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: roleId })
            });
            const data = await res.json();
            
            if(data.success) {
                toast.success('تم حذف الدور بنجاح');
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('فشل حذف الدور');
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/save_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('تم تحديث بيانات المستخدم');
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('فشل تحديث المستخدم');
        }
    };



    const handleCreateUser = async (userData) => {
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/create_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if(data.success) {
                toast.success('تم إنشاء المستخدم بنجاح');
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('فشل إنشاء المستخدم');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/delete_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId })
            });
            const data = await res.json();
            if(data.success) {
                toast.success('تم حذف المستخدم بنجاح');
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('فشل حذف المستخدم');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 max-w-[1800px] mx-auto space-y-6 dark:bg-[#0F172A]"
        >
            {/* Keyframe animations for pill nav */}
            <style>{`
                @keyframes settingsNavSlideIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes settingsTabFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .settings-pill-nav::-webkit-scrollbar { display: none; }
                .settings-pill-nav { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <TabGroup index={selectedTab} onIndexChange={setSelectedTab}>
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 mt-4">
                    {/* Custom Sliding Pill Navigation */}
                    <div className="settings-pill-nav relative flex gap-0 p-1 rounded-full w-full xl:w-fit overflow-x-auto
                        bg-white/80 backdrop-blur-xl shadow-lg border border-slate-200/60
                        dark:bg-white/[0.08] dark:backdrop-blur-2xl dark:border-white/[0.15] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                        style={{ animation: 'settingsNavSlideIn 0.6s ease-out' }}
                    >
                        {/* Sliding Indicator */}
                        {tabRefs.current[selectedTab] && (
                            <motion.div
                                className="absolute top-1 bottom-1 rounded-full z-0
                                    bg-white shadow-[0_3px_12px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]
                                    dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-600 dark:shadow-[0_3px_12px_rgba(16,185,129,0.3)]"
                                layoutId="settingsTabSlider"
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{
                                    left: tabRefs.current[selectedTab]?.offsetLeft || 0,
                                    width: tabRefs.current[selectedTab]?.offsetWidth || 0,
                                }}
                            />
                        )}
                        {visibleTabs.map((tab, idx) => (
                            <button
                                key={tab.id}
                                ref={el => tabRefs.current[idx] = el}
                                onClick={() => setSelectedTab(idx)}
                                className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors duration-300 cursor-pointer select-none
                                    ${selectedTab === idx
                                        ? 'text-emerald-600 dark:text-white'
                                        : 'text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white/80'
                                    }`}
                                style={{ animation: `settingsTabFadeIn 0.5s ease-out ${0.1 + idx * 0.06}s backwards` }}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Hidden TabList required by Tremor to sync panels */}
                    <TabList className="hidden">
                        {visibleTabs.map(tab => <Tab key={tab.id}>{tab.label}</Tab>)}
                    </TabList>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full xl:w-auto px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                        {loading ? 'جاري الحفظ...' : <><Save className="w-5 h-5"/> حفظ التغييرات</>}
                    </button>
                </div>
                
                {/* Render active tab content based on selected visible tab ID */}
                {(() => {
                    const currentTabId = visibleTabs[selectedTab]?.id;
                    return (
                        <>
                            {currentTabId === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* Station Info */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                            <Card className="rounded-2xl shadow-lg ring-1 ring-blue-100/50 p-6 space-y-6 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:ring-white/[0.06] dark:shadow-black/20 hover:shadow-xl hover:ring-blue-200/80 dark:hover:ring-blue-500/20 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-t-2xl"></div>
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20"><Globe className="w-4 h-4 text-white"/></div>
                                    بيانات المؤسسة
                                </Title>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">اسم المحطة / المنطقة</label>
                                    <TextInput 
                                        value={generalSettings.station_name || ''} 
                                        onChange={(e) => handleGeneralChange('station_name', e.target.value)}
                                        placeholder="مثال: محطة بتروديزل" 
                                        className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">رقم السجل التجاري</label>
                                    <TextInput 
                                        value={generalSettings.cr_number || ''}
                                        onChange={(e) => handleGeneralChange('cr_number', e.target.value)}
                                        placeholder="70XXXXXXXX" className="rounded-xl font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">الرقم الضريبي VAT</label>
                                    <TextInput 
                                        value={generalSettings.vat_number || ''}
                                        onChange={(e) => handleGeneralChange('vat_number', e.target.value)}
                                        placeholder="3XXXXXXXXXXXXX" className="rounded-xl font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right" 
                                    />
                                </div>
                            </Card>
                            </motion.div>

                            {/* Localization */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="rounded-2xl shadow-lg ring-1 ring-emerald-100/50 p-6 space-y-6 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:ring-white/[0.06] dark:shadow-black/20 hover:shadow-xl hover:ring-emerald-200/80 dark:hover:ring-emerald-500/20 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-t-2xl"></div>
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20"><Globe className="w-4 h-4 text-white"/></div>
                                    اللغة والعملة
                                </Title>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">لغة النظام</label>
                                    <select 
                                        value={generalSettings.language || 'ar'} 
                                        onChange={(e) => handleGeneralChange('language', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-emerald-500 border outline-none transition-all"
                                    >
                                        <option value="ar">العربية (Arabic)</option>
                                        <option value="en">English (الإنجليزية)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">العملة الأساسية</label>
                                    <select 
                                        value={generalSettings.currency || 'SDG'} 
                                        onChange={(e) => handleGeneralChange('currency', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-emerald-500 border outline-none transition-all"
                                    >
                                        <option value="SDG">جنيه سوداني (SDG)</option>
                                        <option value="SAR">ريال سعودي (SAR)</option>
                                        <option value="USD">دولار أمريكي (USD)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">المنطقة الزمنية (Timezone)</label>
                                    <select 
                                        value={generalSettings.timezone || 'Africa/Khartoum'} 
                                        onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-emerald-500 border outline-none transition-all"
                                    >
                                        <option value="Africa/Khartoum">🇸🇩 الخرطوم (Khartoum)</option>
                                        <option value="Africa/Cairo">🇪🇬 القاهرة (Cairo)</option>
                                        <option value="Asia/Riyadh">🇸🇦 الرياض (Riyadh)</option>
                                        <option value="Asia/Dubai">🇦🇪 دبي (Dubai)</option>
                                        <option value="Asia/Baghdad">🇮🇶 بغداد (Baghdad)</option>
                                        <option value="Asia/Kuwait">🇰🇼 الكويت (Kuwait)</option>
                                        <option value="Africa/Tripoli">🇱🇾 طرابلس (Tripoli)</option>
                                        <option value="Asia/Beirut">🇱🇧 بيروت (Beirut)</option>
                                    </select>
                                    <Text className="text-xs text-slate-500 mt-2 dark:text-slate-400 text-right">
                                        يُستخدم لضبط التاريخ والوقت في المبيعات، المشتريات، والتقارير تلقائياً
                                    </Text>
                                </div>

                                {generalSettings.currency !== 'SAR' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <Text className="text-xs text-slate-400 mt-1">سيتم استخدام هذه العملة كعملة أساسية للنظام بالكامل</Text>
                                    </motion.div>
                                )}
                            </Card>
                            </motion.div>

                             {/* System Config */}
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                             <Card className="rounded-2xl shadow-lg ring-1 ring-violet-100/50 p-6 space-y-6 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:ring-white/[0.06] dark:shadow-black/20 hover:shadow-xl hover:ring-violet-200/80 dark:hover:ring-violet-500/20 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-600 rounded-t-2xl"></div>
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20"><Server className="w-4 h-4 text-white"/></div>
                                    إعدادات التشغيل
                                </Title>
                                <div className="flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">وضع الصيانة</span>
                                    <Switch 
                                        checked={generalSettings.maintenance_mode === '1'} 
                                        onChange={(val) => handleGeneralChange('maintenance_mode', val ? '1' : '0')}
                                    />
                                </div>
                                <div className="flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">تفعيل الإشعارات</span>
                                    <Switch 
                                        checked={generalSettings.enable_notifications === '1'} 
                                        onChange={(val) => handleGeneralChange('enable_notifications', val ? '1' : '0')}
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">القفل التلقائي (Auto Lock)</label>
                                    <select 
                                        value={generalSettings.auto_lock_minutes || '0'} 
                                        onChange={(e) => handleGeneralChange('auto_lock_minutes', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-violet-500 border outline-none transition-all"
                                    >
                                        <option value="0" className="dark:bg-slate-800">معطل (Disabled)</option>
                                        <option value="1" className="dark:bg-slate-800">دقيقة واحدة</option>
                                        <option value="2" className="dark:bg-slate-800">دقيقتان</option>
                                        <option value="5" className="dark:bg-slate-800">5 دقائق</option>
                                        <option value="10" className="dark:bg-slate-800">10 دقائق</option>
                                    </select>
                                </div>
                             </Card>
                             </motion.div>

                             {/* ═══════════ NEW: Numbers & Amounts Settings ═══════════ */}
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                             <Card className="rounded-2xl shadow-lg ring-1 ring-amber-100/50 p-6 space-y-6 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:ring-white/[0.06] dark:shadow-black/20 hover:shadow-xl hover:ring-amber-200/80 dark:hover:ring-amber-500/20 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-t-2xl"></div>
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"><DollarSign className="w-4 h-4 text-white"/></div>
                                    الأرقام والمبالغ
                                </Title>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">الخانات العشرية للمبالغ</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { val: '0', label: 'بدون', example: '1,250' },
                                            { val: '1', label: 'واحدة', example: '1,250.5' },
                                            { val: '2', label: 'اثنتان', example: '1,250.50' },
                                            { val: '3', label: 'ثلاث', example: '1,250.500' }
                                        ].map(opt => (
                                            <button
                                                type="button"
                                                key={opt.val}
                                                onClick={() => handleGeneralChange('decimal_places', opt.val)}
                                                className={`p-2.5 rounded-xl text-center transition-all duration-200 ring-1 ${
                                                    (generalSettings.decimal_places || '0') === opt.val
                                                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-amber-400 shadow-lg shadow-amber-500/30 scale-[1.02]'
                                                        : 'bg-white dark:bg-white/5 ring-slate-200/60 dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 hover:ring-amber-300 dark:hover:ring-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5'
                                                }`}
                                            >
                                                <span className="block text-xs font-bold">{opt.label}</span>
                                                <span className={`block text-[10px] mt-1 font-mono ${(generalSettings.decimal_places || '0') === opt.val ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'}`}>{opt.example}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">الخانات العشرية للكميات</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { val: '0', label: 'بدون', example: '500' },
                                            { val: '1', label: 'واحدة', example: '500.5' },
                                            { val: '2', label: 'اثنتان', example: '500.50' },
                                            { val: '3', label: 'ثلاث', example: '500.500' }
                                        ].map(opt => (
                                            <button
                                                type="button"
                                                key={opt.val}
                                                onClick={() => handleGeneralChange('quantity_decimal_places', opt.val)}
                                                className={`p-2.5 rounded-xl text-center transition-all duration-200 ring-1 ${
                                                    (generalSettings.quantity_decimal_places || '0') === opt.val
                                                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-amber-400 shadow-lg shadow-amber-500/30 scale-[1.02]'
                                                        : 'bg-white dark:bg-white/5 ring-slate-200/60 dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 hover:ring-amber-300 dark:hover:ring-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5'
                                                }`}
                                            >
                                                <span className="block text-xs font-bold">{opt.label}</span>
                                                <span className={`block text-[10px] mt-1 font-mono ${(generalSettings.quantity_decimal_places || '0') === opt.val ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'}`}>{opt.example}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                                    <div className="flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.04] mb-3">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">تفعيل الضريبة (VAT)</span>
                                        <Switch 
                                            checked={generalSettings.enable_vat === '1'} 
                                            onChange={(val) => handleGeneralChange('enable_vat', val ? '1' : '0')}
                                        />
                                    </div>
                                    <AnimatePresence>
                                    {generalSettings.enable_vat === '1' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">نسبة الضريبة (%)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" step="0.5" min="0" max="50"
                                                    value={generalSettings.vat_percentage || '0'} 
                                                    onChange={(e) => handleGeneralChange('vat_percentage', e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 pl-10 text-right focus:ring-2 focus:ring-amber-500 border outline-none transition-all font-mono font-bold"
                                                />
                                                <span className="absolute left-3 top-2.5 text-amber-500 font-bold text-sm">%</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </div>
                             </Card>
                             </motion.div>

                             {/* ═══════════ NEW: Invoice & Print Settings ═══════════ */}
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                             <Card className="rounded-2xl shadow-lg ring-1 ring-rose-100/50 p-6 space-y-6 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:ring-white/[0.06] dark:shadow-black/20 hover:shadow-xl hover:ring-rose-200/80 dark:hover:ring-rose-500/20 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-t-2xl"></div>
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20"><FileText className="w-4 h-4 text-white"/></div>
                                    الفواتير والطباعة
                                </Title>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">بادئة رقم الفاتورة</label>
                                    <TextInput 
                                        value={generalSettings.invoice_prefix || ''} 
                                        onChange={(e) => handleGeneralChange('invoice_prefix', e.target.value)}
                                        placeholder="مثال: INV- أو فاتورة-" 
                                        className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right font-mono" 
                                    />
                                    <Text className="text-xs text-slate-500 mt-1 dark:text-slate-400 text-right">
                                        سيظهر كـ: {(generalSettings.invoice_prefix || 'INV-')}00001
                                    </Text>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">رقم بداية الفواتير</label>
                                    <input 
                                        type="number" min="1"
                                        value={generalSettings.invoice_start_number || '1'} 
                                        onChange={(e) => handleGeneralChange('invoice_start_number', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-rose-500 border outline-none transition-all font-mono"
                                        placeholder="1"
                                    />
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">عنوان الطباعة (Header)</label>
                                    <TextInput 
                                        value={generalSettings.print_header || ''} 
                                        onChange={(e) => handleGeneralChange('print_header', e.target.value)}
                                        placeholder="مثال: محطة بتروديزل الحديثة" 
                                        className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">تذييل الطباعة (Footer)</label>
                                    <TextInput 
                                        value={generalSettings.print_footer || ''} 
                                        onChange={(e) => handleGeneralChange('print_footer', e.target.value)}
                                        placeholder="مثال: شكراً لتعاملكم معنا" 
                                        className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right" 
                                    />
                                </div>

                                <div className="flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">إظهار الشعار في الطباعة</span>
                                    <Switch 
                                        checked={generalSettings.show_logo_on_print === '1'} 
                                        onChange={(val) => handleGeneralChange('show_logo_on_print', val ? '1' : '0')}
                                    />
                                </div>
                             </Card>
                             </motion.div>

                             {/* ═══════════ NEW: Date & Display Settings ═══════════ */}
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                             <Card className="rounded-2xl shadow-lg ring-1 ring-cyan-100/50 p-6 space-y-6 bg-white/80 backdrop-blur-xl dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border dark:border-white/[0.08] dark:ring-white/[0.06] dark:shadow-black/20 hover:shadow-xl hover:ring-cyan-200/80 dark:hover:ring-cyan-500/20 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-600 rounded-t-2xl"></div>
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg shadow-cyan-500/20"><Calendar className="w-4 h-4 text-white"/></div>
                                    التاريخ والعرض
                                </Title>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">تنسيق التاريخ</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { val: 'Y-m-d', label: 'YYYY-MM-DD', example: '2026-02-17' },
                                            { val: 'd-m-Y', label: 'DD-MM-YYYY', example: '17-02-2026' },
                                            { val: 'd/m/Y', label: 'DD/MM/YYYY', example: '17/02/2026' }
                                        ].map(opt => (
                                            <button
                                                type="button"
                                                key={opt.val}
                                                onClick={() => handleGeneralChange('date_format', opt.val)}
                                                className={`p-2.5 rounded-xl text-center transition-all duration-200 ring-1 ${
                                                    (generalSettings.date_format || 'Y-m-d') === opt.val
                                                        ? 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white ring-cyan-400 shadow-lg shadow-cyan-500/30 scale-[1.02]'
                                                        : 'bg-white dark:bg-white/5 ring-slate-200/60 dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 hover:ring-cyan-300 dark:hover:ring-cyan-500/30 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5'
                                                }`}
                                            >
                                                <span className="block text-[10px] font-bold">{opt.label}</span>
                                                <span className={`block text-[10px] mt-1 font-mono ${(generalSettings.date_format || 'Y-m-d') === opt.val ? 'text-cyan-100' : 'text-slate-400 dark:text-slate-500'}`}>{opt.example}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">عدد العناصر في الصفحة</label>
                                    <select 
                                        value={generalSettings.items_per_page || '25'} 
                                        onChange={(e) => handleGeneralChange('items_per_page', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-cyan-500 border outline-none transition-all"
                                    >
                                        <option value="10" className="dark:bg-slate-800">10 عناصر</option>
                                        <option value="25" className="dark:bg-slate-800">25 عنصر</option>
                                        <option value="50" className="dark:bg-slate-800">50 عنصر</option>
                                        <option value="100" className="dark:bg-slate-800">100 عنصر</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">طريقة الدفع الافتراضية</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { val: 'safe', label: 'خزنة نقدية', icon: '🏦' },
                                            { val: 'bank', label: 'حساب بنكي', icon: '💳' }
                                        ].map(opt => (
                                            <button
                                                type="button"
                                                key={opt.val}
                                                onClick={() => handleGeneralChange('default_payment_method', opt.val)}
                                                className={`p-3 rounded-xl text-center transition-all duration-200 ring-1 flex items-center justify-center gap-2 ${
                                                    (generalSettings.default_payment_method || 'safe') === opt.val
                                                        ? 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white ring-cyan-400 shadow-lg shadow-cyan-500/30'
                                                        : 'bg-white dark:bg-white/5 ring-slate-200/60 dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 hover:ring-cyan-300 dark:hover:ring-cyan-500/30'
                                                }`}
                                            >
                                                <span className="text-lg">{opt.icon}</span>
                                                <span className="text-sm font-bold">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.03] p-3 rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.04]">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">عرض أرصدة الحسابات في الرأس</span>
                                    <Switch 
                                        checked={generalSettings.show_balances_in_header !== '0'} 
                                        onChange={(val) => handleGeneralChange('show_balances_in_header', val ? '1' : '0')}
                                    />
                                </div>
                             </Card>
                             </motion.div>
                        </div>
                    )}

                            {currentTabId === 'stations' && (
                        <div className="mt-6">
                            <StationList stations={stations} users={users} />
                        </div>
                    )}

                            {currentTabId === 'fuel' && (
                        <div className="mt-6 grid grid-cols-1 gap-6">
                            {/* General Fuel Settings */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-6 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <Title className="mb-4 font-bold flex items-center gap-2 dark:text-white"><SettingsIcon className="w-5 h-5"/> إعدادات العرض والقياس</Title>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">وحدة عرض الكميات (Fuel Volume Unit)</label>
                                    <select 
                                        value={generalSettings.volume_display_mode || 'liters'} 
                                        onChange={(e) => handleGeneralChange('volume_display_mode', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 border outline-none transition-all"
                                    >
                                        <option value="liters">لتر فقط (Liters Only)</option>
                                        <option value="gallons">جالون فقط (Gallons Only)</option>
                                        <option value="both">كلاهما (لتر + جالون)</option>
                                    </select>
                                    <Text className="text-xs text-slate-500 mt-2 dark:text-slate-400 text-right">
                                        سيتم استخدام معامل التحويل: 1 جالون = 4.5 لتر
                                    </Text>
                                </div>
                            </Card>

                             <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <div className="flex justify-between items-center mb-6">
                                    <Title className="dark:text-white">قائمة أنواع الوقود</Title>
                                    <button 
                                        onClick={() => { setEditingFuel(null); setIsFuelModalOpen(true); }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> نوع جديد
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {fuelTypeList.map((fuel) => (
                                        <div key={fuel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 dark:bg-white/5 dark:border-white/10 dark:text-white">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: fuel.color_hex + '20', color: fuel.color_hex }}
                                                >
                                                    <Fuel className="w-6 h-6"/>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg text-slate-700 block dark:text-white">{fuel.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400">السعر الحالي</p>
                                                    <p className="font-bold font-mono text-lg text-navy-900 dark:text-white">{fuel.price_per_liter} <span className="text-xs">{generalSettings.currency || 'SDG'}</span></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => { setEditingFuel(fuel); setIsFuelModalOpen(true); }}
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400"
                                                    >
                                                        <Edit className="w-4 h-4"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteFuel(fuel.id)}
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-50 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </Card>
                        </div>
                    )}


                            {currentTabId === 'roles' && isSuperAdmin && (
                         <div className="mt-6 grid grid-cols-1 gap-8">
                            {/* Role Management - Super Admin Only */}
                            <RoleManager roles={roles} onSave={handleSaveRole} onDelete={handleDeleteRole} />
                            
                            {/* User Management - Super Admin Only */}
                            <UserManager 
                                users={users} 
                                roles={roles} 
                                stations={stations} 
                                onSave={handleSaveUser} 
                                onCreate={handleCreateUser}
                                onDelete={handleDeleteUser}
                                isSuperAdmin={isSuperAdmin}
                            />
                         </div>
                    )}
                    
                            {currentTabId === 'backup' && (
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Backup Card */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 py-8 flex flex-col items-center justify-center space-y-6 bg-slate-50/50 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:text-white">
                                <Database className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                                <div className="text-center">
                                    <Title className="dark:text-white">النسخ الاحتياطي للنظام</Title>
                                    <Text className="mt-2 dark:text-slate-400">قم بتحميل نسخة كاملة من قاعدة البيانات</Text>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a 
                                        href="/PETRODIESEL2/public/settings/backup" 
                                        target="_blank"
                                        className="px-6 py-3 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-navy-800 transition-all flex items-center gap-2 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                    >
                                        <Download className="w-5 h-5" />
                                        تحميل نسخة احتياطية (SQL)
                                    </a>
                                    <label
                                        className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
                                    >
                                        <Upload className="w-5 h-5" />
                                        رفع نسخة محفوظة
                                        <input 
                                            type="file" 
                                            accept=".sql" 
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                e.target.value = '';

                                                if (!file.name.endsWith('.sql')) {
                                                    toast.error('يجب أن يكون الملف بصيغة .sql');
                                                    return;
                                                }

                                                if (!window.confirm(`⚠️ تحذير: سيتم استبدال جميع البيانات الحالية بالنسخة المحفوظة.\n\nالملف: ${file.name}\nالحجم: ${(file.size / 1024).toFixed(1)} KB\n\nهل أنت متأكد؟`)) {
                                                    return;
                                                }

                                                const formData = new FormData();
                                                formData.append('backup_file', file);

                                                const toastId = toast.loading('جاري استعادة النسخة الاحتياطية...');

                                                try {
                                                    const res = await fetch(`${window.BASE_URL}/settings/restore`, {
                                                        method: 'POST',
                                                        body: formData,
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        toast.success(data.message, { id: toastId, duration: 5000 });
                                                    } else {
                                                        toast.error(data.message || 'فشل في الاستعادة', { id: toastId });
                                                    }
                                                } catch (err) {
                                                    toast.error('خطأ في الاتصال', { id: toastId });
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </Card>

                            {/* Email Notification Settings */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-4 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <Title className="flex items-center gap-2 dark:text-white">
                                    <Bell className="w-5 h-5" /> إعدادات تنبيهات البريد الإلكتروني
                                </Title>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">SMTP Server</label>
                                        <TextInput 
                                            value={generalSettings.smtp_host || ''} 
                                            onChange={(e) => handleGeneralChange('smtp_host', e.target.value)}
                                            placeholder="smtp.gmail.com" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">SMTP Port</label>
                                        <TextInput 
                                            value={generalSettings.smtp_port || '587'} 
                                            onChange={(e) => handleGeneralChange('smtp_port', e.target.value)}
                                            placeholder="587" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">اسم المستخدم (Email)</label>
                                        <TextInput 
                                            value={generalSettings.smtp_username || ''} 
                                            onChange={(e) => handleGeneralChange('smtp_username', e.target.value)}
                                            placeholder="your@email.com" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">كلمة المرور</label>
                                        <TextInput 
                                            type="password"
                                            value={generalSettings.smtp_password || ''} 
                                            onChange={(e) => handleGeneralChange('smtp_password', e.target.value)}
                                            placeholder="••••••••" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">بريد استلام التنبيهات</label>
                                        <TextInput 
                                            value={generalSettings.notification_email || ''} 
                                            onChange={(e) => handleGeneralChange('notification_email', e.target.value)}
                                            placeholder="admin@yourcompany.com" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* WhatsApp Notification Settings */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-4 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10">
                                <Title className="flex items-center gap-2 dark:text-white">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    إعدادات تنبيهات واتساب
                                </Title>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">مزود الخدمة</label>
                                        <select 
                                            value={generalSettings.whatsapp_provider || 'ultramsg'} 
                                            onChange={(e) => handleGeneralChange('whatsapp_provider', e.target.value)}
                                            className="w-full rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white px-3 py-2 text-right focus:ring-2 focus:ring-blue-500 border outline-none transition-all"
                                        >
                                            <option value="ultramsg">UltraMsg</option>
                                            <option value="twilio">Twilio</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">Instance ID / SID</label>
                                        <TextInput 
                                            value={generalSettings.whatsapp_instance_id || ''} 
                                            onChange={(e) => handleGeneralChange('whatsapp_instance_id', e.target.value)}
                                            placeholder="instance12345" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">API Token</label>
                                        <TextInput 
                                            type="password"
                                            value={generalSettings.whatsapp_api_key || ''} 
                                            onChange={(e) => handleGeneralChange('whatsapp_api_key', e.target.value)}
                                            placeholder="your-api-token" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block dark:text-slate-300 text-right">رقم استلام التنبيهات</label>
                                        <TextInput 
                                            value={generalSettings.notification_phone || ''} 
                                            onChange={(e) => handleGeneralChange('notification_phone', e.target.value)}
                                            placeholder="+249123456789" 
                                            className="rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-2xl shadow-md ring-1 ring-red-100 py-6 flex flex-col items-center justify-center space-y-4 bg-red-50/50 dark:bg-red-900/10 dark:border dark:border-red-900/20">
                                <Title className="text-red-700 dark:text-red-400">منطقة الخطر</Title>
                                <Text className="text-red-600 dark:text-red-300">إعادة ضبط المصنع (حذف جميع البيانات)</Text>
                                <button 
                                    onClick={() => setShowResetModal(true)}
                                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all flex items-center gap-2 dark:bg-red-700 dark:hover:bg-red-600"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    إعادة ضبط المصنع
                                </button>
                            </Card>
                        </div>
                    )}

                            {currentTabId === 'activity' && (
                        <div className="mt-6">
                            <ActivityLogPanel />
                        </div>
                    )}

                            {currentTabId === 'alerts' && (
                        <AlertSettingsPanel 
                            alerts={alerts}
                            currency={generalSettings.currency || 'SDG'}
                            onSettingsChange={(updated) => setAlertSettings(updated)}
                        />
                    )}
                        </>
                    );
                })()}
            </TabGroup>

            {/* Fuel Edit Modal */}
            <FuelModal 
                isOpen={isFuelModalOpen} 
                onClose={() => setIsFuelModalOpen(false)} 
                fuel={editingFuel} 
                onSave={handleSaveFuel} 
            />

            {/* Factory Reset Modal */}
            <FactoryResetModal 
                isOpen={showResetModal} 
                onClose={() => setShowResetModal(false)} 
            />


        </motion.div>
    );
}



function FuelModal({ isOpen, onClose, fuel, onSave }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [color, setColor] = useState('#64748b');

    useEffect(() => {
        if (fuel) {
            setName(fuel.name);
            setPrice(fuel.price_per_liter);
            setColor(fuel.color_hex);
        } else {
            setName('');
            setPrice('');
            setColor('#64748b');
        }
    }, [fuel, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id: fuel?.id, name, price_per_liter: price, color_hex: color });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md dark:bg-slate-900 dark:border dark:border-white/10 dark:text-white"
            >
                <Title className="mb-4 dark:text-white">{fuel ? 'تعديل الوقود' : 'إضافة وقود جديد'}</Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-white">اسم الوقود</label>
                        <TextInput value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: بنزين 98" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-white">السعر (لكل لتر)</label>
                        <TextInput type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-white">لون التمييز</label>
                        <div className="flex gap-2">
                            {['#64748b', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-navy-900 dark:border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:bg-white/5">إلغاء</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">حفظ</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

/**
 * Multi-step Factory Reset Modal
 * Step 1: Animated Warning
 * Step 2: Section Selection
 * Step 3: Password Re-authentication
 */
function FactoryResetModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedSections, setSelectedSections] = useState({
        sales: false,
        purchases: false,
        tanks_pumps: false,
        transactions: false,
        safes_banks: false,
        hr: false,
        customers_suppliers: false,
        fuel_types: false
    });
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const sections = [
        { key: 'sales', label: 'المبيعات', desc: 'جميع فواتير وعمليات البيع', icon: '💰' },
        { key: 'purchases', label: 'المشتريات', desc: 'جميع فواتير وعمليات الشراء', icon: '📦' },
        { key: 'tanks_pumps', label: 'الخزانات والمكائن', desc: 'الخزانات، المضخات، العدادات', icon: '⛽' },
        { key: 'transactions', label: 'العمليات المالية', desc: 'المعاملات، المصروفات، التحويلات', icon: '💳' },
        { key: 'safes_banks', label: 'الخزائن والبنوك', desc: 'حسابات الخزائن والبنوك', icon: '🏦' },
        { key: 'hr', label: 'الموارد البشرية', desc: 'الموظفين، الحضور، السلف، الرواتب', icon: '👥' },
        { key: 'customers_suppliers', label: 'العملاء والموردين', desc: 'قائمة العملاء والموردين', icon: '🤝' },
        { key: 'fuel_types', label: 'أنواع الوقود', desc: 'تعريفات أنواع الوقود والأسعار', icon: '🛢️' }
    ];

    const handleSectionToggle = (key) => {
        setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSelectAll = () => {
        const allSelected = Object.values(selectedSections).every(v => v);
        const newValue = !allSelected;
        setSelectedSections(Object.fromEntries(Object.keys(selectedSections).map(k => [k, newValue])));
    };

    const handleReset = async () => {
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/PETRODIESEL2/public/settings/factory_reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sections: selectedSections,
                    email: credentials.email,
                    password: credentials.password
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                onClose(); // Close modal immediately
                toast.success(data.message);
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setError(data.message || 'فشلت العملية');
            }
        } catch (e) {
            setError('خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setSelectedSections({
            sales: false, purchases: false, tanks_pumps: false, 
            transactions: false, safes_banks: false, hr: false, customers_suppliers: false, fuel_types: false
        });
        setCredentials({ email: '', password: '' });
        setError('');
        onClose();
    };

    const selectedCount = Object.values(selectedSections).filter(v => v).length;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    {/* Step 1: Animated Warning */}
                    {step === 1 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 text-center"
                        >
                            {/* Animated Warning Icon */}
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, -5, 5, 0]
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"
                            >
                                <motion.span 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="text-5xl"
                                >
                                    ⚠️
                                </motion.span>
                            </motion.div>
                            
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                                تحذير هام!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                أنت على وشك إعادة ضبط المصنع.
                                <br />
                                <span className="text-red-500 font-bold">هذا الإجراء لا يمكن التراجع عنه!</span>
                            </p>
                            
                            {/* Glowing Border Effect */}
                            <motion.div 
                                animate={{ 
                                    boxShadow: ['0 0 20px rgba(239,68,68,0.3)', '0 0 40px rgba(239,68,68,0.5)', '0 0 20px rgba(239,68,68,0.3)']
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6"
                            >
                                <p className="text-sm text-red-600 dark:text-red-300">
                                    سيتم حذف البيانات المحددة نهائياً من قاعدة البيانات
                                </p>
                            </motion.div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleClose}
                                    className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    إلغاء
                                </button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:from-red-700 hover:to-red-800 transition-all"
                                >
                                    متابعة ←
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Section Selection */}
                    {step === 2 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    اختر الأقسام للحذف
                                </h2>
                                <button 
                                    onClick={handleSelectAll}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {Object.values(selectedSections).every(v => v) ? 'إلغاء الكل' : 'تحديد الكل'}
                                </button>
                            </div>
                            
                            <div className="space-y-2 max-h-80 overflow-y-auto mb-6">
                                {sections.map((section, idx) => (
                                    <motion.div 
                                        key={section.key}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleSectionToggle(section.key)}
                                        className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${
                                            selectedSections[section.key] 
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{section.icon}</span>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 dark:text-white">{section.label}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{section.desc}</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                selectedSections[section.key] 
                                                    ? 'border-red-500 bg-red-500' 
                                                    : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                                {selectedSections[section.key] && (
                                                    <motion.span 
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="text-white text-sm"
                                                    >✓</motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    ← رجوع
                                </button>
                                <motion.button 
                                    whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
                                    whileTap={{ scale: selectedCount > 0 ? 0.98 : 1 }}
                                    onClick={() => selectedCount > 0 && setStep(3)}
                                    disabled={selectedCount === 0}
                                    className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all ${
                                        selectedCount > 0 
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30' 
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    متابعة ({selectedCount} قسم)
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Password Re-authentication */}
                    {step === 3 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="p-6"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    تأكيد الهوية
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    أدخل بيانات الدخول الخاصة بك للتأكيد
                                </p>
                            </div>
                            
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-center text-sm text-red-600 dark:text-red-400"
                                >
                                    {error}
                                </motion.div>
                            )}
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-right">
                                        البريد الإلكتروني
                                    </label>
                                    <input 
                                        type="email"
                                        value={credentials.email}
                                        onChange={(e) => setCredentials(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-right"
                                        placeholder="admin@example.com"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-right">
                                        كلمة المرور
                                    </label>
                                    <input 
                                        type="password"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials(p => ({ ...p, password: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-right"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            
                            {/* Summary of what will be deleted */}
                            <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400 font-bold mb-2">سيتم حذف:</p>
                                <div className="flex flex-wrap gap-2">
                                    {sections.filter(s => selectedSections[s.key]).map(s => (
                                        <span key={s.key} className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 text-xs rounded-lg">
                                            {s.icon} {s.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={loading}
                                    className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                                >
                                    ← رجوع
                                </button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReset}
                                    disabled={loading || !credentials.email || !credentials.password}
                                    className={`flex-1 py-3 px-6 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        loading || !credentials.email || !credentials.password
                                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <motion.span 
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            جاري التنفيذ...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5" />
                                            تأكيد الحذف
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

