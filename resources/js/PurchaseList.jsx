import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectItem } from '@tremor/react';
import { Truck, Building2, CheckCircle, Clock, Activity, Droplet, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import GlobalTable from './components/GlobalTable';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DischargeModal from './DischargeModal';

export default function PurchaseList({ purchases = [], tanks = [] }) {
    // Filter State
    const [filterSupplier, setFilterSupplier] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

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

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const form = new FormData();
        form.append('id', itemToDelete.id);
        try {
            const response = await fetch('/PETRODIESEL2/public/purchases/delete_ajax', { method: 'POST', body: form });
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

    // Filter Items for Table
    // The GlobalTable handles SEARCH text internally, but we handle specific dropdowns here
    // However, GlobalTable expects 'data' prop. We can pre-filter data here before passing it.
    const filteredPurchases = purchases.filter(p => {
        const matchesSupplier = filterSupplier ? p.supplier_name === filterSupplier : true;
        const matchesStatus = filterStatus ? p.status === filterStatus : true;
        const purchaseDate = new Date(p.created_at || p.date).setHours(0,0,0,0);
        const from = dateFrom ? new Date(dateFrom).setHours(0,0,0,0) : null;
        const to = dateTo ? new Date(dateTo).setHours(0,0,0,0) : null;
        const matchesDate = (!from || purchaseDate >= from) && (!to || purchaseDate <= to);
        return matchesSupplier && matchesStatus && matchesDate;
    });

    // Column Definitions
    const columns = [
        { header: 'رقم الفاتورة', accessor: 'invoice_number', className: 'font-mono font-bold text-navy-900', render: (item) => `#${item.invoice_number}` },
        { header: 'التاريخ', accessor: 'created_at', render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-' },
        { header: 'المورد', accessor: 'supplier_name', render: (item) => (
            <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400"/>
                <span className="font-bold text-slate-700">{item.supplier_name || 'غير محدد'}</span>
            </div>
        )},
        { header: 'نوع الوقود', accessor: 'fuel_type_name', render: (item) => (
            <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500"/>
                <span className="font-bold text-blue-900">{item.fuel_type_name || 'غير محدد'}</span>
            </div>
        )},
        { header: 'الكمية (L)', accessor: 'volume_ordered', className: 'font-mono', render: (item) => Number(item.volume_received || item.volume_ordered || 0).toLocaleString() },
        { header: 'الاجمالي (SAR)', accessor: 'total_cost', className: 'font-mono font-bold text-emerald-600', render: (item) => Number(item.total_cost || 0).toLocaleString() },
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
            <a href={`/PETRODIESEL2/public/purchases/edit?id=${item.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></a>
            <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
        </>
    );

    // Filters Component
    const filters = (
        <div className="flex gap-2 items-center flex-wrap md:flex-nowrap">
            <Select placeholder="كل الموردين" value={filterSupplier} onValueChange={setFilterSupplier} className="w-40">
                 <SelectItem value="Saudi Aramco" icon={Building2}>Saudi Aramco</SelectItem>
                 <SelectItem value="National Fuel Co." icon={Building2}>National Fuel Co.</SelectItem>
             </Select>
             <Select placeholder="حالة الشحن" value={filterStatus} onValueChange={setFilterStatus} className="w-40">
                <SelectItem value="completed" icon={CheckCircle}>تم التفريغ</SelectItem>
                <SelectItem value="ordered" icon={Clock}>شاحن</SelectItem>
             </Select>
             {/* Date Range - Simplified styled Inputs */}
            <div className="flex items-center gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-32 p-2 rounded-xl border border-slate-200 text-sm outline-none" placeholder="From" />
                <span className="text-slate-400">-</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-32 p-2 rounded-xl border border-slate-200 text-sm outline-none" placeholder="To" />
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-[1800px] mx-auto print:p-0 print:max-w-none">
            <GlobalTable 
                title="فواتير المشتريات"
                subtitle="إدارة سجلات شراء الوقود الواردة"
                data={filteredPurchases}
                columns={columns}
                actions={renderActions}
                onAdd={() => window.location.href = '/PETRODIESEL2/public/purchases/create'}
                addButtonLabel="فاتورة جديدة"
                searchPlaceholder="بحث برقم الفاتورة أو المورد..."
                filters={filters}
                exportName="purchases"
            />

            <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="تحذير: حذف فاتورة شراء" message={`سيتم حذف فاتورة الشراء رقم ${itemToDelete?.invoice_number}. هل أنت متأكد؟`} isDeleting={isDeleting} />
            <DischargeModal isOpen={dischargeModalOpen} onClose={() => setDischargeModalOpen(false)} tanks={tanks} />
        </div>
    );
}
