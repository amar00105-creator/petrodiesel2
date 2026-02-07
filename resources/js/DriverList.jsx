import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Search, Plus, Trash2, Edit, Truck } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';

const DriverList = forwardRef(({ drivers = [], search = '' }, ref) => {
    const [driverList, setDriverList] = useState(Array.isArray(drivers) ? drivers : []);

    React.useEffect(() => {
        setDriverList(Array.isArray(drivers) ? drivers : []);
    }, [drivers]);

    // const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentDriver, setCurrentDriver] = useState(null);

    useImperativeHandle(ref, () => ({
        openAddModal: handleAdd
    }));

    // Filter Logic
    const filteredDrivers = driverList.filter(d => 
        d.name?.toLowerCase().includes(search.toLowerCase()) || 
        d.phone?.includes(search) ||
        d.truck_number?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setModalMode('add');
        setCurrentDriver(null);
        setIsModalOpen(true);
    };

    const handleEdit = (driver) => {
        setModalMode('edit');
        setCurrentDriver(driver);
        setIsModalOpen(true);
    };

    const handleSuccess = (updatedDriver) => {
        if (modalMode === 'add') {
             window.location.reload(); 
        } else {
            setDriverList(prev => prev.map(d => d.id == updatedDriver.id ? { ...d, ...updatedDriver } : d));
            setIsModalOpen(false);
        }
    };

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (driver) => {
        setItemToDelete(driver);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const fd = new FormData();
        fd.append('id', itemToDelete.id);

        try {
            const res = await fetch('/PETRODIESEL2/public/hr/api?entity=driver&action=delete', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم الحذف بنجاح');
                setDriverList(prev => prev.filter(d => d.id !== itemToDelete.id));
            } else {
                toast.error(data.message || 'فشل الحذف');
            }
        } catch (e) {
            toast.error('خطأ في الاتصال');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف سائق"
                message={`سيتم حذف السائق "${itemToDelete?.name}". هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.`}
                isDeleting={isDeleting}
            />
            {/* Header Removed */}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                    <motion.div 
                        key={driver.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                    {driver.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy-900 dark:text-white">{driver.name}</h3>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Truck className="w-3 h-3" />
                                        {driver.truck_number || 'بدون شاحنة'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(driver)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => openDeleteModal(driver)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                            <div className="text-slate-500 dark:text-slate-400">{driver.phone || 'لا يوجد هاتف'}</div>
                            <Badge size="xs" color="slate">سائق</Badge>
                        </div>
                    </motion.div>
                ))}

                {filteredDrivers.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-400">
                        لا توجد نتائج
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <DriverModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    mode={modalMode}
                    driver={currentDriver}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
});

function DriverModal({ isOpen, onClose, mode, driver, onSuccess }) {
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        if (mode === 'edit' && driver) {
            fd.append('id', driver.id);
        }

        let shouldUpdateUI = false;

        try {
            const action = mode === 'add' ? 'store' : 'update';
            const res = await fetch(`/PETRODIESEL2/public/hr/api?entity=driver&action=${action}`, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(mode === 'add' ? 'تمت الإضافة بنجاح' : 'تم التحديث بنجاح');
                shouldUpdateUI = true;
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (err) {
            toast.error('خطأ في الاتصال');
        }

        if (shouldUpdateUI) {
            onSuccess({
                id: driver?.id,
                ...driver,
                name: fd.get('name'),
                phone: fd.get('phone'),
                truck_number: fd.get('truck_number')
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-navy-900">
                        {mode === 'add' ? 'إضافة سائق جديد' : 'تعديل بيانات سائق'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                        <input type="text" name="name" required defaultValue={driver?.name}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                        <input type="text" name="phone" defaultValue={driver?.phone}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">رقم الشاحنة / اللوحة</label>
                        <input type="text" name="truck_number" defaultValue={driver?.truck_number}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 text-sm font-bold">
                        <button type="button" onClick={onClose} 
                            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" 
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            حفظ البيانات
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default DriverList;
