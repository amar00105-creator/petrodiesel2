import React, { useState } from 'react';

import { 
    Vault, 
    TrendingUp, 
    Wallet,
    Activity,
    BarChart3,
    Sparkles,
    Trash2,
    Globe,
    MapPin,
    FileText
} from 'lucide-react';
import AddAssetModal from './AddAssetModal';
import GlobalTable from './components/GlobalTable';
import { toast } from 'sonner';

export default function SafesPage({ safes = [], pendingRequests = [], currency = 'SDG' }) {
    const [selectedSafe, setSelectedSafe] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Stats Calculation
    const totalBalance = safes.reduce((sum, safe) => sum + parseFloat(safe.balance || 0), 0);
    const localSafes = safes.filter(s => s.account_scope === 'local');
    const globalSafes = safes.filter(s => s.account_scope === 'global');

    // Columns for GlobalTable
    const columns = [
        { header: 'اسم الخزينة', accessor: 'name', render: (item) => (
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${item.account_scope === 'global' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                    {item.account_scope === 'global' ? <Globe className="w-5 h-5" /> : <span className="text-sm font-bold">{item.name.substring(0, 2)}</span>}
                </div>
                <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">
                        {item.account_scope === 'global' ? 'خزينة عامة' : 'خزينة محلية'}
                    </div>
                </div>
            </div>
        )},
        { header: 'النطاق', accessor: 'account_scope', render: (item) => (
            <div>
                {item.account_scope === 'global' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100">
                        <Globe className="w-3 h-3" /> عامة
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                        <MapPin className="w-3 h-3" /> محلية
                    </span>
                )}
            </div>
        )},
        { header: 'الرصيد الحالي', accessor: 'balance', className: 'font-bold text-navy-900', render: (item) => (
            <div className="flex items-center gap-1">
                <span className="font-mono text-lg">{parseFloat(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-slate-400">{currency}</span>
            </div>
        )},
        { header: 'الحالة', accessor: 'is_active', render: (item) => {
            const isActive = item.is_active === 1 || item.is_active === true;
            return isActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                    <Sparkles className="w-3 h-3" /> نشط
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100">
                    غير نشط
                </span>
            );
        }}
    ];

    const actions = (item) => (
        <div className="flex items-center gap-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="كشف حساب">
                <FileText className="w-4 h-4"/>
            </button>
            <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="العمليات">
                <Activity className="w-4 h-4"/>
            </button>
            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف" onClick={() => toast.error('الحذف غير متاح حالياً')}>
                <Trash2 className="w-4 h-4"/>
            </button>
        </div>
    );

    // DEBUG MODE: Minimal render to identify crash source
    return (
        <div key="safes-page-root" className="min-h-screen bg-slate-50/50 p-6 font-cairo">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Vault className="w-6 h-6" />
                            </div>
                            النقد في الخزائن
                        </h1>
                        <p className="text-slate-500 mt-1">إدارة السيولة النقدية في الخزائن المحلية والعامة</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
                        >
                            <Sparkles className="w-5 h-5" />
                            إضافة خزينة جديدة
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Balance */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2 text-slate-300">
                                <Wallet className="w-5 h-5" />
                                <span className="font-bold">إجمالي السيولة</span>
                            </div>
                            <div className="text-4xl font-bold font-mono tracking-tight">
                                {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                <span className="text-lg text-slate-400 font-sans mx-2">{currency}</span>
                            </div>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all"></div>
                    </div>

                    {/* Local Safes Count */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 group hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-slate-500 font-bold mb-1">خزائن محلية</div>
                                <div className="text-3xl font-bold text-slate-800">{localSafes.length}</div>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Global Safes Count */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 group hover:border-purple-200 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-slate-500 font-bold mb-1">خزائن عامة</div>
                                <div className="text-3xl font-bold text-slate-800">{globalSafes.length}</div>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Globe className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Requests Section */}
                {pendingRequests && pendingRequests.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                            <Activity className="w-6 h-6 animate-pulse" />
                            عمليات تحويل معلقة (بانتظار موافقة الإدارة)
                        </h2>
                        <div className="grid gap-3">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-red-100 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-lg">
                                                تحويل إلى خزينة/بنك عالمي
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <span>من: <span className="font-semibold text-slate-700">{req.from_safe_name}</span></span>
                                                <span className="text-slate-300">|</span>
                                                <span>إلى: <span className="font-semibold text-slate-700">{req.to_safe_name || req.to_bank_name}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-2xl font-black text-red-600 font-mono">
                                            -{parseFloat(req.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded-md">
                                            معلق (Suspended)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Safes Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                            <BarChart3 className="w-5 h-5 text-slate-500" />
                            قائمة الخزائن
                        </div>
                    </div>
                    
                    <GlobalTable 
                        data={safes} 
                        columns={columns} 
                        actions={actions} 
                        searchPlaceholder="بحث عن خزينة..."
                        emptyMessage="لا توجد خزائن مسجلة"
                    />
                </div>
            </div>

            {/* Add Safe Modal */}
            <AddAssetModal 
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                type="safe"
            />
        </div>
    );
}
