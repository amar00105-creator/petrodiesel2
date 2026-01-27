import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, UserCircle, Users, HardHat } from 'lucide-react';
import AddWorkerModal from './AddWorkerModal';
import EditWorkerModal from './EditWorkerModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';

// Mock Data
const MOCK_WORKERS = [
    { id: 1, name: 'Ali Ahmed', phone: '0501234567', national_id: '1020304050', status: 'Active', station: 'Main Station' },
    { id: 2, name: 'Khan Mohammed', phone: '0559876543', national_id: '2345678901', status: 'Active', station: 'Main Station' },
    { id: 3, name: 'Saeed Al-Ghamdi', phone: '0541122334', national_id: '1010101010', status: 'On Leave', station: 'North Branch' },
];

export default function WorkerList({ workers = [] }) {
    // Local state for immediate updates
    const [workerList, setWorkerList] = useState(Array.isArray(workers) ? workers : []);
    
    // Update local state if props change
    React.useEffect(() => {
        setWorkerList(Array.isArray(workers) ? workers : []);
    }, [workers]);

    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);

    const handleEdit = (worker) => {
        setEditingWorker(worker);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = (updatedWorker) => {
        setWorkerList(prev => prev.map(w => w.id == updatedWorker.id ? { ...w, ...updatedWorker } : w));
        setIsEditModalOpen(false);
    };

    const handleAddSuccess = () => {
        window.location.reload(); // Keep reload for Add for now or implement full refresh
    };

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (worker) => {
        setItemToDelete(worker);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const form = new FormData();
        form.append('id', itemToDelete.id);

        try {
            const response = await fetch('/PETRODIESEL2/public/workers/delete_ajax', {
                method: 'POST',
                body: form
            });
            const data = await response.json();

            if (data.success) {
                toast.success('تم حذف العامل بنجاح');
                setWorkerList(prev => prev.filter(w => w.id !== itemToDelete.id));
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

    const normalizedWorkers = (workerList && workerList.length > 0 ? workerList : MOCK_WORKERS).map(w => ({
        id: w.id,
        name: w.name,
        phone: w.phone || 'N/A',
        national_id: w.national_id || w.iqama_id || 'N/A',
        status: w.status ? 'Active' : 'On Leave', // Assuming status is boolean 1/0 from DB
        station: w.station_name || 'Main Station'
    }));

    const filteredWorkers = normalizedWorkers.filter(w => 
        w.name.toLowerCase().includes(search.toLowerCase()) || 
        w.phone.includes(search)
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <DeleteConfirmationModal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف عامل"
                message={`سيتم حذف العامل "${itemToDelete?.name}". هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.`}
                isDeleting={isDeleting}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title className="text-3xl font-bold text-navy-900 font-cairo">إدارة العمال</Title>
                    <Text className="text-slate-500">سجل عمال المحطة والمناوبين</Text>
                </div>
                <Button icon={Plus} onClick={() => setIsAddModalOpen(true)} className="rounded-xl font-bold bg-navy-900 hover:bg-navy-800 border-none">إضافة عامل</Button>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
                <div className="relative max-w-md">
                    <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                    <TextInput 
                        placeholder="بحث بالاسم أو رقم الجوال..." 
                        className="pl-4 pr-10 py-2 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-bold text-slate-600">الاسم</th>
                                <th className="p-4 text-sm font-bold text-slate-600">رقم الجوال</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الهوية الوطنية / الإقامة</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الحالة</th>
                                <th className="p-4 text-sm font-bold text-slate-600">المحطة</th>
                                <th className="p-4 text-sm font-bold text-slate-600 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredWorkers.map((worker) => (
                                <tr key={worker.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                                            <HardHat className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-navy-900">{worker.name}</span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-600">{worker.phone}</td>
                                    <td className="p-4 font-mono text-slate-600">{worker.national_id}</td>
                                    <td className="p-4">
                                        <Badge size="xs" color={worker.status === 'Active' ? 'emerald' : 'amber'}>
                                            {worker.status === 'Active' ? 'على رأس العمل' : 'إجازة'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-slate-500">{worker.station}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(worker)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                            <button onClick={() => openDeleteModal(worker)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddWorkerModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess} 
            />

            <EditWorkerModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                worker={editingWorker}
                onSuccess={handleEditSuccess} 
            />
        </motion.div>
    );
}
