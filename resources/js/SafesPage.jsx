import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Vault, 
    Plus, 
    ArrowLeft, 
    TrendingUp,
    Clock,
    DollarSign,
    FileText,
    Search,
    Filter,
    Download,
    Activity,
    Calendar,
    ChevronRight,
    Sparkles,
    BarChart3,
    Wallet,
    Lock
} from 'lucide-react';
import AddAssetModal from './AddAssetModal';

export default function SafesPage({ safes = [] }) {
    const [selectedSafe, setSelectedSafe] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // حساب إجمالي الأرصدة
    const totalBalance = safes.reduce((sum, safe) => sum + parseFloat(safe.balance || 0), 0);

    // تصفية الخزائن
    const filteredSafes = safes.filter(safe => 
        safe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8 font-cairo"
            style={{ fontFamily: "'Cairo', sans-serif" }}
        >
            {/* Modal إضافة خزينة */}
            <AddAssetModal 
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                type="safe"
            />

            {/* Header مع زر العودة */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/accounting'}
                        className="p-3 rounded-xl bg-white shadow-lg shadow-blue-900/10 text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                                <Vault className="w-7 h-7" />
                            </div>
                            النقد في الخزائن
                        </h1>
                        <p className="text-slate-500 mt-1">إدارة الخزائن النقدية والعمليات اليومية</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    إضافة خزينة جديدة
                </motion.button>
            </motion.div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <Wallet className="w-6 h-6 text-blue-200" />
                            <span className="text-blue-200 text-sm font-medium">إجمالي النقد</span>
                        </div>
                        <div className="text-4xl font-bold font-mono">
                            {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-blue-200 text-xs mt-2">ر.س</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Lock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-slate-600 text-sm font-medium">عدد الخزائن</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{safes.length}</div>
                    <div className="text-emerald-600 text-xs mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        نشط
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-slate-600 text-sm font-medium">العمليات اليوم</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">0</div>
                    <div className="text-slate-400 text-xs mt-2">لا توجد عمليات</div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-slate-600 text-sm font-medium">متوسط الرصيد</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {safes.length > 0 ? (totalBalance / safes.length).toLocaleString('en-US', { maximumFractionDigits: 0 }) : 0}
                    </div>
                    <div className="text-slate-400 text-xs mt-2">ر.س</div>
                </motion.div>
            </div>

            {/* شريط البحث والفلاتر */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن خزينة..."
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 font-medium">
                            <Filter className="w-4 h-4" />
                            فلترة
                        </button>
                        <button className="px-5 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 font-medium">
                            <Download className="w-4 h-4" />
                            تصدير
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* قائمة الخزائن */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSafes.map((safe, index) => (
                    <motion.div
                        key={safe.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer group"
                        onClick={() => setSelectedSafe(safe)}
                    >
                        {/* رأس البطاقة */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                                    <Vault className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{safe.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">خزينة نقدية</p>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* الرصيد */}
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-5 mb-4">
                            <div className="text-sm text-slate-600 mb-2">الرصيد الحالي</div>
                            <div className="text-4xl font-bold font-mono text-slate-800">
                                {parseFloat(safe.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                <span className="text-lg text-slate-500 mr-2">ر.س</span>
                            </div>
                        </div>

                        {/* إجراءات سريعة */}
                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 font-medium text-sm group-hover:bg-blue-600 group-hover:text-white">
                                <FileText className="w-4 h-4" />
                                كشف حساب
                            </button>
                            <button className="flex-1 py-2.5 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 font-medium text-sm">
                                <Activity className="w-4 h-4" />
                                العمليات
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredSafes.length === 0 && (
                <motion.div variants={itemVariants} className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Vault className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد خزائن</h3>
                    <p className="text-slate-500 mb-6">ابدأ بإضافة خزينة جديدة لإدارة نقدك</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2 font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة خزينة جديدة
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}
