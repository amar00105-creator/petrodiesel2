import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Wallet,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    BarChart3,
    LineChart,
    Landmark,
    Vault,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    Filter,
    Sparkles,
    Activity,
    CreditCard,
    Target
} from 'lucide-react';

export default function FinancialAssetsPage({ banks = [], safes = [] }) {
    const [timeFilter, setTimeFilter] = useState('month');

    // حساب الإحصائيات
    const totalBankBalance = banks.reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);
    const totalSafeBalance = safes.reduce((sum, safe) => sum + parseFloat(safe.balance || 0), 0);
    const totalBalance = totalBankBalance + totalSafeBalance;

    // نسب التوزيع
    const bankPercentage = totalBalance > 0 ? (totalBankBalance / totalBalance * 100) : 0;
    const safePercentage = totalBalance > 0 ? (totalSafeBalance / totalBalance * 100) : 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 400, damping: 25 }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-50/30 p-8 font-cairo"
            style={{ fontFamily: "'Cairo', sans-serif" }}
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/accounting'}
                        className="p-3 rounded-xl bg-white shadow-lg shadow-emerald-900/10 text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                                <Wallet className="w-7 h-7" />
                            </div>
                            إجمالي الأصول المالية
                        </h1>
                        <p className="text-slate-500 mt-1">نظرة شاملة على جميع الأصول والأرصدة المالية</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {['week', 'month', 'year'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                                timeFilter === filter 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                                    : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {filter === 'week' ? 'أسبوع' : filter === 'month' ? 'شهر' : 'سنة'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* المجموع الكلي - بطاقة كبيرة */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-3xl p-10 mb-8 text-white shadow-2xl shadow-emerald-900/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="w-6 h-6 text-emerald-200" />
                                <span className="text-emerald-100 text-lg font-medium">إجمالي الأصول المالية</span>
                            </div>
                            <div className="text-6xl font-bold font-mono tracking-tight">
                                {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                <span className="text-2xl text-emerald-200 mr-3">ر.س</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl mb-3">
                                <TrendingUp className="w-5 h-5 text-emerald-100" />
                                <span className="font-bold text-lg">+5.2%</span>
                            </div>
                            <span className="text-emerald-200 text-sm">مقارنة بالشهر الماضي</span>
                        </div>
                    </div>

                    {/* شريط التوزيع */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-emerald-100 text-sm font-medium">توزيع الأصول</span>
                        </div>
                        <div className="flex gap-2 h-4 rounded-full overflow-hidden mb-4">
                            <div 
                                className="bg-indigo-400 transition-all"
                                style={{ width: `${bankPercentage}%` }}
                            ></div>
                            <div 
                                className="bg-blue-400 transition-all"
                                style={{ width: `${safePercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                                <span className="text-emerald-100">البنوك ({bankPercentage.toFixed(1)}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="text-emerald-100">الخزائن ({safePercentage.toFixed(1)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* الإحصائيات التفصيلية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <Landmark className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
                            <TrendingUp className="w-4 h-4" />
                            +3.1%
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">الأرصدة البنكية</div>
                    <div className="text-3xl font-bold font-mono text-slate-800">
                        {totalBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{banks.length} بنك نشط</div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Vault className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
                            <TrendingUp className="w-4 h-4" />
                            +2.8%
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">النقد في الخزائن</div>
                    <div className="text-3xl font-bold font-mono text-slate-800">
                        {totalSafeBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{safes.length} خزينة نشطة</div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex items-center gap-1 text-rose-600 text-sm font-bold bg-rose-50 px-3 py-1 rounded-full">
                            <TrendingDown className="w-4 h-4" />
                            -1.2%
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">حركة الأموال</div>
                    <div className="text-3xl font-bold font-mono text-slate-800">0</div>
                    <div className="text-xs text-slate-500 mt-2">عملية هذا الشهر</div>
                </motion.div>
            </div>

            {/* تفاصيل البنوك والخزائن */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* البنوك */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Landmark className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">الحسابات البنكية</h3>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/accounting/banks'}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
                        >
                            عرض الكل
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {banks.slice(0, 5).map((bank, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                        {bank.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{bank.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{bank.account_number}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-slate-800">
                                        {parseFloat(bank.balance).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-slate-500">ر.س</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* الخزائن */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Vault className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">الخزائن النقدية</h3>
                        </div>
                        <button 
                            onClick={() => window.location.href = '/accounting/safes'}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                            عرض الكل
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {safes.slice(0, 5).map((safe, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                                        <Vault className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{safe.name}</div>
                                        <div className="text-xs text-slate-500">خزينة نقدية</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-slate-800">
                                        {parseFloat(safe.balance).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-slate-500">ر.س</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
