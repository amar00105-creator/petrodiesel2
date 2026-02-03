import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, TextInput, Select, SelectItem, Switch, Tab, TabGroup, TabList, TabPanel, TabPanels, Badge } from '@tremor/react';
import { Settings as SettingsIcon, Fuel, Bell, Shield, Save, Globe, Server, UserCog, Database, Download, Plus, Trash2, Edit, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import StationList from './StationList';
import RoleManager from './components/RoleManager';
import UserManager from './components/UserManager';

export default function Settings({ general = {}, fuel = {}, alerts = {}, roles = [], fuelTypes = [], stations = [], users = [] }) {
    const [loading, setLoading] = useState(false);
    
    // settings state
    const [generalSettings, setGeneralSettings] = useState(general);
    
    // Dynamic Fuel Types
    const [fuelTypeList, setFuelTypeList] = useState(fuelTypes);
    const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
    const [editingFuel, setEditingFuel] = useState(null); // Full fuel object



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
            toast.error('فشل حفظ الدور');
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

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 max-w-[1800px] mx-auto space-y-6"
        >
            <div className="flex justify-between items-end mb-4">
                <div></div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                    {loading ? 'جاري الحفظ...' : <><Save className="w-5 h-5"/> حفظ التغييرات</>}
                </button>
            </div>

            <TabGroup>
                <TabList className="mt-4 bg-white p-1 rounded-2xl shadow-sm ring-1 ring-slate-200 w-fit overflow-x-auto">
                    <Tab icon={SettingsIcon}>عام</Tab>
                    <Tab icon={Building2}>إدارة المحطات</Tab>
                    <Tab icon={Fuel}>الوقود والأسعار</Tab>
                    <Tab icon={Shield}>الصلاحيات والأمان</Tab>
                    <Tab icon={Server}>النسخ الاحتياطي</Tab>
                </TabList>
                
                <TabPanels>
                    {/* General Settings */}
                    <TabPanel>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* Station Info */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-6">
                                <Title className="mb-4 font-bold flex items-center gap-2"><Globe className="w-5 h-5"/> بيانات المؤسسة</Title>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">اسم المحطة</label>
                                    <TextInput 
                                        value={generalSettings.station_name || ''} 
                                        onChange={(e) => handleGeneralChange('station_name', e.target.value)}
                                        placeholder="مثال: محطة بتروديزل" 
                                        className="rounded-xl" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">رقم السجل التجاري</label>
                                    <TextInput 
                                        value={generalSettings.cr_number || ''}
                                        onChange={(e) => handleGeneralChange('cr_number', e.target.value)}
                                        placeholder="70XXXXXXXX" className="rounded-xl font-mono" 
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">الرقم الضريبي VAT</label>
                                    <TextInput 
                                        value={generalSettings.vat_number || ''}
                                        onChange={(e) => handleGeneralChange('vat_number', e.target.value)}
                                        placeholder="3XXXXXXXXXXXXX" className="rounded-xl font-mono" 
                                    />
                                </div>
                            </Card>

                            {/* Localization */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-6">
                                <Title className="mb-4 font-bold flex items-center gap-2"><Globe className="w-5 h-5"/> اللغة والعملة</Title>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">لغة النظام</label>
                                    <Select 
                                        value={generalSettings.language || 'ar'} 
                                        onValueChange={(val) => handleGeneralChange('language', val)}
                                        className="rounded-xl"
                                    >
                                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                                        <SelectItem value="en">English (الإنجليزية)</SelectItem>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">العملة الأساسية</label>
                                    <Select 
                                        value={generalSettings.currency || 'SDG'} 
                                        onValueChange={(val) => handleGeneralChange('currency', val)}
                                        className="rounded-xl"
                                    >
                                        <SelectItem value="SDG">جنيه سوداني (SDG)</SelectItem>
                                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">المنطقة الزمنية (Timezone)</label>
                                    <Select 
                                        value={generalSettings.timezone || 'Africa/Khartoum'} 
                                        onValueChange={(val) => handleGeneralChange('timezone', val)}
                                        className="rounded-xl"
                                    >
                                        <SelectItem value="Africa/Khartoum">🇸🇩 الخرطوم (Khartoum)</SelectItem>
                                        <SelectItem value="Africa/Cairo">🇪🇬 القاهرة (Cairo)</SelectItem>
                                        <SelectItem value="Asia/Riyadh">🇸🇦 الرياض (Riyadh)</SelectItem>
                                        <SelectItem value="Asia/Dubai">🇦🇪 دبي (Dubai)</SelectItem>
                                        <SelectItem value="Asia/Baghdad">🇮🇶 بغداد (Baghdad)</SelectItem>
                                        <SelectItem value="Asia/Kuwait">🇰🇼 الكويت (Kuwait)</SelectItem>
                                        <SelectItem value="Africa/Tripoli">🇱🇾 طرابلس (Tripoli)</SelectItem>
                                        <SelectItem value="Asia/Beirut">🇱🇧 بيروت (Beirut)</SelectItem>
                                    </Select>
                                    <Text className="text-xs text-slate-500 mt-2">
                                        يُستخدم لضبط التاريخ والوقت في المبيعات، المشتريات، والتقارير
                                    </Text>
                                </div>

                                {generalSettings.currency !== 'SAR' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <Text className="text-xs text-slate-400 mt-1">سيتم استخدام هذه العملة كعملة أساسية للنظام بالكامل</Text>
                                    </motion.div>
                                )}
                            </Card>

                             {/* System Config */}
                             <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-6">
                                <Title className="mb-4 font-bold flex items-center gap-2"><Server className="w-5 h-5"/> إعدادات التشغيل</Title>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">وضع الصيانة</span>
                                    <Switch 
                                        checked={generalSettings.maintenance_mode === '1'} 
                                        onChange={(val) => handleGeneralChange('maintenance_mode', val ? '1' : '0')}
                                    />
                                </div>
                            <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">تفعيل الإشعارات</span>
                                    <Switch 
                                        checked={generalSettings.enable_notifications === '1'} 
                                        onChange={(val) => handleGeneralChange('enable_notifications', val ? '1' : '0')}
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">القفل التلقائي (Auto Lock)</label>
                                    <Select 
                                        value={generalSettings.auto_lock_minutes || '0'} 
                                        onValueChange={(val) => handleGeneralChange('auto_lock_minutes', val)}
                                        className="rounded-xl"
                                    >
                                        <SelectItem value="0">معطل (Disabled)</SelectItem>
                                        <SelectItem value="1">دقيقة واحدة</SelectItem>
                                        <SelectItem value="2">دقيقتان</SelectItem>
                                        <SelectItem value="5">5 دقائق</SelectItem>
                                        <SelectItem value="10">10 دقائق</SelectItem>
                                    </Select>
                                </div>
                             </Card>
                        </div>
                    </TabPanel>

                    {/* Stations Management */}
                    <TabPanel>
                        <div className="mt-6">
                            <StationList stations={stations} users={users} />
                        </div>
                    </TabPanel>

                    {/* Fuel Types & Settings */}
                    <TabPanel>
                        <div className="mt-6 grid grid-cols-1 gap-6">
                            {/* General Fuel Settings */}
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 p-6 space-y-6">
                                <Title className="mb-4 font-bold flex items-center gap-2"><SettingsIcon className="w-5 h-5"/> إعدادات العرض والقياس</Title>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">وحدة عرض الكميات (Fuel Volume Unit)</label>
                                    <Select 
                                        value={generalSettings.volume_display_mode || 'liters'} 
                                        onValueChange={(val) => handleGeneralChange('volume_display_mode', val)}
                                        className="rounded-xl"
                                    >
                                        <SelectItem value="liters">لتر فقط (Liters Only)</SelectItem>
                                        <SelectItem value="gallons">جالون فقط (Gallons Only)</SelectItem>
                                        <SelectItem value="both">كلاهما (لتر + جالون)</SelectItem>
                                    </Select>
                                    <Text className="text-xs text-slate-500 mt-2">
                                        سيتم استخدام معامل التحويل: 1 جالون = 4.5 لتر
                                    </Text>
                                </div>
                            </Card>

                             <Card className="rounded-2xl shadow-md ring-1 ring-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <Title>قائمة أنواع الوقود</Title>
                                    <button 
                                        onClick={() => { setEditingFuel(null); setIsFuelModalOpen(true); }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> نوع جديد
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {fuelTypeList.map((fuel) => (
                                        <div key={fuel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: fuel.color_hex + '20', color: fuel.color_hex }}
                                                >
                                                    <Fuel className="w-6 h-6"/>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-lg text-slate-700 block">{fuel.name}</span>
                                                    <span className="text-xs text-slate-400 font-sans">{fuel.code}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400">السعر الحالي</p>
                                                    <p className="font-bold font-mono text-lg text-navy-900">{fuel.price_per_liter} <span className="text-xs">{generalSettings.currency || 'SDG'}</span></p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => { setEditingFuel(fuel); setIsFuelModalOpen(true); }}
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                                                    >
                                                        <Edit className="w-4 h-4"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteFuel(fuel.id)}
                                                        className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:bg-red-50 transition-all"
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
                    </TabPanel>


                    {/* Roles & Security */}
                    <TabPanel>
                         <div className="mt-6 grid grid-cols-1 gap-8">
                            {/* Role Management */}
                            <RoleManager roles={roles} onSave={handleSaveRole} onDelete={handleDeleteRole} />
                            
                            {/* User Management */}
                            <UserManager 
                                users={users} 
                                roles={roles} 
                                stations={stations} 
                                onSave={handleSaveUser} 
                                onCreate={handleCreateUser}
                            />
                         </div>
                    </TabPanel>
                    
                    {/* Backup & System */}
                     <TabPanel>
                        <div className="mt-6 grid grid-cols-1 gap-6 text-center">
                            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 py-12 flex flex-col items-center justify-center space-y-6 bg-slate-50/50">
                                <Database className="w-20 h-20 text-slate-300" />
                                <div>
                                    <Title>النسخ الاحتياطي للنظام</Title>
                                    <Text className="mt-2">قم بتحميل نسخة كاملة من قاعدة البيانات للحفاظ على أمان بياناتك</Text>
                                </div>
                                <a 
                                    href="/PETRODIESEL2/public/settings/backup" 
                                    target="_blank"
                                    className="px-6 py-3 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-navy-800 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    تحميل نسخة احتياطية (SQL)
                                </a>
                            </Card>
                        </div>
                    </TabPanel>
                </TabPanels>
            </TabGroup>

            {/* Fuel Edit Modal */}
            <FuelModal 
                isOpen={isFuelModalOpen} 
                onClose={() => setIsFuelModalOpen(false)} 
                fuel={editingFuel} 
                onSave={handleSaveFuel} 
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
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
            >
                <Title className="mb-4">{fuel ? 'تعديل الوقود' : 'إضافة وقود جديد'}</Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">اسم الوقود</label>
                        <TextInput value={name} onChange={(e) => setName(e.target.value)} required placeholder="مثال: بنزين 98" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">السعر (لكل لتر)</label>
                        <TextInput type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">لون التمييز</label>
                        <div className="flex gap-2">
                            {['#64748b', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-navy-900 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">إلغاء</button>
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">حفظ</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
