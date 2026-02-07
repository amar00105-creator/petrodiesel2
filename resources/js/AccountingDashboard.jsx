import React, { useState } from 'react';
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
            const data = await res.json();
            if (data.success) {
                window.location.reload(); 
            } else {
                alert('فشلت العملية: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('حدث خطأ في الاتصال');
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

    // Glass Card Component
    const GlassCard = ({ title, value, subtitle, icon: Icon, color, glowColor }) => {
        // Color mapping for borders and shadows to ensure Tailwind picks them up
        const styles = {
            indigo: { border: 'border-indigo-500/30', hoverBorder: 'hover:border-indigo-400', shadow: 'shadow-indigo-500/20' },
            blue: { border: 'border-blue-500/30', hoverBorder: 'hover:border-blue-400', shadow: 'shadow-blue-500/20' },
            emerald: { border: 'border-emerald-500/30', hoverBorder: 'hover:border-emerald-400', shadow: 'shadow-emerald-500/20' },
            rose: { border: 'border-rose-500/30', hoverBorder: 'hover:border-rose-400', shadow: 'shadow-rose-500/20' },
            orange: { border: 'border-orange-500/30', hoverBorder: 'hover:border-orange-400', shadow: 'shadow-orange-500/20' },
            purple: { border: 'border-purple-500/30', hoverBorder: 'hover:border-purple-400', shadow: 'shadow-purple-500/20' },
        };

        const currentStyle = styles[color] || styles.indigo;

        return (
            <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: `0 0 30px -5px ${glowColor}50` }}
                className={`
                    relative overflow-hidden rounded-2xl p-6
                    bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl
                    ${currentStyle.border} ${currentStyle.hoverBorder}
                    shadow-lg shadow-slate-200/50 dark:shadow-black/50
                    group transition-all duration-300
                `}
            >
                 {/* Glow Gradient Blob */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all duration-500`}></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-2">{title}</h3>
                        <div className={`text-3xl font-bold font-mono text-${color}-600 dark:text-${color}-400 drop-shadow-[0_0_8px_rgba(var(--color-${color}-400),0.5)]`}>
                            {value} <span className="text-xs text-slate-500 font-sans tracking-wide">{currency}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide uppercase">{subtitle}</p>
                    </div>
                    <div className={`
                        p-3.5 rounded-xl 
                        bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 
                        text-${color}-400 
                        shadow-[0_0_15px_-3px_rgba(0,0,0,0.5)]
                        group-hover:text-${color}-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_-5px_${glowColor}] transition-all duration-300
                    `}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                
                {/* Bottom highlight line */}
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-${color}-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </motion.div>
        );
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="w-full min-h-screen bg-slate-50 dark:bg-[#0F172A] p-6 lg:p-8 font-cairo space-y-8 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-900 dark:via-[#0F172A] dark:to-black"
            style={{ fontFamily: "'Cairo', sans-serif" }}
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


            {/* 2. Top Section (Stats Cards - 3 Columns) - Interactive Cards */}
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
                    { title: 'إضافة إيراد', icon: Plus, color: 'emerald', action: 'income', subtitle: 'تسجيل مبيعات' },
                    { title: 'تسجيل منصرف', icon: Minus, color: 'rose', action: 'expense', subtitle: 'تسجيل مصروفات' },
                    { title: 'إضافة خزنة', icon: Vault, color: 'blue', action: () => openManageModal('safes'), subtitle: 'خزنة نقدية جديدة', isFunction: true },
                    { title: 'إضافة بنك', icon: Landmark, color: 'purple', action: () => openManageModal('banks'), subtitle: 'حساب بنكي جديد', isFunction: true },
                    { title: 'تحويل أرصدة', icon: ArrowRightLeft, color: 'orange', action: 'transfer', subtitle: 'بين الخزائن والبنوك' },
                ].map((item, idx) => (
                    <motion.button 
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => item.isFunction ? item.action() : setActiveModal(item.action)}
                        className={`
                            relative group overflow-hidden
                            bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-md
                            p-3 rounded-2xl
                            border border-${item.color}-500/30 hover:border-${item.color}-500
                            shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-[0_0_20px_rgba(var(--color-${item.color}-500),0.4)]
                            flex flex-col items-center justify-center gap-2 cursor-pointer
                            transition-all duration-300
                            h-[100px]
                        `}
                    >
                        {/* Hover Overlay */}
                        <div className={`absolute inset-0 bg-${item.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                        <div className={`
                            relative z-10 p-2 rounded-full 
                            bg-slate-100 dark:bg-slate-900/50 border border-${item.color}-500/20
                            text-${item.color}-400 
                            group-hover:text-${item.color}-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_${item.color}]
                            transition-all duration-300
                        `}>
                            <item.icon className="w-5 h-5 drop-shadow-md" />
                        </div>
                        <div className="text-center z-10 relative">
                            <div className="font-bold text-slate-700 dark:text-slate-200 text-xs group-hover:text-slate-900 dark:group-hover:text-white transition-colors tracking-wide">{item.title}</div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* 4. Bottom Section - Full Width */}
            <div className="w-full">
                
                {/* Recent Operations Table (Full Width) */}
                <motion.div variants={itemVariants} className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/40 dark:bg-slate-900/40">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                <span className="drop-shadow-sm">العمليات الأخيرة</span>
                            </h3>
                            <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">سجل الحركات المالية اليومية</p>
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Filter Buttons could go here */}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto relative min-h-[300px]">
                        {isFetching && (
                            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-indigo-400 animate-pulse">جاري تحميل البيانات...</span>
                                </div>
                            </div>
                        )}
                        <table className="w-full text-right border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-white/5 uppercase tracking-wider backdrop-blur-sm">
                                <tr>
                                    <th className="p-5 text-right">التاريخ</th>
                                    <th className="p-5 text-right w-1/3">الوصف</th>
                                    <th className="p-5 text-right">المستفيد</th>
                                    <th className="p-5 text-left text-emerald-400">وارد</th>
                                    <th className="p-5 text-left text-rose-400">منصرف</th>
                                    <th className="p-5 text-left text-blue-400">الإجمالي</th>
                                    <th className="p-5 text-center">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                                {filteredTransactions.map((transaction, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-5 font-mono text-sm text-slate-400 font-medium">
                                            {transaction.created_at ? transaction.created_at.split(' ')[0] : transaction.date}
                                        </td>
                                        <td className="p-5 font-medium text-slate-800 dark:text-slate-200">
                                            <div className="line-clamp-2">{transaction.description}</div>
                                            {transaction.reference_number && (
                                                <div className="text-[10px] text-blue-300 font-bold mt-1 px-2 py-0.5 bg-blue-500/10 rounded-full inline-block border border-blue-500/20">
                                                    #{transaction.reference_number}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-slate-400 text-sm">
                                            {transaction.user_name || transaction.related_entity_type || '-'}
                                        </td>
                                        {/* Income Column */}
                                        <td className="p-5 text-left font-mono font-bold text-emerald-400 text-sm drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]" dir="ltr">
                                            {transaction.type === 'income' ? `+ ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        {/* Expense Column */}
                                        <td className="p-5 text-left font-mono font-bold text-rose-400 text-sm drop-shadow-[0_0_10px_rgba(244,63,94,0.2)]" dir="ltr">
                                            {transaction.type === 'expense' ? `- ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                        </td>
                                        {/* Amount Column */}
                                        <td className="p-5 text-left font-mono font-bold text-slate-800 dark:text-slate-200 text-sm" dir="ltr">
                                           {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                                        </td>
                                        <td className="p-5 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button 
                                                onClick={() => handleEditClick(transaction)}
                                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
                                                title="تعديل"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(transaction)}
                                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="p-5 rounded-full bg-white/5 border border-white/5 text-slate-600">
                                                    <FileText className="w-10 h-10 opacity-50" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${manageModal.type === 'banks' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {manageModal.type === 'banks' ? <Landmark className="w-6 h-6" /> : <Vault className="w-6 h-6" />}
                                </div>
                                <div>
                                    <Title>إدارة {manageModal.type === 'banks' ? 'البنوك والمصارف' : 'الخزائن النقدية'}</Title>
                                    <Text className="text-xs">إضافة وتعديل وحذف الحسابات</Text>
                                </div>
                            </div>
                            <button 
                                onClick={() => setManageModal({ open: false, type: null })} 
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Toggle Add View */}
                            {(isAdding || editItem) ? (
                                <form onSubmit={handleManageSubmit} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-slate-800">{isAdding ? 'إضافة حساب جديد' : 'تعديل الحساب'}</h3>
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsAdding(false); setEditItem(null); }}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">اسم الحساب <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={manageForm.name}
                                            onChange={e => setManageForm({...manageForm, name: e.target.value})}
                                            placeholder="مثلاً: بنك الراجحي"
                                        />
                                    </div>
                                    {manageModal.type === 'banks' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">رقم الحساب / IBAN</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                                value={manageForm.account_number}
                                                onChange={e => setManageForm({...manageForm, account_number: e.target.value})}
                                                placeholder="SA..."
                                            />
                                        </div>
                                    )}
                                    {isAdding && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">الرصيد الافتتاحي</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={manageForm.balance}
                                                onChange={e => setManageForm({...manageForm, balance: e.target.value})}
                                            />
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">نطاق الحساب</label>
                                        <select
                                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            value={manageForm.account_scope}
                                            onChange={e => setManageForm({...manageForm, account_scope: e.target.value})}
                                        >
                                            <option value="local">محلي - خاص بالمحطة</option>
                                            <option value="global">عام - لجميع المحطات</option>
                                        </select>
                                        <p className="text-xs text-slate-500 mt-1">الحساب العام يظهر لجميع المحطات، المحلي يظهر لهذه المحطة فقط</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsAdding(false); setEditItem(null); }}
                                            className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg"
                                        >
                                            إلغاء
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                        >
                                            <Save className="w-4 h-4 inline-block ml-2" />
                                            حفظ
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-sm text-slate-500 font-bold">عدد الحسابات: {(manageModal.type === 'banks' ? banks : safes).length}</div>
                                        <button 
                                            onClick={() => {
                                                setIsAdding(true);
                                                setManageForm({ name: '', account_number: '', balance: 0, account_scope: 'local' });
                                            }}
                                            className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                                        >
                                            <PlusCircle className="w-4 h-4" /> إضافة حساب جديد
                                        </button>
                                    </div>

                                    <div className="border rounded-xl overflow-x-auto">
                                        <table className="w-full text-right">
                                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                                                <tr>
                                                    <th className="px-5 py-3">الاسم</th>
                                                    {manageModal.type === 'banks' && <th className="px-5 py-3">رقم الحساب</th>}
                                                    <th className="px-5 py-3">الرصيد الحالي</th>
                                                    <th className="px-5 py-3 text-left w-32">إجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {(manageModal.type === 'banks' ? banks : safes).length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-8 text-slate-400">لا توجد حسابات مضافة حالياً</td>
                                                    </tr>
                                                ) : (
                                                    (manageModal.type === 'banks' ? banks : safes).map(item => (
                                                        <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="px-5 py-3 font-bold text-slate-700 flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.account_scope === 'global' ? 'bg-purple-100 text-purple-600' : (manageModal.type === 'banks' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600')}`}>
                                                                    {item.account_scope === 'global' ? <Globe className="w-4 h-4" /> : (manageModal.type === 'banks' ? <Landmark className="w-4 h-4" /> : <Vault className="w-4 h-4" />)}
                                                                </div>
                                                                {item.name}
                                                            </td>
                                                            {manageModal.type === 'banks' && <td className="px-5 py-3 text-sm font-mono text-slate-500">{item.account_number || '-'}</td>}
                                                            <td className="px-5 py-3 font-mono font-bold text-emerald-600 whitespace-nowrap" dir="ltr">
                                                                {parseFloat(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400">{currency}</span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button 
                                                                        onClick={() => handleEditInit(item)}
                                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                                        title="تعديل"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(item.id)}
                                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
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
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-amber-800 text-sm">
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
