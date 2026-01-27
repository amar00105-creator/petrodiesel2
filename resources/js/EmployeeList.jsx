import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Search, Plus, Trash2, Edit, Shield, Mail } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';

export default function EmployeeList({ employees = [] }) {
    // Local state
    const [employeeList, setEmployeeList] = useState(Array.isArray(employees) ? employees : []);

    // Sync props
    React.useEffect(() => {
        setEmployeeList(Array.isArray(employees) ? employees : []);
    }, [employees]);

    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentEmployee, setCurrentEmployee] = useState(null);

    const filteredEmployees = employeeList.filter(e => 
        e.name?.toLowerCase().includes(search.toLowerCase()) || 
        e.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setModalMode('add');
        setCurrentEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee) => {
        setModalMode('edit'); // Password field will be optional in edit
        setCurrentEmployee(employee);
        setIsModalOpen(true);
    };

    const handleSuccess = (updatedEmployee) => {
        if (modalMode === 'add') {
             // For add, we might need a reload or a smarter way if backend returns ID.
             // Given the current setup, reload is safest for ADD, but for EDIT we can opt-update.
             window.location.reload(); 
        } else {
            setEmployeeList(prev => prev.map(e => e.id == updatedEmployee.id ? { ...e, ...updatedEmployee } : e));
            setIsModalOpen(false);
        }
    };

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (employee) => {
        setItemToDelete(employee);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const fd = new FormData();
        fd.append('id', itemToDelete.id);

        try {
            const res = await fetch('/PETRODIESEL2/public/hr/api?entity=employee&action=delete', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تم الحذف بنجاح');
                setEmployeeList(prev => prev.filter(e => e.id !== itemToDelete.id));
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

    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'admin': return 'rose';
            case 'super_admin': return 'purple';
            case 'manager': return 'blue';
            default: return 'slate';
        }
    };

    return (
        <div className="space-y-6">
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف موظف"
                message={`سيتم حذف الموظف "${itemToDelete?.name}" ولن يتمكن من الدخول للنظام. هل أنت متأكد؟`}
                isDeleting={isDeleting}
            />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-navy-900">الموظفين والإداريين</h2>
                    <p className="text-slate-500 text-sm">إدارة مستخدمي النظام وصلاحياتهم</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4"/>
                        <input 
                            type="text"
                            placeholder="بحث بالاسم أو البريد..." 
                            className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button icon={Plus} onClick={handleAdd} className="rounded-xl font-bold bg-navy-900 hover:bg-navy-800 border-none">
                        إضافة
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((emp) => (
                    <motion.div 
                        key={emp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
                        
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {emp.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-navy-900">{emp.name}</h3>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {emp.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(emp)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => openDeleteModal(emp)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-50">
                            <Badge size="xs" color={getRoleBadgeColor(emp.role)} icon={Shield}>
                                {emp.role}
                            </Badge>
                            <span className="text-xs text-slate-400">ID: {emp.id}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <EmployeeModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    mode={modalMode}
                    employee={currentEmployee}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

function EmployeeModal({ isOpen, onClose, mode, employee, onSuccess }) {
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        if (mode === 'edit' && employee) {
            fd.append('id', employee.id);
        }

        let shouldUpdateUI = false;

        try {
            const action = mode === 'add' ? 'store' : 'update';
            const res = await fetch(`/PETRODIESEL2/public/hr/api?entity=employee&action=${action}`, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('تم الحفظ بنجاح');
                shouldUpdateUI = true;
            } else {
                toast.error(data.message || 'حدث خطأ');
            }
        } catch (err) {
            toast.error('خطأ في الاتصال');
        }

        if (shouldUpdateUI) {
            onSuccess({
                id: employee?.id, // ID might remain same or new for add (but add reloads)
                ...employee,
                name: fd.get('name'),
                email: fd.get('email'),
                role: fd.get('role')
            });
            // Don't close here, onSuccess handles it (or reloads)
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
                        {mode === 'add' ? 'إضافة موظف جديد' : 'تعديل بيانات موظف'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                        <input type="text" name="name" required defaultValue={employee?.name}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                        <input type="email" name="email" defaultValue={employee?.email} placeholder="اختياري (سيتم توليده تلقائياً)"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
                        <input type="password" name="password" required={mode === 'add'} placeholder={mode === 'edit' ? 'اتركها فارغة لعدم التغيير' : ''}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">الصلاحية</label>
                        <select name="role" defaultValue={employee?.role || 'viewer'} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                            <option value="viewer">مشاهد (Viewer)</option>
                            <option value="manager">مدير (Manager)</option>
                            <option value="admin">مسؤول (Admin)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 text-sm font-bold">
                        <button type="button" onClick={onClose} 
                            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" 
                            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            حفظ البيانات
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
