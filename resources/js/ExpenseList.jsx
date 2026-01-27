import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Select, SelectItem, Badge, Button } from '@tremor/react';
import { Search, Download, FileText, Trash2, Edit, ChevronLeft, ChevronRight, Tag, Calendar, Filter, Plus } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'sonner';

// Mock Data is removed. Data should be passed from parent or fetched.
// For now, we assume data is passed as props or we will modify main.jsx if needed.
// But looking at previous files, props are passed.
export default function ExpenseList({ expenses = [] }) {
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);

    const handleEdit = (expense) => {
        setCurrentExpense(expense);
        setEditModalOpen(true);
    };

    const openDeleteModal = (expense) => {
        setItemToDelete(expense);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const form = new FormData();
        form.append('id', itemToDelete.id);

        try {
            const response = await fetch(`${window.BASE_URL}/expenses/delete_ajax`, { method: 'POST', body: form });
            const data = await response.json(); 
            
            if (data.success) {
                toast.success('تم حذف المصروف بنجاح');
                window.location.reload();
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

    const filteredExpenses = expenses.filter(ex => 
        (ex.title?.toLowerCase().includes(search.toLowerCase()) || ex.amount?.toString().includes(search)) &&
        (filterCategory ? ex.category === filterCategory : true)
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 max-w-[1800px] mx-auto space-y-6"
        >
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف مصروف"
                message={`سيتم حذف المصروف "${itemToDelete?.title}". هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.`}
                isDeleting={isDeleting}
            />
            <ExpenseModal 
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                expense={currentExpense}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div></div>
                <div className="flex gap-2">
                    <Button 
                        variant="primary" 
                        icon={Plus} 
                        className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => window.location.href = `${window.BASE_URL}/expenses/create`}
                    >
                        صرف واستلام
                    </Button>
                    <Button variant="secondary" icon={Download} className="rounded-xl font-bold">تصدير Excel</Button>
                    <Button variant="primary" icon={FileText} className="rounded-xl font-bold bg-navy-900 hover:bg-navy-800">تقرير شهري</Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                        <TextInput 
                            placeholder="بحث في المصروفات..." 
                            className="pl-4 pr-10 py-2 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select placeholder="فلتر التصنيف" value={filterCategory} onValueChange={setFilterCategory} className="rounded-xl">
                        <SelectItem value="Maintenance" icon={Tag}>صيانة</SelectItem>
                        <SelectItem value="Salaries" icon={Tag}>رواتب</SelectItem>
                        <SelectItem value="Electricity" icon={Tag}>كهرباء</SelectItem>
                    </Select>
                    <div className="relative w-full">
                         <Calendar className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                         <TextInput type="date" className="pl-4 pr-10 py-2 rounded-xl" />
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-900 border-b border-slate-800">
                            <tr>
                                <th className="p-4 text-sm font-bold text-white">البند / العنوان</th>
                                <th className="p-4 text-sm font-bold text-white">التصنيف</th>
                                <th className="p-4 text-sm font-bold text-white">المبلغ (SAR)</th>
                                <th className="p-4 text-sm font-bold text-white">التاريخ</th>
                                <th className="p-4 text-sm font-bold text-white">طريقة الدفع</th>
                                <th className="p-4 text-sm font-bold text-white text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.map((ex) => (
                                <tr key={ex.id} className="hover:bg-red-50/10 transition-colors group">
                                    <td className="p-4 font-bold text-navy-900">{ex.title}</td>
                                    <td className="p-4">
                                        <Badge size="xs" color="gray" icon={Tag}>{ex.category}</Badge>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-red-600">-{ex.amount.toLocaleString()}</td>
                                    <td className="p-4 text-slate-600">{ex.date}</td>
                                    <td className="p-4 text-slate-500 text-xs">{ex.method}</td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(ex)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => openDeleteModal(ex)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <Text className="text-sm text-slate-500">عرض 1-4 من أصل 40 سجل</Text>
                    <div className="flex gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white"><ChevronLeft className="w-4 h-4"/></button>
                    </div>
                </div>
            </Card>
        </motion.div>


    );
}

function ExpenseModal({ isOpen, onClose, expense }) {
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        fd.append('id', expense.id);

        try {
            const res = await fetch(`${window.BASE_URL}/expenses/update_ajax`, {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('تم التحديث بنجاح');
                window.location.reload();
            } else {
                toast.error(data.message || 'حدث خطأ أثناء التحديث');
            }
        } catch (err) {
            toast.error('خطأ في الاتصال');
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
                    <h3 className="font-bold text-lg text-navy-900">تعديل مصروف #{expense?.id}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors text-xl font-bold">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">العنوان / البند</label>
                        <input type="text" name="title" required defaultValue={expense?.title}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ (SAR)</label>
                            <input type="number" step="0.01" name="amount" required defaultValue={expense?.amount}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">التصنيف</label>
                            <select name="category" defaultValue={expense?.category || expense?.expense_category}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="Maintenance">صيانة</option>
                                <option value="Salaries">رواتب</option>
                                <option value="Electricity">كهرباء</option>
                                <option value="Supplies">مستلزمات</option>
                                <option value="Other">أخرى</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات / وصف</label>
                        <textarea name="note" rows="3" defaultValue={expense?.description || expense?.note}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 text-sm font-bold">
                        <button type="button" onClick={onClose} 
                            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" 
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
