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
    AlertTriangle
} from 'lucide-react';
import { Card, Text, Title } from '@tremor/react';

// Modals
import AddTransactionModal from './AddTransactionModal';
import EditTransactionModal from './EditTransactionModal';
import AddAssetModal from './AddAssetModal';
import TransferModal from './TransferModal';
import ReportsModal from './ReportsModal';
import BankDetailsModal from './BankDetailsModal';
import SafeDetailsModal from './SafeDetailsModal';

export default function AccountingDashboard({ safes = [], banks = [], transactions = [], categories = [], suppliers = [], customers = [], baseUrl = '/PETRODIESEL2/public' }) {
    
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
    const [manageForm, setManageForm] = useState({ name: '', account_number: '', balance: 0 });

    const openManageModal = (type) => {
        setManageModal({ open: true, type });
        setIsAdding(false);
        setEditItem(null);
        setManageForm({ name: '', account_number: '', balance: 0 });
    };

    const handleEditInit = (item) => {
        setEditItem(item);
        setIsAdding(false);
        setManageForm({ name: item.name, account_number: item.account_number || '', balance: item.balance });
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
        if (isAdding) formData.append('balance', manageForm.balance); // Initial balance only on create

        try {
            const res = await fetch(url, { method: 'POST', body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            const data = await res.json();
            if (data.success) {
                // Determine redirect or reload. Since we are in SPA-like, ideally we refresh data.
                // For now, reload window to refresh props from server (Laravel view refresh)
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
    // Simplified: No filtering logic needed as UI filters are removed.
    // Assuming transactions prop contains the "Recent Transactions" already filtered by backend limiter if applies.
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

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="w-full min-h-screen bg-slate-50 p-8 font-cairo space-y-10"
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
            />
            <SafeDetailsModal
                isOpen={activeModal === 'safe-details'}
                onClose={closeModal}
                safeId={selectedSafeId}
            />

            {/* 2. Top Section (Stats Cards - 3 Columns) - Interactive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bank Balances - Simplified */}
                <motion.div variants={itemVariants} 
                    className="relative rounded-2xl border bg-white border-slate-100 p-6 overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <h3 className="text-slate-700 text-sm font-bold">الأرصدة البنكية</h3>
                        </div>

                        <div className="flex items-center gap-3">
                             <div className="text-xl font-bold font-mono text-slate-800">
                                {totalBankBalanceStr} <span className="text-xs text-slate-500 font-sans">ر.س</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Cash in Safes - Simplified */}
                <motion.div variants={itemVariants} 
                    className="relative rounded-2xl border bg-white border-slate-100 p-6 overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                <Vault className="w-5 h-5" />
                            </div>
                            <h3 className="text-slate-700 text-sm font-bold">النقد في الخزائن</h3>
                        </div>

                        <div className="flex items-center gap-3">
                             <div className="text-xl font-bold font-mono text-slate-800">
                                {totalSafeBalanceStr} <span className="text-xs text-slate-500 font-sans">ر.س</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Total Balance - Clickable to Reset */}
                {/* Total Balance - Simplified */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl p-6 shadow-xl shadow-emerald-900/20 flex items-center justify-between bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white relative overflow-hidden"
                >
                    {/* Glow Effects */}
                    <motion.div 
                        className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-16 -mt-16"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    ></motion.div>
                    
                    {/* Right side - Icon and Title */}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Wallet className="w-5 h-5 text-emerald-50" />
                        </div>
                        <h3 className="text-emerald-50 text-sm font-medium opacity-90">إجمالي الأصول المالية</h3>
                    </div>

                    {/* Left side - Balance */}
                    <div className="relative z-10 flex items-baseline gap-1.5">
                        <div className="text-2xl font-bold font-mono tracking-tight">
                            {totalBalanceStr}
                        </div>
                        <span className="text-sm opacity-80 font-sans">ر.س</span>
                    </div>
                </motion.div>
            </div>

            {/* 3. Middle Section (Quick Actions - 4 Column Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { title: 'إضافة إيراد', icon: Plus, color: 'emerald', action: 'income', subtitle: 'تسجيل مبيعات' },
                    { title: 'تسجيل منصرف', icon: Minus, color: 'rose', action: 'expense', subtitle: 'تسجيل مصروفات' },
                    { title: 'تحويل أرصدة', icon: ArrowRightLeft, color: 'blue', action: 'transfer', subtitle: 'بين الخزائن والبنوك' },
                ].map((item, idx) => (
                    <motion.button 
                        key={idx}
                        variants={itemVariants}
                        onClick={() => setActiveModal(item.action)}
                        className={`
                            bg-white p-4 rounded-xl shadow-sm border border-slate-100 
                            hover:shadow-lg hover:border-${item.color}-200 hover:-translate-y-1 
                            transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer
                        `}
                    >
                        <div className={`
                            p-2.5 rounded-full bg-${item.color}-50 text-${item.color}-600 
                            group-hover:bg-${item.color}-600 group-hover:text-white transition-colors
                        `}>
                            <item.icon className="w-4 h-4" />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-slate-800 text-sm group-hover:text-${item.color}-700">{item.title}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* 4. Bottom Section - Full Width */}
            <div className="w-full">
                
                {/* Recent Operations Table (Full Width) */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-base text-slate-800">العمليات الأخيرة</h3>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto relative min-h-[200px]">
                        {isFetching && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                    <span className="text-xs font-bold text-indigo-600">جاري تحميل المعاملات...</span>
                                </div>
                            </div>
                        )}
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-medium">
                                <tr>
                                    <th className="p-4 text-right">التاريخ</th>
                                    <th className="p-4 text-right">الوصف</th>
                                    <th className="p-4 text-right">المستفيد</th>
                                    <th className="p-4 text-left text-emerald-600">وارد</th>
                                    <th className="p-4 text-left text-rose-600">منصرف</th>
                                    <th className="p-4 text-left">الإجمالي</th>
                                    <th className="p-4 text-center">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction, index) => (
                                    <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-500 font-mono text-sm">{transaction.date}</td>
                                        <td className="p-4 font-medium text-slate-700">
                                            <div>{transaction.description}</div>
                                            {transaction.reference_number && (
                                                <div className="text-[10px] text-blue-500 font-bold mt-0.5 px-1.5 py-0.5 bg-blue-50 rounded inline-block">
                                                    رقم العملية: {transaction.reference_number}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm">
                                            {transaction.user_name || transaction.related_entity_type || '-'}
                                        </td>
                                        {/* Income Column */}
                                        <td className="p-4 text-left font-mono font-bold text-emerald-600" dir="ltr">
                                            {transaction.type === 'income' ? parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        {/* Expense Column */}
                                        <td className="p-4 text-left font-mono font-bold text-rose-600" dir="ltr">
                                            {transaction.type === 'expense' ? parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        {/* Total / Running Balance Column (Placeholder) */}
                                        <td className="p-4 text-left font-mono font-bold text-slate-700" dir="ltr">
                                           {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                                        </td>
                                        <td className="p-4 flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleEditClick(transaction)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="تعديل"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(transaction)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">لا توجد عمليات مسجلة</td>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
                                                setManageForm({ name: '', account_number: '', balance: 0 });
                                            }}
                                            className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                                        >
                                            <PlusCircle className="w-4 h-4" /> إضافة حساب جديد
                                        </button>
                                    </div>

                                    <div className="border rounded-xl overflow-hidden">
                                        <table className="w-full text-right">
                                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                                                <tr>
                                                    <th className="px-5 py-3">الاسم</th>
                                                    {manageModal.type === 'banks' && <th className="px-5 py-3">رقم الحساب</th>}
                                                    <th className="px-5 py-3">الرصيد الحالي</th>
                                                    <th className="px-5 py-3 text-left">إجراءات</th>
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
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${manageModal.type === 'banks' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                    {manageModal.type === 'banks' ? <Landmark className="w-4 h-4" /> : <Vault className="w-4 h-4" />}
                                                                </div>
                                                                {item.name}
                                                            </td>
                                                            {manageModal.type === 'banks' && <td className="px-5 py-3 text-sm font-mono text-slate-500">{item.account_number || '-'}</td>}
                                                            <td className="px-5 py-3 font-mono font-bold text-emerald-600" dir="ltr">
                                                                {parseFloat(item.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400">SAR</span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
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
