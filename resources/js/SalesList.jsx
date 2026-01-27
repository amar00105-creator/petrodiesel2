import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Select, SelectItem, Badge, Button, Flex } from '@tremor/react';
import { Search, Filter, Download, FileText, Trash2, Edit, ChevronLeft, ChevronRight, Fuel, Calendar, CreditCard, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationModal from './DeleteConfirmationModal';



export default function SalesList({ sales = [] }) {
    const [search, setSearch] = useState('');
    const [filterPump, setFilterPump] = useState('');
    const [filterMethod, setFilterMethod] = useState('');

    // Normalize Data (Backend -> Frontend)
    const normalizedSales = (sales || []).map(sale => {
        let accountName = '-';
        const method = (sale.payment_method || sale.method || 'cash').toLowerCase();
        
        if (method === 'cash') {
            if (sale.bank_name) accountName = `بنك: ${sale.bank_name}`;
            else if (sale.safe_name) accountName = `خزنة: ${sale.safe_name}`;
            else accountName = 'نقدي (غير محدد)';
        } else if (method === 'credit') {
            accountName = sale.customer_name || 'عميل غير محدد';
        }

        return {
            id: sale.id || sale.sale_id,
            date: sale.created_at || sale.date,
            pump: sale.pump_name || sale.pump || 'Unknown Pump',
            fuel: sale.product_type || sale.fuel || 'General',
            liters: sale.volume_sold || sale.liters || 0,
            amount: sale.total_amount || sale.amount || 0,
            unit_price: sale.unit_price || 0,
            method: method === 'cash' ? 'نقدي' : 'آجل',
            account: accountName,
            raw_method: method
        };
    });

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentSale, setCurrentSale] = useState(null);

    // Preview Modal State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [saleToPreview, setSaleToPreview] = useState(null);

    const handleEdit = (sale) => {
        window.location.href = `${window.BASE_URL}/sales/edit?id=${sale.id}`;
    };

    const handlePreview = (sale) => {
        // Navigate to dedicated invoice page
        window.open(`${window.BASE_URL}/sales/invoice?id=${sale.id}`, '_blank');
    };

    const openDeleteModal = (sale) => {
        setItemToDelete(sale);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);

        const form = new FormData();
        form.append('id', itemToDelete.id);

        try {
            const response = await fetch(`${window.BASE_URL}/sales/delete_ajax`, { method: 'POST', body: form });
            const data = await response.json(); 
            
            if (data.success) {
                toast.success('تم حذف عملية البيع بنجاح');
                window.location.reload();
            } else {
                toast.error(data.message || 'فشل عملية الحذف');
            }
        } catch (e) {
            console.error(e);
            toast.error('خطأ في الاتصال بالخادم');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const filteredSales = normalizedSales.filter(sale => 
        (sale.id.toString().includes(search) || sale.pump.toLowerCase().includes(search.toLowerCase())) &&
        (filterPump ? sale.pump === filterPump : true) &&
        (filterMethod ? sale.method.toLowerCase() === filterMethod.toLowerCase() : true)
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
                title="تحذير: حذف عملية بيع"
                message={`سيتم حذف عملية البيع رقم #${itemToDelete?.id || ''}. هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.`}
                isDeleting={isDeleting}
            />
            <SaleModal 
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                sale={currentSale}
            />
            <SalePreviewModal 
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                sale={saleToPreview}
            />
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title className="text-3xl font-bold text-navy-900 font-cairo">سجل المبيعات</Title>
                    <Text className="text-slate-500">استعراض وإدارة جميع عمليات بيع الوقود</Text>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => window.location.href=`${window.BASE_URL}/sales/create`} variant="primary" icon={Plus} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">فاتورة جديدة</Button>
                    <Button variant="secondary" icon={Download} className="rounded-xl font-bold">تصدير Excel</Button>
                    <Button variant="primary" icon={FileText} className="rounded-xl font-bold bg-navy-900 hover:bg-navy-800">تقرير يومي</Button>
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                        <TextInput 
                            placeholder="بحث برقم العملية..." 
                            className="pl-4 pr-10 py-2 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select placeholder="فلتر الماكينة" value={filterPump} onValueChange={setFilterPump} className="rounded-xl">
                        <SelectItem value="Pump 1" icon={Fuel}>Pump 1</SelectItem>
                        <SelectItem value="Pump 2" icon={Fuel}>Pump 2</SelectItem>
                        <SelectItem value="Pump 3" icon={Fuel}>Pump 3</SelectItem>
                    </Select>
                    <Select placeholder="طريقة الدفع" value={filterMethod} onValueChange={setFilterMethod} className="rounded-xl">
                        <SelectItem value="Cash" icon={BanknoteIcon}>نقدي (Cash)</SelectItem>
                        <SelectItem value="Credit" icon={CreditCard}>آجل (Credit)</SelectItem>
                    </Select>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <Calendar className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                            <TextInput type="date" className="pl-4 pr-10 py-2 rounded-xl" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card className="rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-bold text-slate-600">رقم #</th>
                                <th className="p-4 text-sm font-bold text-slate-600">التاريخ والوقت</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الماكينة / الصنف</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الكمية (L)</th>
                                <th className="p-4 text-sm font-bold text-slate-600">المبلغ (SAR)</th>
                                <th className="p-4 text-sm font-bold text-slate-600">طريقة الدفع</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الحساب / العميل</th>
                                <th className="p-4 text-sm font-bold text-slate-600 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-8 h-8 opacity-50"/>
                                            <p>لا توجد سجلات مبيعات</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filteredSales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4 font-mono font-bold text-slate-700">#{sale.id}</td>
                                    <td className="p-4 text-sm text-slate-600 ltr:text-left direction-ltr">{sale.date}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-navy-900">{sale.pump}</span>
                                            <span className="text-xs text-slate-500">{sale.fuel}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono">{Number(sale.liters).toFixed(2)}</td>
                                    <td className="p-4 font-mono font-bold text-emerald-600">{Number(sale.amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <Badge 
                                            size="xs" 
                                            color={sale.raw_method === 'cash' ? 'emerald' : 'blue'}
                                            icon={sale.raw_method === 'cash' ? BanknoteIcon : CreditCard}
                                        >
                                            {sale.method}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                                            sale.raw_method === 'cash' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                            {sale.account}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-1">
                                            <button onClick={() => handlePreview(sale)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="معاينة">
                                                <Eye className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => handleEdit(sale)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="تعديل">
                                                <Edit className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => openDeleteModal(sale)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="حذف">
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
                    <Text className="text-sm text-slate-500">عرض {filteredSales.length} سجل</Text>
                    <div className="flex gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-white"><ChevronLeft className="w-4 h-4"/></button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function SaleModal({ isOpen, onClose, sale }) {
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        fd.append('id', sale.id);

        try {
            const res = await fetch(`${window.BASE_URL}/sales/update_ajax`, {
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
                    <h3 className="font-bold text-lg text-navy-900">تعديل عملية بيع #{sale?.id}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors text-xl font-bold">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">الكمية (لتر)</label>
                            <input type="number" step="0.01" name="liters" required defaultValue={sale?.liters}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">سعر اللتر</label>
                            <input type="number" step="0.01" name="price" required defaultValue={sale?.unit_price}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ الإجمالي</label>
                        <input type="number" step="0.01" name="amount" required defaultValue={sale?.amount}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">طريقة الدفع</label>
                        <select name="method" defaultValue={sale?.method}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                            <option value="Cash">نقدي (Cash)</option>
                            <option value="Credit">آجل (Credit)</option>
                        </select>
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

// Preview Modal Component (Invoice Format)
function SalePreviewModal({ isOpen, onClose, sale }) {
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden print:rounded-none print:shadow-none print:max-w-none"
            >
                {/* Print Styles */}
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .invoice-container, .invoice-container * {
                            visibility: visible;
                        }
                        .invoice-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .print-hidden {
                            display: none !important;
                        }
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                    }
                `}</style>

                <div className="invoice-container">
                    {/* Company Header - Print Only */}
                    <div className="hidden print:block border-b-4 border-blue-600 pb-4 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800">PETRODIESEL</h1>
                                <p className="text-sm text-slate-600 mt-1">شركة بترودیزل لتجارة المحروقات</p>
                                <p className="text-xs text-slate-500 mt-2">هاتف: +249 123 456 789</p>
                                <p className="text-xs text-slate-500">العنوان: الخرطوم، السودان</p>
                            </div>
                            <div className="text-left">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                    <p className="text-xs">Invoice / فاتورة</p>
                                    <p className="text-lg font-bold">#{sale.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header - Screen Only */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white print-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-2xl flex items-center gap-2">
                                    <FileText className="w-6 h-6" />
                                    فاتورة بيع
                                </h3>
                                <p className="text-blue-100 mt-1">رقم الفاتورة: #{sale.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    طباعة
                                </button>
                                <button 
                                    onClick={onClose} 
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                >
                                    <span className="text-2xl font-bold">×</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Header - Print Only */}
                    <div className="hidden print:block mb-6">
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">فاتورة بيع محروقات</h2>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 print:p-8">
                        {/* Date & Time */}
                        <div className="flex justify-between items-center pb-4 border-b-2 border-slate-200 print:border-slate-800">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400 print-hidden" />
                                <div>
                                    <p className="text-xs text-slate-500 print:text-slate-700">التاريخ والوقت</p>
                                    <p className="font-bold text-slate-800 print:text-lg">{sale.date}</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-500 print:text-slate-700">رقم الفاتورة</p>
                                <p className="font-mono font-bold text-xl text-blue-600 print:text-slate-800">#{sale.id}</p>
                            </div>
                        </div>

                        {/* Main Info Grid */}
                        <div className="grid grid-cols-2 gap-4 print:gap-6">
                            {/* Pump & Fuel */}
                            <div className="bg-blue-50 p-4 rounded-xl print:bg-white print:border-2 print:border-slate-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <Fuel className="w-5 h-5 text-blue-600 print-hidden" />
                                    <p className="text-xs text-blue-700 font-bold print:text-slate-800">الماكينة والصنف</p>
                                </div>
                                <p className="font-bold text-lg text-blue-900 print:text-slate-900 print:text-xl">{sale.pump}</p>
                                <p className="text-sm text-blue-700 mt-1 print:text-slate-600">{sale.fuel}</p>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-emerald-50 p-4 rounded-xl print:bg-white print:border-2 print:border-slate-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-5 h-5 text-emerald-600 print-hidden" />
                                    <p className="text-xs text-emerald-700 font-bold print:text-slate-800">طريقة الدفع</p>
                                </div>
                                <p className="font-bold text-lg text-emerald-900 print:text-slate-900 print:text-xl">{sale.method}</p>
                                <p className="text-sm text-emerald-700 mt-1 print:text-slate-600">{sale.account}</p>
                            </div>
                        </div>

                        {/* Sales Details Table */}
                        <div className="bg-slate-50 p-6 rounded-xl print:bg-white print:border-2 print:border-slate-800">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2 print:text-lg print:text-slate-900 print:mb-6">
                                <FileText className="w-4 h-4 print-hidden" />
                                تفاصيل الفاتورة
                            </h4>
                            
                            <table className="w-full">
                                <thead className="border-b-2 border-slate-300 print:border-slate-800">
                                    <tr>
                                        <th className="text-right pb-3 text-sm text-slate-600 print:text-slate-900 print:text-base">البند</th>
                                        <th className="text-center pb-3 text-sm text-slate-600 print:text-slate-900 print:text-base">الكمية</th>
                                        <th className="text-center pb-3 text-sm text-slate-600 print:text-slate-900 print:text-base">السعر</th>
                                        <th className="text-left pb-3 text-sm text-slate-600 print:text-slate-900 print:text-base">المجموع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-200 print:border-slate-400">
                                        <td className="py-4 text-slate-700 print:text-slate-900 print:text-lg">{sale.fuel}</td>
                                        <td className="py-4 text-center font-mono text-blue-600 print:text-slate-900 print:text-lg">{Number(sale.liters).toFixed(2)} لتر</td>
                                        <td className="py-4 text-center font-mono text-slate-700 print:text-slate-900 print:text-lg">{Number(sale.unit_price).toFixed(2)} SDG</td>
                                        <td className="py-4 text-left font-mono font-bold text-emerald-600 print:text-slate-900 print:text-lg">{Number(sale.amount).toFixed(2)} SDG</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-slate-800">
                                        <td colSpan="3" className="pt-4 text-right font-bold text-slate-800 print:text-xl">المبلغ الإجمالي:</td>
                                        <td className="pt-4 text-left font-mono font-black text-2xl text-emerald-600 print:text-slate-900 print:text-3xl">{Number(sale.amount).toFixed(2)} SDG</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer - Print Only */}
                        <div className="hidden print:block mt-12 pt-6 border-t border-slate-300 text-center text-sm text-slate-600">
                            <p className="font-bold mb-2">شكراً لتعاملكم معنا</p>
                            <p>هذه فاتورة إلكترونية صادرة من نظام PETRODIESEL</p>
                        </div>
                    </div>

                    {/* Footer Actions - Screen Only */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print-hidden">
                        <button 
                            onClick={handlePrint}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            طباعة الفاتورة
                        </button>
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Icon Helper
const BanknoteIcon = (props) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
);
