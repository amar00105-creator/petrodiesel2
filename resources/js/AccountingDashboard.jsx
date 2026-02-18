import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Coins, 
    TrendingUp, 
    TrendingDown, 
    ArrowRightLeft, 
    PieChart, 
    Landmark, 
    Vault, 
    Plus, 
    Minus, 
    ArrowUpRight, 
    ArrowDownRight, 
    Wallet, 
    ChevronLeft, 
    FileText, 
    Search, 
    CreditCard, 
    Settings, 
    Edit2, 
    Trash2, 
    PlusCircle, 
    X, 
    Save, 
    AlertTriangle, 
    Globe 
} from 'lucide-react';
import { Card, Text, Title } from '@tremor/react';
import { useTheme } from './components/ThemeProvider';

// Modals - Real Imports
import AddTransactionModal from './AddTransactionModal';
import AddAssetModal from './AddAssetModal';
import TransferModal from './TransferModal';
import ReportsModal from './ReportsModal';
import BankDetailsModal from './BankDetailsModal';
import SafeDetailsModal from './SafeDetailsModal';

import EditTransactionModal from './EditTransactionModal'; 
import FinancialCard from './components/dashboard/FinancialCard'; 

export default function AccountingDashboard({ safes = [], banks = [], transactions = [], categories = [], suppliers = [], customers = [], baseUrl = '/PETRODIESEL2/public', currency = 'SDG' }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    // Theme tokens
    const t = {
        pageBg: isDark ? '#0f172a' : 'linear-gradient(135deg, #f0f4ff 0%, #e8ecf4 50%, #dfe6f0 100%)',
        cardBg: isDark ? 'rgba(30,41,59,0.55)' : 'rgba(255,255,255,0.75)',
        cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        cardShadow: isDark ? '0 4px 24px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 4px 24px -4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        btnBg: isDark ? 'rgba(30,41,59,0.45)' : 'rgba(255,255,255,0.7)',
        btnBorder: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        btnShadow: isDark ? '0 2px 12px -2px rgba(0,0,0,0.3)' : '0 2px 12px -2px rgba(0,0,0,0.06)',
        textTitle: isDark ? '#94a3b8' : '#64748b',
        textValue: (p) => isDark ? p.light : p.dark,
        textSub: isDark ? '#64748b' : '#94a3b8',
        textLabel: isDark ? '#cbd5e1' : '#334155',
        textDesc: isDark ? '#e2e8f0' : '#1e293b',
        textMuted: isDark ? '#94a3b8' : '#64748b',
        textDash: isDark ? '#475569' : '#cbd5e1',
        tableHeaderBg: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(0,0,0,0.03)',
        tableRowBorder: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
        tableRowHover: (c) => isDark ? c : c.replace('0.04','0.06'),
        loadingBg: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.8)',
        filterBg: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
        filterRing: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
        glowShadow: (p) => isDark ? `0 0 20px ${p.glow}` : 'none',
        reflectionOp: isDark ? '0.03' : '0.15',
    };
    
    // --- State ---
    const [activeModal, setActiveModal] = useState(null); 
    const [selectedBankId, setSelectedBankId] = useState(null);
    const [selectedSafeId, setSelectedSafeId] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null); // For Edit
    const [filterType, setFilterType] = useState('all');
    
    // New state for card filtering
    const [selectedCard, setSelectedCard] = useState('all'); // 'all', 'banks', 'safes'
    const [selectedAccount, setSelectedAccount] = useState('all'); // specific bank/safe id or 'all'
    const [timePeriod, setTimePeriod] = useState('all'); // 'today', 'week', 'month', 'custom', 'all'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(''); 
    
    // Manage Modal State
    const [manageModal, setManageModal] = useState({ open: false, type: null }); // type: 'banks' or 'safes'
    const [editItem, setEditItem] = useState(null); // Item being edited
    const [isAdding, setIsAdding] = useState(false); // Mode: adding new item
    
    // Forms state
    const [manageForm, setManageForm] = useState({ name: '', account_number: '', balance: 0, account_scope: 'local' });

    const openManageModal = (type) => {
        setManageModal({ open: true, type });
        setIsAdding(false);
        setEditItem(null);
        setManageForm({ name: '', account_number: '', balance: 0, account_scope: 'local' });
    };

    const handleEditInit = (item) => {
        setEditItem(item);
        setIsAdding(false);
        setManageForm({ name: item.name, account_number: item.account_number || '', balance: item.balance, account_scope: item.account_scope || 'local' });
    };

    const handleManageSubmit = async (e) => {
        e.preventDefault();
        const isBank = manageModal.type === 'banks';
        const url = isAdding 
            ? (isBank ? `${window.BASE_URL || ''}/finance/createBank` : `${window.BASE_URL || ''}/finance/createSafe`)
            : (isBank ? `${window.BASE_URL || ''}/finance/updateBank` : `${window.BASE_URL || ''}/finance/updateSafe`);
        
        const formData = new FormData();
        formData.append('id', editItem?.id || '');
        formData.append('name', manageForm.name);
        if (isBank) formData.append('account_number', manageForm.account_number);
        formData.append('account_scope', manageForm.account_scope);
        if (isAdding) formData.append('balance', manageForm.balance); 

        try {
        const res = await fetch(url, { method: 'POST', body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        let data;
        try {
            data = await res.json();
        } catch (parseErr) {
            const text = await res.text().catch(() => '');
            console.error('Non-JSON response:', text);
            alert('خطأ في الخادم. الرجاء المحاولة مرة أخرى.');
            return;
        }
        if (data.success) {
            window.location.reload(); 
        } else {
            alert('فشلت العملية: ' + (data.message || 'خطأ غير معروف'));
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('حدث خطأ في الاتصال: ' + err.message);
    }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        
        const isBank = manageModal.type === 'banks';
        const url = isBank ? `${window.BASE_URL || ''}/finance/deleteBank` : `${window.BASE_URL || ''}/finance/deleteSafe`;
        
        const formData = new FormData();
        formData.append('id', id);

        try {
            const res = await fetch(url, { method: 'POST', body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert('فشل الحذف');
            }
        } catch (err) {
            alert('حدث خطأ');
        }
    }; 

    const closeModal = () => {
        setActiveModal(null);
        setSelectedBankId(null);
        setSelectedSafeId(null);
    };

    const openBankDetails = (id) => {
        setSelectedBankId(id);
        setActiveModal('bank-details');
    };

    const openSafeDetails = (id) => {
        setSelectedSafeId(id);
        setActiveModal('safe-details');
    };

    const handleEditClick = (transaction) => {
        if (transaction.related_entity_type === 'sales') {
            window.location.href = `${window.BASE_URL || ''}/sales/edit?id=${transaction.related_entity_id}`;
            return;
        }
        setSelectedTransaction(transaction);
        setActiveModal('edit_transaction');
    };

    const handleDeleteClick = async (transaction) => {
        if (!confirm('هل أنت متأكد من حذف هذه العملية؟ سيتم عكس التأثير المالي على الخزنة/البنك.')) return;

        try {
            const form = new FormData();
            form.append('id', transaction.id);

            const response = await fetch(`${window.BASE_URL || ''}/finance/deleteTransaction`, {
                method: 'POST',
                body: form,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            const data = await response.json();
            if (data.success) {
                window.location.reload(); 
            } else {
                alert(data.message || 'فشل الحذف');
            }
        } catch (error) {
            console.error(error);
            alert('حدث خطأ');
        }
    };

    // --- Calculations ---
    const totalSafeBalance = safes.reduce((sum, safe) => sum + parseFloat(safe.balance || 0), 0);
    const totalBankBalance = banks.reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);
    const totalBalance = totalSafeBalance + totalBankBalance;

    // --- Dynamic Data Fetching ---
    const [fetchedTransactions, setFetchedTransactions] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    // Effect to handle account selection changes
    React.useEffect(() => {
        if (selectedAccount !== 'all') {
            fetchAccountDetails();
        } else {
            setFetchedTransactions([]);
            setHasFetched(false);
        }
    }, [selectedAccount, selectedCard]);

    const fetchAccountDetails = async () => {
        setIsFetching(true);
        setHasFetched(false);
        try {
            const endpoint = selectedCard === 'banks' 
                ? `${window.BASE_URL || ''}/finance/getBankDetails?id=${selectedAccount}`
                : `${window.BASE_URL || ''}/finance/getSafeDetails?id=${selectedAccount}`;
            
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data.success && data.transactions) {
                setFetchedTransactions(data.transactions);
            } else {
                setFetchedTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching account details:', error);
            setFetchedTransactions([]);
        } finally {
            setIsFetching(false);
            setHasFetched(true);
        }
    };

    // Filter transactions based on selections
    const filteredTransactions = transactions;

    // Direct Stats (No dynamic filtering)
    const displayedBankBalance = banks.reduce((sum, bank) => sum + parseFloat(bank.balance || 0), 0);
    const displayedSafeBalance = safes.reduce((sum, safe) => sum + parseFloat(safe.balance || 0), 0);
    const displayedTotalBalance = displayedBankBalance + displayedSafeBalance;

    // Format display numbers
    const totalBankBalanceStr = displayedBankBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalSafeBalanceStr = displayedSafeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalBalanceStr = displayedTotalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // --- Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    // Color palette for inline styles (prevents Tailwind purging)
    const colorPalette = {
        indigo:  { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', bg: 'rgba(99,102,241,0.12)', bgHover: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.35)', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
        blue:    { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb', bg: 'rgba(59,130,246,0.12)', bgHover: 'rgba(59,130,246,0.2)', glow: 'rgba(59,130,246,0.35)', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
        emerald: { main: '#10b981', light: '#34d399', dark: '#059669', bg: 'rgba(16,185,129,0.12)', bgHover: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.35)', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        rose:    { main: '#f43f5e', light: '#fb7185', dark: '#e11d48', bg: 'rgba(244,63,94,0.12)', bgHover: 'rgba(244,63,94,0.2)', glow: 'rgba(244,63,94,0.35)', gradient: 'linear-gradient(135deg, #f43f5e, #f97316)' },
        orange:  { main: '#f97316', light: '#fb923c', dark: '#ea580c', bg: 'rgba(249,115,22,0.12)', bgHover: 'rgba(249,115,22,0.2)', glow: 'rgba(249,115,22,0.35)', gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
        purple:  { main: '#a855f7', light: '#c084fc', dark: '#9333ea', bg: 'rgba(168,85,247,0.12)', bgHover: 'rgba(168,85,247,0.2)', glow: 'rgba(168,85,247,0.35)', gradient: 'linear-gradient(135deg, #a855f7, #ec4899)' },
    };

    // Glass Card Component with inline styles
    const GlassCard = ({ title, value, subtitle, icon: Icon, color, glowColor }) => {
        const palette = colorPalette[color] || colorPalette.indigo;

        return (
            <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: `0 8px 40px -8px ${palette.glow}` }}
                className="relative overflow-hidden rounded-3xl p-6 group transition-all duration-500 cursor-default"
                style={{ 
                    background: t.cardBg,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: `1px solid ${t.cardBorder}`,
                    boxShadow: t.cardShadow,
                }}
            >
                 {/* Glow Gradient Blob */}
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150" 
                    style={{ background: palette.bg }}
                ></div>
                {/* Secondary glow */}
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100" 
                    style={{ background: palette.bg }}
                ></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className="text-sm font-bold mb-2" style={{ color: t.textTitle }}>{title}</h3>
                        <div className="text-3xl font-black font-mono" style={{ color: t.textValue(palette), textShadow: t.glowShadow(palette) }}>
                            {value} <span className="text-xs font-sans tracking-wide" style={{ color: t.textSub }}>{currency}</span>
                        </div>
                        <p className="text-[10px] mt-2 font-medium tracking-wider uppercase" style={{ color: t.textSub }}>{subtitle}</p>
                    </div>
                    <div 
                        className="p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{ 
                            background: palette.gradient,
                            color: '#fff',
                            boxShadow: `0 8px 24px -4px ${palette.glow}`,
                        }}
                    >
                        <Icon className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                </div>
                
                {/* Bottom highlight bar */}
                <div 
                    className="absolute bottom-0 left-0 w-full h-[2px] opacity-40 group-hover:opacity-100 transition-all duration-500"
                    style={{ background: `linear-gradient(to right, transparent, ${palette.main}, transparent)` }}
                ></div>
                
                {/* Top-left glass reflection */}
                <div className="absolute top-0 left-0 w-full h-1/2 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(to bottom, white, transparent)', opacity: t.reflectionOp }}
                ></div>
            </motion.div>
        );
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="w-full min-h-screen p-6 lg:p-8 font-cairo space-y-8"
            style={{ 
                fontFamily: "'Cairo', sans-serif",
                background: t.pageBg,
            }}
        >
            {/* Modals */}
            <AddTransactionModal 
                isOpen={activeModal === 'income' || activeModal === 'expense'}
                onClose={closeModal}
                type={activeModal === 'income' ? 'income' : 'expense'}
                categories={categories}
                safes={safes}
                banks={banks}
                suppliers={suppliers}
                customers={customers}
                baseUrl={baseUrl}
            />
            <AddAssetModal 
                isOpen={activeModal === 'add-safe' || activeModal === 'add-bank'}
                onClose={closeModal}
                type={activeModal === 'add-safe' ? 'safe' : 'bank'}
            />
            <TransferModal
                isOpen={activeModal === 'transfer'}
                onClose={closeModal}
                safes={safes}
                banks={banks}
            />
            <ReportsModal
                isOpen={activeModal === 'reports'}
                onClose={closeModal}
            />
            <BankDetailsModal
                isOpen={activeModal === 'bank-details'}
                onClose={closeModal}
                bankId={selectedBankId}
                currency={currency}
            />
            <SafeDetailsModal
                isOpen={activeModal === 'safe-details'}
                onClose={closeModal}
                safeId={selectedSafeId}
                currency={currency}
            />

            {/* 1. Header Section */}


            {/* 2. Top Section (Stats Cards - 3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <GlassCard 
                    title="الأرصدة البنكية"
                    value={totalBankBalanceStr}
                    subtitle="إجمالي الأرصدة في البنوك"
                    icon={Landmark}
                    color="indigo" 
                    glowColor="#6366f1"
                />

                <GlassCard 
                    title="النقد في الخزائن"
                    value={totalSafeBalanceStr}
                    subtitle="السيولة النقدية الحالية"
                    icon={Vault}
                    color="blue"  
                    glowColor="#3b82f6"
                />

                <GlassCard 
                    title="إجمالي الأصول المالية"
                    value={totalBalanceStr}
                    subtitle="البنوك + الخزائن"
                    icon={Wallet}
                    color="emerald" 
                    glowColor="#10b981"
                />
            </div>

            {/* 3. Middle Section (Quick Actions - 5 Column Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { title: 'إضافة إيراد', icon: Plus, color: 'emerald', action: 'income' },
                    { title: 'تسجيل منصرف', icon: Minus, color: 'rose', action: 'expense' },
                    { title: 'إضافة خزنة', icon: Vault, color: 'blue', action: () => openManageModal('safes'), isFunction: true },
                    { title: 'إضافة بنك', icon: Landmark, color: 'purple', action: () => openManageModal('banks'), isFunction: true },
                    { title: 'تحويل أرصدة', icon: ArrowRightLeft, color: 'orange', action: 'transfer' },
                ].map((item, idx) => {
                    const palette = colorPalette[item.color] || colorPalette.indigo;
                    return (
                        <motion.button 
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ scale: 1.06, y: -6 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => item.isFunction ? item.action() : setActiveModal(item.action)}
                            className="relative group overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 h-[110px]"
                            style={{ 
                                background: t.btnBg,
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: `1px solid ${t.btnBorder}`,
                                boxShadow: t.btnShadow,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.border = `1px solid ${palette.main}40`;
                                e.currentTarget.style.boxShadow = `0 8px 32px -8px ${palette.glow}, inset 0 1px 0 ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'}`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.border = `1px solid ${t.btnBorder}`;
                                e.currentTarget.style.boxShadow = t.btnShadow;
                            }}
                        >
                            {/* Hover glow overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                                style={{ background: `radial-gradient(circle at center, ${palette.bg}, transparent 70%)` }}
                            ></div>

                            <div 
                                className="relative z-10 p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                style={{ 
                                    background: palette.gradient,
                                    color: '#fff',
                                    boxShadow: `0 4px 16px -4px ${palette.glow}`,
                                }}
                            >
                                <item.icon className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <div className="text-center z-10 relative">
                                <div className="font-bold text-xs tracking-wide transition-colors duration-300" style={{ color: t.textLabel }}>{item.title}</div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* 4. Bottom Section - Full Width */}
            <div className="w-full">
                
                {/* Recent Operations Table (Full Width) */}
                <motion.div variants={itemVariants} className="bg-white/60 dark:bg-[#1e293b]/50 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/20 dark:ring-white/[0.08]">
                    {/* Header with inline filters */}
                    <div className="px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-50/60 to-slate-100/40 dark:from-slate-900/60 dark:to-slate-800/30 backdrop-blur-xl border-b border-slate-200/30 dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-slate-800 dark:text-white">العمليات الأخيرة</h3>
                                <p className="text-slate-400 text-[10px] font-medium tracking-wider uppercase">سجل الحركات المالية</p>
                            </div>
                        </div>
                        
                        {/* Inline Filter Buttons */}
                        <div className="flex gap-1.5 p-1 rounded-xl backdrop-blur-sm" style={{ background: t.filterBg, boxShadow: t.filterRing }}>
                            {[
                                { key: 'all', label: 'الكل', activeStyle: { background: '#1e293b', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' } },
                                { key: 'income', label: 'إيراد', activeStyle: { background: '#10b981', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' } },
                                { key: 'expense', label: 'منصرف', activeStyle: { background: '#f43f5e', color: '#fff', boxShadow: '0 4px 12px rgba(244,63,94,0.4)' } },
                                { key: 'transfer', label: 'تحويل', activeStyle: { background: '#f97316', color: '#fff', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' } },
                                { key: 'sales', label: 'مبيعات', activeStyle: { background: '#3b82f6', color: '#fff', boxShadow: '0 4px 12px rgba(59,130,246,0.4)' } },
                            ].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilterType(f.key)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                                    style={filterType === f.key ? f.activeStyle : { color: '#94a3b8' }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto relative">
                        {isFetching && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: t.loadingBg, backdropFilter: 'blur(4px)' }}>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }}></div>
                                    <span className="text-sm font-bold animate-pulse" style={{ color: '#818cf8' }}>جاري تحميل البيانات...</span>
                                </div>
                            </div>
                        )}
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr style={{ background: t.tableHeaderBg, backdropFilter: 'blur(8px)' }}>
                                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>النوع</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>التاريخ</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>الوصف</th>
                                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>المستفيد</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#34d399' }}>وارد</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#fb7185' }}>منصرف</th>
                                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: '#60a5fa' }}>الإجمالي</th>
                                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                {(filterType === 'all' 
                                    ? filteredTransactions 
                                    : filterType === 'sales'
                                        ? filteredTransactions.filter(t => t.related_entity_type === 'sales')
                                        : filteredTransactions.filter(t => t.type === filterType && t.related_entity_type !== 'sales')
                                ).map((transaction, index) => {
                                    const isSale = transaction.related_entity_type === 'sales';
                                    const isTransfer = transaction.type === 'transfer';
                                    const isIncome = transaction.type === 'income';
                                    
                                    // Color config using actual hex values (not Tailwind classes)
                                    const colorMap = isSale
                                        ? { border: '#3b82f6', iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', labelBg: 'rgba(59,130,246,0.1)', labelColor: '#60a5fa', label: 'مبيعات', Icon: CreditCard, hoverBg: 'rgba(59,130,246,0.04)' }
                                        : isTransfer
                                            ? { border: '#f97316', iconBg: 'rgba(249,115,22,0.12)', iconColor: '#f97316', labelBg: 'rgba(249,115,22,0.1)', labelColor: '#fb923c', label: 'تحويل', Icon: ArrowRightLeft, hoverBg: 'rgba(249,115,22,0.04)' }
                                            : isIncome
                                                ? { border: '#10b981', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981', labelBg: 'rgba(16,185,129,0.1)', labelColor: '#34d399', label: 'إيراد', Icon: TrendingUp, hoverBg: 'rgba(16,185,129,0.04)' }
                                                : { border: '#f43f5e', iconBg: 'rgba(244,63,94,0.12)', iconColor: '#f43f5e', labelBg: 'rgba(244,63,94,0.1)', labelColor: '#fb7185', label: 'منصرف', Icon: TrendingDown, hoverBg: 'rgba(244,63,94,0.04)' };
                                    
                                    const TypeIcon = colorMap.Icon;

                                    return (
                                        <motion.tr 
                                            key={transaction.id || index} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            transition={{ delay: index * 0.03, duration: 0.25 }}
                                            className="group transition-all duration-200"
                                            style={{ 
                                                borderLeft: `3px solid ${colorMap.border}`,
                                                borderBottom: `1px solid ${t.tableRowBorder}`,
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = colorMap.hoverBg}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Type Icon + Badge */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg" style={{ background: colorMap.iconBg, color: colorMap.iconColor }}>
                                                        <TypeIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: colorMap.labelBg, color: colorMap.labelColor }}>
                                                        {colorMap.label}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Date */}
                                            <td className="px-4 py-2.5 font-mono text-xs font-medium whitespace-nowrap" style={{ color: t.textMuted }}>
                                                {transaction.created_at ? transaction.created_at.split(' ')[0] : transaction.date}
                                            </td>
                                            {/* Description */}
                                            <td className="px-4 py-2.5 text-sm font-medium max-w-[250px]" style={{ color: t.textDesc }}>
                                                <div className="line-clamp-1">{transaction.description}</div>
                                                {transaction.reference_number && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                                                        #{transaction.reference_number}
                                                    </span>
                                                )}
                                            </td>
                                            {/* Beneficiary */}
                                            <td className="px-4 py-2.5 text-xs" style={{ color: t.textMuted }}>
                                                {transaction.user_name || transaction.related_entity_type || '-'}
                                            </td>
                                            {/* Income */}
                                            <td className="px-4 py-2.5 text-left font-mono font-bold text-xs" dir="ltr">
                                                {transaction.type === 'income' 
                                                    ? <span style={{ color: '#34d399', textShadow: isDark ? '0 0 12px rgba(16,185,129,0.4)' : 'none' }}>+ {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    : <span style={{ color: t.textDash }}>—</span>
                                                }
                                            </td>
                                            {/* Expense */}
                                            <td className="px-4 py-2.5 text-left font-mono font-bold text-xs" dir="ltr">
                                                {transaction.type === 'expense'
                                                    ? <span style={{ color: '#fb7185', textShadow: isDark ? '0 0 12px rgba(244,63,94,0.4)' : 'none' }}>- {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                    : <span style={{ color: t.textDash }}>—</span>
                                                }
                                            </td>
                                            {/* Total */}
                                            <td className="px-4 py-2.5 text-left font-mono font-bold text-xs" dir="ltr" style={{ color: t.textDesc }}>
                                               {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button 
                                                        onClick={() => handleEditClick(transaction)}
                                                        className="p-1.5 rounded-lg transition-all"
                                                        style={{ color: '#94a3b8' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                                                        title="تعديل"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(transaction)}
                                                        className="p-1.5 rounded-lg transition-all"
                                                        style={{ color: '#94a3b8' }}
                                                        onMouseEnter={e => { e.currentTarget.style.color = '#fb7185'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                </AnimatePresence>
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="p-4 rounded-full bg-white/5 text-slate-600">
                                                    <FileText className="w-8 h-8 opacity-50" />
                                                </div>
                                                <p className="text-slate-500 font-medium text-sm">لا توجد عمليات مسجلة</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* --- Manage Modal (Banks/Safes) --- */}
            {manageModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white/95 dark:bg-[#1e293b]/90 dark:backdrop-blur-2xl rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
                        {/* Header */}
                        <div className={`p-6 flex justify-between items-center bg-gradient-to-r ${manageModal.type === 'banks' ? 'from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10' : 'from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br shadow-lg ${manageModal.type === 'banks' ? 'from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'from-blue-500 to-cyan-600 shadow-blue-500/30'}`}>
                                    {manageModal.type === 'banks' ? <Landmark className="w-6 h-6 text-white" /> : <Vault className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <h2 className={`text-xl font-black ${manageModal.type === 'banks' ? 'text-indigo-800 dark:text-indigo-300' : 'text-blue-800 dark:text-blue-300'}`}>إدارة {manageModal.type === 'banks' ? 'البنوك والمصارف' : 'الخزائن النقدية'}</h2>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">إضافة وتعديل وحذف الحسابات</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setManageModal({ open: false, type: null })} 
                                className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Toggle Add View */}
                            {(isAdding || editItem) ? (
                                <form onSubmit={handleManageSubmit} className="space-y-4 bg-slate-50/80 dark:bg-white/5 p-6 rounded-xl ring-1 ring-black/[0.04] dark:ring-white/[0.06] backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-black text-slate-800 dark:text-white">{isAdding ? 'إضافة حساب جديد' : 'تعديل الحساب'}</h3>
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsAdding(false); setEditItem(null); }}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الحساب <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full p-2.5 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                            value={manageForm.name}
                                            onChange={e => setManageForm({...manageForm, name: e.target.value})}
                                            placeholder="مثلاً: بنك الراجحي"
                                        />
                                    </div>
                                    {manageModal.type === 'banks' && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الحساب / IBAN</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2.5 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none font-mono dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all"
                                                value={manageForm.account_number}
                                                onChange={e => setManageForm({...manageForm, account_number: e.target.value})}
                                                placeholder="SA..."
                                            />
                                        </div>
                                    )}
                                    {isAdding && (
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">الرصيد الافتتاحي</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-full p-2.5 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none dark:text-white backdrop-blur-sm transition-all"
                                                value={manageForm.balance}
                                                onChange={e => setManageForm({...manageForm, balance: e.target.value})}
                                            />
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">نطاق الحساب</label>
                                        <select
                                            className="w-full p-2.5 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none dark:text-white backdrop-blur-sm transition-all"
                                            value={manageForm.account_scope}
                                            onChange={e => setManageForm({...manageForm, account_scope: e.target.value})}
                                        >
                                            <option value="local" className="dark:bg-slate-800">محلي - خاص بالمحطة</option>
                                            <option value="global" className="dark:bg-slate-800">عام - لجميع المحطات</option>
                                        </select>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">الحساب العام يظهر لجميع المحطات، المحلي يظهر لهذه المحطة فقط</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsAdding(false); setEditItem(null); }}
                                            className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                                        >
                                            إلغاء
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
                                        >
                                            <Save className="w-4 h-4 inline-block ml-2" />
                                            حفظ
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 font-bold">عدد الحسابات: {(manageModal.type === 'banks' ? banks : safes).length}</div>
                                        <button 
                                            onClick={() => {
                                                setIsAdding(true);
                                                setManageForm({ name: '', account_number: '', balance: 0, account_scope: 'local' });
                                            }}
                                            className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-xl hover:shadow-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                                        >
                                            <PlusCircle className="w-4 h-4" /> إضافة حساب جديد
                                        </button>
                                    </div>

                                    <div className="ring-1 ring-black/[0.04] dark:ring-white/[0.06] rounded-xl overflow-x-auto backdrop-blur-sm">
                                        <table className="w-full text-right">
                                            <thead className="bg-slate-50/80 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                                                <tr>
                                                    <th className="px-5 py-3">الاسم</th>
                                                    {manageModal.type === 'banks' && <th className="px-5 py-3">رقم الحساب</th>}
                                                    <th className="px-5 py-3">الرصيد الحالي</th>
                                                    <th className="px-5 py-3 text-left w-32">إجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.04] bg-white/50 dark:bg-transparent">
                                                {(manageModal.type === 'banks' ? banks : safes).length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-8 text-slate-400 dark:text-slate-500">لا توجد حسابات مضافة حالياً</td>
                                                    </tr>
                                                ) : (
                                                    (manageModal.type === 'banks' ? banks : safes).map(item => (
                                                        <tr key={item.id} className="group hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                                                            <td className="px-5 py-3 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.account_scope === 'global' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : (manageModal.type === 'banks' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400')}`}>
                                                                    {item.account_scope === 'global' ? <Globe className="w-4 h-4" /> : (manageModal.type === 'banks' ? <Landmark className="w-4 h-4" /> : <Vault className="w-4 h-4" />)}
                                                                </div>
                                                                {item.name}
                                                            </td>
                                                            {manageModal.type === 'banks' && <td className="px-5 py-3 text-sm font-mono text-slate-500 dark:text-slate-400">{item.account_number || '-'}</td>}
                                                            <td className="px-5 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap" dir="ltr">
                                                                {parseFloat(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400 dark:text-slate-500">{currency}</span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button 
                                                                        onClick={() => handleEditInit(item)}
                                                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                        title="تعديل"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                                                        title="حذف"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 p-3 bg-amber-50/80 dark:bg-amber-500/5 ring-1 ring-amber-200/30 dark:ring-amber-500/10 rounded-xl flex gap-3 text-amber-800 dark:text-amber-400 text-sm backdrop-blur-sm">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        <p>تنبيه: حذف الحساب سيؤدي إلى فقدان سجله، ولكن المعاملات المرتبطة به قد تبقى في السجلات التاريخية. يفضل تعطيل الحساب بدلاً من حذفه إذا كان يحتوي على حركات مالية سابقة.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {activeModal === 'edit_transaction' && (
                <EditTransactionModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    transaction={selectedTransaction}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </motion.div>
    );
}
