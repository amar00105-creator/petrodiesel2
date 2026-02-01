import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Landmark, 
    TrendingUp, 
    DollarSign,
    FileText,
    Activity,
    BarChart3,
    Sparkles,
    Trash2,
    Edit,
    Globe
} from 'lucide-react';
import AddAssetModal from './AddAssetModal';
import GlobalTable from './components/GlobalTable';
import { toast } from 'sonner';

export default function BanksPage({ banks = [], pendingRequests = [], currency = 'SDG' }) {
    const [selectedBank, setSelectedBank] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Stats Calculation
    const totalBalance = banks.reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);

    // Columns for GlobalTable
    const columns = [
        { header: 'اسم البنك', accessor: 'name', render: (item) => (
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${item.account_scope === 'global' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'}`}>
                    {item.account_scope === 'global' ? <Globe className="w-5 h-5" /> : <span className="text-sm font-bold">{item.name.substring(0, 2)}</span>}
                </div>
                <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{item.account_number}</div>
                </div>
            </div>
        )},
        { header: 'رقم الحساب', accessor: 'account_number', className: 'font-mono text-slate-600' },
        { header: 'الرصيد الحالي', accessor: 'balance', className: 'font-bold text-navy-900', render: (item) => (
            <div className="flex items-center gap-1">
                <span className="font-mono text-lg">{parseFloat(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-slate-400">{currency}</span>
            </div>
        )},
        { header: 'الحالة', accessor: 'status', render: () => (
             <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                <Sparkles className="w-3 h-3" /> نشط
             </span>
        )}
    ];

    const actions = (item) => (
        <div className="flex items-center gap-2">
            <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="كشف حساب">
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

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-50/50 p-6 font-cairo"
        >
            <AddAssetModal 
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                type="bank"
            />

            <div className="max-w-[1800px] mx-auto space-y-8">
                
                {/* Custom Header & Stats Area (Preserving the 4-column layout) */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                    <Landmark className="w-7 h-7" />
                                </div>
                                الأرصدة البنكية
                            </h1>
                            <p className="text-slate-500 mt-2 mr-16">إدارة الحسابات البنكية والعمليات المالية</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <DollarSign className="w-6 h-6 text-indigo-200" />
                                    <span className="text-indigo-200 text-sm font-medium">إجمالي الأرصدة</span>
                                </div>
                                <div className="text-4xl font-bold font-mono">
                                    {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-indigo-200 text-xs mt-2">{currency}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-slate-600 text-sm font-medium">عدد البنوك</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-800">{banks.length}</div>
                            <div className="text-emerald-600 text-xs mt-2 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                نشط
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-slate-600 text-sm font-medium">العمليات اليوم</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-800">0</div>
                            <div className="text-slate-400 text-xs mt-2">لا توجد عمليات</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-slate-600 text-sm font-medium">متوسط الرصيد</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-800">
                                {banks.length > 0 ? (totalBalance / banks.length).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}
                            </div>
                            <div className="text-slate-400 text-xs mt-2">{currency}</div>
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
                                            <Landmark className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 text-lg">
                                                تحويل إلى خزينة/بنك عالمي
                                            </div>
                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                <span>من: <span className="font-semibold text-slate-700">{req.from_bank_name}</span></span>
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

                {/* The Global Table */}
                <GlobalTable 
                    title="قائمة البنوك" 
                    subtitle="عرض تفصيلي للحسابات البنكية"
                    data={banks}
                    columns={columns}
                    actions={actions}
                    onAdd={() => setShowAddModal(true)}
                    addButtonLabel="إضافة بنك جديد"
                    searchPlaceholder="بحث عن بنك..."
                    exportName="banks"
                />
            </div>
        </motion.div>
    );
}
