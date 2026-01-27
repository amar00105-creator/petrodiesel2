import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge, Button } from '@tremor/react';
import AddSupplierModal from './AddSupplierModal';
import EditSupplierModal from './EditSupplierModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';
import { Phone, MapPin, Building2, Truck, Edit, Trash2, Plus } from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import GlobalTable from './components/GlobalTable';

export default function SupplierList({ suppliers = [] }) {
    // Local state for immediate UI updates
    const [supplierList, setSupplierList] = useState(Array.isArray(suppliers) ? suppliers : []);
    
    // Update local state if props change (though in this app props are likely static on load)
    React.useEffect(() => {
        setSupplierList(Array.isArray(suppliers) ? suppliers : []);
    }, [suppliers]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setIsEditModalOpen(true);
    };
    
    // Optimistic Update Callback
    const handleEditSuccess = (updatedSupplier) => {
        setSupplierList(prev => prev.map(s => s.id == updatedSupplier.id ? { ...s, ...updatedSupplier } : s));
        setIsEditModalOpen(false);
        // Optional: toast is already handled in Modal
    };

    const openDeleteModal = (supplier) => {
        setItemToDelete(supplier);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const form = new FormData();
        form.append('id', itemToDelete.id);
        try {
            const response = await fetch('/PETRODIESEL2/public/suppliers/delete_ajax', { method: 'POST', body: form });
            const data = await response.json();
            if (data.success) {
                toast.success('تم حذف المورد بنجاح');
                setSupplierList(prev => prev.filter(s => s.id !== itemToDelete.id)); // Local update
            } else {
                toast.error(data.message || 'فشل الحذف');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    // Columns
    const columns = [
        { header: 'اسم المنشأة / المورد', accessor: 'name', render: (item) => (
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                    <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-navy-900">{item.name}</span>
            </div>
        )},
        { header: 'رقم الهاتف', accessor: 'phone', className: 'font-mono text-slate-600', render: (item) => (
            <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-400"/> {item.phone}
            </div>
        )},
        { header: 'العنوان', accessor: 'address', className: 'text-sm text-slate-500', render: (item) => (
            <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-400"/> {item.address}
            </div>
        )},
        { header: 'نوع الخدمة', accessor: 'type', render: (item) => <Badge size="xs" color="blue" icon={Truck}>{item.type}</Badge> },
        { header: 'الحالة', accessor: 'status', render: (item) => (
            <Badge size="xs" color={item.status === 'Active' ? 'emerald' : 'gray'}>
                {item.status === 'Active' ? 'نشط' : 'غير نشط'}
            </Badge>
        )}
    ];

    const actions = (item) => (
        <>
            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
            <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
        </>
    );

    // Custom Filters Area to include the extra 'Add Customer' button
    const extraActions = (
        <div className="flex items-center">
            <Button icon={Plus} onClick={() => setIsAddCustomerModalOpen(true)} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-none">إضافة زبون</Button>
        </div>
    );

    return (
        <div className="p-6 max-w-[1800px] mx-auto space-y-6">
            <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="تحذير: حذف مورد" message={`سيتم حذف المورد "${itemToDelete?.name}". هل أنت متأكد؟`} isDeleting={isDeleting} />
            
            <GlobalTable 
                title="الموردين والشركات"
                subtitle="قائمة شركات التوريد والخدمات اللوجستية"
                data={supplierList}
                columns={columns}
                actions={actions}
                onAdd={() => setIsAddModalOpen(true)}
                addButtonLabel="إضافة مورد"
                searchPlaceholder="بحث عن مورد..."
                filters={extraActions}
                exportName="suppliers"
            />

            <AddSupplierModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => window.location.reload()} />
            <AddCustomerModal isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)} onSuccess={() => {}} />
            <EditSupplierModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} supplier={editingSupplier} onSuccess={handleEditSuccess} />
        </div>
    );
}
