import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import AddCustomerModal from './AddCustomerModal';
import EditCustomerModal from './EditCustomerModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';
import { Phone, MapPin, User, Edit, Trash2 } from 'lucide-react';
import GlobalTable from './components/GlobalTable';

export default function CustomerList({ customers = [], onUpdate, hideHeader = false }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (customer) => {
        setItemToDelete(customer);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const form = new FormData();
        form.append('id', itemToDelete.id);
        try {
            const response = await fetch('/PETRODIESEL2/public/hr/api?entity=customer&action=delete', { method: 'POST', body: form });
            const data = await response.json();
            if (data.success) {
                toast.success('تم حذف العميل بنجاح');
                if (onUpdate) {
                    onUpdate(customers.filter(c => c.id !== itemToDelete.id));
                } else {
                    window.location.reload();
                }
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

    const handleAddSuccess = (newCustomer) => {
        if (onUpdate) onUpdate([...customers, newCustomer]);
        else window.location.reload();
    };
    
    const handleEditSuccess = (updatedCustomer) => {
        if (onUpdate) onUpdate(customers.map(c => c.id == updatedCustomer.id ? { ...c, ...updatedCustomer } : c));
        else window.location.reload();
    }

    // Columns
    const columns = [
        { header: 'اسم العميل', accessor: 'name', render: (item) => (
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-navy-900 dark:text-white">{item.name}</span>
            </div>
        )},
        { header: 'رقم الهاتف', accessor: 'phone', className: 'font-mono text-slate-600 dark:text-slate-300', render: (item) => (
            <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-400"/> {item.phone || '-'}
            </div>
        )},
        { header: 'العنوان', accessor: 'address', className: 'text-sm text-slate-500 dark:text-slate-400', render: (item) => (
            <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-400"/> {item.address || '-'}
            </div>
        )},
        { header: 'الملاحظات', accessor: 'notes', className: 'max-w-xs truncate text-slate-500 dark:text-slate-400', render: (item) => item.notes || '-' }
    ];

    const actions = (item) => (
        <>
            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
            <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
        </>
    );

    return (
        <div className="p-6 max-w-[1800px] mx-auto space-y-6">
            <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="تحذير: حذف عميل" message={`سيتم حذف العميل "${itemToDelete?.name}". هل أنت متأكد؟`} isDeleting={isDeleting} />
            
            <GlobalTable 
                title="قائمة العملاء"
                subtitle="إدارة سجلات العملاء والديون"
                data={customers}
                columns={columns}
                actions={actions}
                onAdd={() => setIsAddModalOpen(true)}
                addButtonLabel="إضافة عميل"
                searchPlaceholder="بحث عن عميل..."
                exportName="customers"
                hideHeader={hideHeader}
            />

            <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleAddSuccess} />
            <EditCustomerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} customer={editingCustomer} onSuccess={handleEditSuccess} />
        </div>
    );
}
