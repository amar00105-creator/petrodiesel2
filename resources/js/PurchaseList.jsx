import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Building2, CheckCircle, Clock, Activity, Droplet, Edit, Trash2, Search, Filter, RefreshCw, Database, Calendar, Plus, Printer, User, Hash, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { openPrintPreview, extractTableHTML } from './utils/printPreview';
import GlobalTable from './components/GlobalTable';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DischargeModal from './DischargeModal';

export default function PurchaseList({ purchases = [], tanks = [], currency = 'SDG' }) {
    // State
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState(''); // 'supplier', 'status', 'fuel'
    const [filterValue, setFilterValue] = useState('');
    const [date, setDate] = useState('');

    // Modals State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dischargeModalOpen, setDischargeModalOpen] = useState(false);

    // Helpers
    const isDelayed = (dateStr) => {
        if (!dateStr) return false;
        const diffTime = Math.abs(new Date() - new Date(dateStr));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays > 10;
    };

    // Normalize Data
    const normalizedPurchases = (purchases || []).map(p => ({
        ...p,
        supplier: p.supplier_name || 'غير محدد',
        driver: p.driver_name_resolved || p.driver_name || '-',
        fuel: p.fuel_type_name || 'غير محدد',
        status_label: p.status === 'completed' ? 'تم التفريغ' : (p.status === 'ordered' ? 'شاحن' : p.status),
        date_formatted: p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '-'
    }));

     // Dynamic Filter Options
     const getFilterOptions = () => {
        if (!filterType) return [];
        const options = new Set();
        normalizedPurchases.forEach(p => {
            if (filterType === 'supplier') options.add(p.supplier);
            else if (filterType === 'status') options.add(p.status_label);
            else if (filterType === 'fuel') options.add(p.fuel);
            else if (filterType === 'driver') options.add(p.driver);
        });
        return Array.from(options).filter(v => v && v !== '-').sort();
    };

    const filteredPurchases = normalizedPurchases.filter(p => {
        const matchesSearch = 
            p.invoice_number.toString().includes(search) || 
            p.supplier.toLowerCase().includes(search.toLowerCase()) ||
            p.driver.toLowerCase().includes(search.toLowerCase());

         // Dynamic Filtering Logic
         let matchesFilter = true;
         if (filterType && filterValue) {
             if (filterType === 'supplier') matchesFilter = p.supplier === filterValue;
             else if (filterType === 'status') matchesFilter = p.status_label === filterValue;
             else if (filterType === 'fuel') matchesFilter = p.fuel === filterValue;
             else if (filterType === 'driver') matchesFilter = p.driver === filterValue;
         }

         // Date Filter
         let matchesDate = true;
         if (date) {
            const pDate = new Date(p.created_at || p.date).toISOString().split('T')[0];
            matchesDate = pDate === date;
         }

         return matchesSearch && matchesFilter && matchesDate;
    });

    const resetFilters = () => {
        setFilterType('');
        setFilterValue('');
        setSearch('');
        setDate('');
    };

    const hasActiveFilters = !!(filterType || search || date);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const form = new FormData();
        form.append('id', itemToDelete.id);
        try {
            const response = await fetch(`${window.BASE_URL}/purchases/delete_ajax`, { method: 'POST', body: form });
            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { throw new Error("Invalid Server Response"); }
            if (data.success) {
                toast.success('تم حذف الفاتورة بنجاح');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error(data.message || 'فشل عملية الحذف');
            }
        } catch (e) {
            toast.error('خطأ في الاتصال بالخادم');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    // Shared input class
    const inputClass = "w-full h-10 px-3 text-sm rounded-xl border border-slate-200/80 bg-white text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:bg-slate-800/60 dark:border-white/10 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-blue-400/20 dark:focus:border-blue-500/50";
    const selectClass = "w-full h-10 px-3 text-sm rounded-xl border border-slate-200/80 bg-white text-slate-700 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer appearance-none dark:bg-slate-800/60 dark:border-white/10 dark:text-slate-200 dark:focus:ring-blue-400/20 dark:focus:border-blue-500/50";

    // Column Definitions — Reordered: التاريخ → الفاتورة → المورد → السائق → الوقود → الكمية → الإجمالي → الحالة
    const columns = [
        { header: 'التاريخ', accessor: 'date_formatted', className: 'text-slate-600 dark:text-slate-300', render: (item) => (
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="font-medium text-sm">{item.date_formatted}</span>
            </div>
        )},
        { header: 'رقم الفاتورة', accessor: 'invoice_number', render: (item) => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm dark:bg-blue-500/10 dark:text-blue-300">
                <Hash className="w-3.5 h-3.5" />{item.invoice_number}
            </span>
        )},
        { header: 'المورد', accessor: 'supplier', render: (item) => (
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400"/>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">{item.supplier}</span>
            </div>
        )},
        { header: 'السائق', accessor: 'driver', render: (item) => (
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                    <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400"/>
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.driver}</span>
            </div>
        )},
        { header: 'نوع الوقود', accessor: 'fuel', render: (item) => (
            <div className="flex items-center gap-2">
                <Droplet className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400"/>
                <span className="font-bold text-slate-700 dark:text-slate-200">{item.fuel}</span>
            </div>
        )},
        { header: 'الكمية (L)', accessor: 'volume_ordered', render: (item) => (
            <span className="font-bold text-slate-800 dark:text-slate-100">
                {Number(item.volume_received || item.volume_ordered || 0).toLocaleString()}
            </span>
        )},
        { header: `الاجمالي (${currency})`, accessor: 'total_cost', render: (item) => (
            <div className="flex items-center gap-1">
                <span className="font-black text-emerald-600 dark:text-emerald-400">{Number(item.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-emerald-400/70 dark:text-emerald-500/70 font-medium">{currency}</span>
            </div>
        )},
        { header: 'الحالة', accessor: 'status', render: (item) => {
            const isDelayedShipping = (item.status === 'ordered' || item.status === 'pending') && isDelayed(item.created_at);
            if (item.status === 'completed') {
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> تم التفريغ
                    </span>
                );
            }
            return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${
                    isDelayedShipping 
                        ? 'bg-red-50 text-red-600 ring-red-200/50 animate-pulse dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20' 
                        : 'bg-amber-50 text-amber-600 ring-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20'
                }`}>
                    {isDelayedShipping ? <Activity className="w-3.5 h-3.5 animate-bounce" /> : <Truck className="w-3.5 h-3.5" />}
                    {isDelayedShipping ? 'شاحن (تأخير)' : 'شاحن'}
                </span>
            );
        }}
    ];

    // Actions
    const renderActions = (item) => (
        <>
            {item.status !== 'completed' && (
                <button 
                    onClick={() => setDischargeModalOpen(true)}
                    title="تفريغ الشحنة"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                    <Droplet className="w-4 h-4"/>
                </button>
            )}
            <a href={`${window.BASE_URL}/purchases/edit?id=${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"><Edit className="w-4 h-4"/></a>
            <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
        </>
    );

    return (
        <div className="p-6 max-w-[1800px] mx-auto print:p-0 print:max-w-none space-y-6">
            
            {/* Filters Bar — Glassmorphism */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/60 p-4 dark:bg-slate-900/60 dark:backdrop-blur-2xl dark:shadow-black/20 dark:ring-white/[0.08]"
            >
                <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none"/>
                        <input 
                            type="text"
                            placeholder="بحث بالفاتورة، المورد، السائق..." 
                            className={`${inputClass} pr-9`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Separator */}
                    <div className="h-7 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

                    {/* Filter Type Select */}
                    <div className="relative w-[150px]">
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none"/>
                        <select 
                            value={filterType} 
                            onChange={(e) => { setFilterType(e.target.value); setFilterValue(''); }}
                            className={`${selectClass} pr-9`}
                        >
                            <option value="">نوع الفلترة</option>
                            <option value="supplier">المورد</option>
                            <option value="driver">السائق</option>
                            <option value="status">الحالة</option>
                            <option value="fuel">الوقود</option>
                        </select>
                    </div>

                    {/* Filter Value Select */}
                    <div className="relative w-[160px]">
                        <Database className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none"/>
                        <select 
                            value={filterValue} 
                            onChange={(e) => setFilterValue(e.target.value)} 
                            disabled={!filterType}
                            className={`${selectClass} pr-9 disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            <option value="">القيمة...</option>
                            {getFilterOptions().map((opt, idx) => (
                                <option key={idx} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="relative w-[150px]">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5 pointer-events-none"/>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className={`${inputClass} pr-9`}
                        />
                    </div>

                    {/* Reset */}
                    <button 
                        onClick={resetFilters}
                        title="إعادة تعيين"
                        className={`p-2.5 rounded-xl transition-all ${
                            hasActiveFilters 
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 ring-1 ring-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:ring-red-500/20' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-500 dark:hover:bg-white/10'
                        }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${hasActiveFilters ? 'animate-spin' : ''}`} style={hasActiveFilters ? { animationDuration: '2s' } : {}} />
                    </button>

                    {/* Separator */}
                    <div className="h-7 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

                    {/* Action Buttons — pushed right */}
                    <div className="flex items-center gap-2 mr-auto">
                        <button 
                            onClick={() => window.location.href = `${window.BASE_URL}/purchases/create`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            فاتورة جديدة
                        </button>
                        
                        <button 
                            onClick={() => {
                                const content = extractTableHTML('.overflow-x-auto');
                                openPrintPreview({
                                    title: 'سجل المشتريات',
                                    subtitle: 'جميع عمليات الشراء',
                                    content
                                });
                            }}
                            title="معاينة التقرير"
                            className="p-2.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => window.print()}
                            title="طباعة مباشرة"
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-white/5"
                        >
                            <Printer className="w-4 h-4" />
                        </button>
                    </div>

                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs"
                    >
                        <span className="text-slate-400 dark:text-slate-500 font-medium">الفلاتر النشطة:</span>
                        {search && <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold dark:bg-blue-500/10 dark:text-blue-400">بحث: {search}</span>}
                        {filterType && filterValue && <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-600 font-bold dark:bg-purple-500/10 dark:text-purple-400">{filterValue}</span>}
                        {date && <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600 font-bold dark:bg-amber-500/10 dark:text-amber-400">{date}</span>}
                        <span className="text-slate-400 dark:text-slate-500">— {filteredPurchases.length} نتيجة</span>
                    </motion.div>
                )}
            </motion.div>

            <GlobalTable 
                data={filteredPurchases}
                columns={columns}
                actions={renderActions}
                onAdd={() => window.location.href = `${window.BASE_URL}/purchases/create`}
                addButtonLabel="فاتورة جديدة"
                searchPlaceholder="بحث برقم الفاتورة أو المورد..."
                hideFilters={true} // Hide default GlobalTable filters
                searchWrapperClass="relative w-full md:w-72"
                actionsInToolbar={true}
                hideHeader={true}
                exportName="purchases"
            />

            <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="تحذير: حذف فاتورة شراء" message={`سيتم حذف فاتورة الشراء رقم ${itemToDelete?.invoice_number}. هل أنت متأكد؟`} isDeleting={isDeleting} />
            <DischargeModal isOpen={dischargeModalOpen} onClose={() => setDischargeModalOpen(false)} tanks={tanks} />
        </div>
    );
}
