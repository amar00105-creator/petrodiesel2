import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, TextInput, Select, SelectItem } from '@tremor/react'; // Removed Title, Text which were unused in new design or avail in lucide
import { Truck, Building2, CheckCircle, Clock, Activity, Droplet, Edit, Trash2, Search, Filter, RefreshCw, Database, Calendar } from 'lucide-react';
import { toast } from 'sonner';
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
        });
        return Array.from(options).filter(Boolean).sort();
    };

    const filteredPurchases = normalizedPurchases.filter(p => {
        const matchesSearch = 
            p.invoice_number.toString().includes(search) || 
            p.supplier.toLowerCase().includes(search.toLowerCase());

         // Dynamic Filtering Logic
         let matchesFilter = true;
         if (filterType && filterValue) {
             if (filterType === 'supplier') matchesFilter = p.supplier === filterValue;
             else if (filterType === 'status') matchesFilter = p.status_label === filterValue;
             else if (filterType === 'fuel') matchesFilter = p.fuel === filterValue;
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

    // Column Definitions
    const columns = [
        { header: 'رقم الفاتورة', accessor: 'invoice_number', className: 'font-mono font-bold text-navy-900', render: (item) => `#${item.invoice_number}` },
        { header: 'التاريخ', accessor: 'date_formatted' },
        { header: 'المورد', accessor: 'supplier', render: (item) => (
            <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400"/>
                <span className="font-bold text-slate-700">{item.supplier}</span>
            </div>
        )},
        { header: 'نوع الوقود', accessor: 'fuel', render: (item) => (
            <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500"/>
                <span className="font-bold text-blue-900">{item.fuel}</span>
            </div>
        )},
        { header: 'الكمية (L)', accessor: 'volume_ordered', className: 'font-mono', render: (item) => Number(item.volume_received || item.volume_ordered || 0).toLocaleString() },
        { header: `الاجمالي (${currency})`, accessor: 'total_cost', className: 'font-mono font-bold text-emerald-600', render: (item) => (
            <div className="flex items-center gap-1">
                <span>{Number(item.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-emerald-400">{currency}</span>
            </div>
        )},
        { header: 'الحالة', accessor: 'status', render: (item) => {
            const isDelayedShipping = (item.status === 'ordered' || item.status === 'pending') && isDelayed(item.created_at);
            if (item.status === 'completed') {
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" /> تم التفريغ
                    </span>
                );
            }
            return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    isDelayedShipping ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-orange-100 text-orange-700 border-orange-200'
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
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                    <Droplet className="w-4 h-4"/>
                </button>
            )}
            <a href={`${window.BASE_URL}/purchases/edit?id=${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></a>
            <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
        </>
    );

    return (
        <div className="p-6 max-w-[1800px] mx-auto print:p-0 print:max-w-none space-y-6">
            
            {/* Filters Bar - Refactored Glassmorphism Style - Spaced Out Row */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:backdrop-blur-md dark:ring-white/10 dark:shadow-none p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search - Expanded */}
                    <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                        <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4"/>
                        <TextInput 
                            placeholder="بحث..." 
                            className="pl-2 pr-9 py-2 text-sm rounded-xl dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:text-white dark:focus:ring-white/20 dark:focus:border-white/20 w-full transition-all focus:ring-1 focus:ring-blue-100 dark:focus:ring-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Type - Expanded */}
                    <div className="w-[180px]">
                        <Select 
                            placeholder="نوع الفلترة" 
                            value={filterType} 
                            onValueChange={(val) => { setFilterType(val); setFilterValue(''); }} 
                            className="text-sm rounded-xl dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:text-white min-h-[38px]"
                        >
                            <SelectItem value="supplier" icon={Building2} className="text-sm">المورد</SelectItem>
                            <SelectItem value="status" icon={Activity} className="text-sm">الحالة</SelectItem>
                            <SelectItem value="fuel" icon={Droplet} className="text-sm">الوقود</SelectItem>
                        </Select>
                    </div>

                    {/* Filter Value - Expanded */}
                    <div className="w-[180px]">
                        <Select 
                            placeholder="القيمة..." 
                            value={filterValue} 
                            onValueChange={setFilterValue} 
                            disabled={!filterType}
                            className="text-sm rounded-xl dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:text-white disabled:opacity-50 min-h-[38px]"
                        >
                            {getFilterOptions().map((opt, idx) => (
                                <SelectItem key={idx} value={opt} icon={Database} className="text-sm">
                                    {opt}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Date - Expanded */}
                    <div className="relative w-[160px]">
                        <Calendar className="absolute right-3 top-2.5 text-slate-400 w-4 h-4"/>
                        <TextInput 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-2 pr-9 py-2 text-sm rounded-xl dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:text-white w-full" 
                        />
                    </div>

                     {/* Reset Button - Larger */}
                    <button 
                        onClick={resetFilters}
                        title="reset"
                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-600 transition-colors dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                    >
                        <RefreshCw className={`w-5 h-5 ${filterType || search || date ? 'text-red-500' : ''}`} />
                    </button>

                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

                    {/* Actions: Add New */}
                    <button 
                        onClick={() => window.location.href = `${window.BASE_URL}/purchases/create`}
                        className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-navy-800 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        <div className="bg-white/20 rounded p-0.5"><Truck className="w-4 h-4" /></div>
                        فاتورة جديدة
                    </button>
                    
                     {/* Actions: Print */}
                     <button 
                        onClick={() => window.print()}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl dark:text-slate-400 dark:hover:bg-white/5"
                        title="طباعة"
                    >
                        <Search className="w-5 h-5 hidden" /> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                    </button>

                </div>
            </Card>

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
