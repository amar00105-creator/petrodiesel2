import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Badge, Flex, Grid, Metric, Button } from '@tremor/react';
import { Fuel, Gauge, User, Settings, Trash2, Plus, Zap } from 'lucide-react';
import EditPumpModal from './EditPumpModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function PumpList({ pumps = [], tanks = [], workers = [] }) {
    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openDeleteModal = (pump) => {
        setItemToDelete(pump);
        setDeleteModalOpen(true);
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        
        const form = new FormData();
        form.append('id', itemToDelete.id);
        
        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/delete_ajax', {
                method: 'POST',
                body: form
            });
            const data = await response.json();
            
            if (data.success) {
                // Remove from local state immediately for better UX or reload
                window.location.reload(); 
            } else {
                // We'll import toast if it's not already there, or use alert for now if toast isn't imported
                // Checking imports... toast is not imported in the original file I viewed. 
                // I will add toast import in a separate step or just use alert/console for now to stay safe, 
                // BUT looking at previous files, sonner toast is standard. I'll add the import too.
                alert(data.message || 'فشل عملية الحذف');
            }
        } catch (e) {
            console.error(e);
            alert('خطأ في الاتصال');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="p-6 max-w-7xl mx-auto"
        >
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف ماكينة وقود"
                isDeleting={isDeleting}
                message={`سيتم حذف الماكينة "${itemToDelete?.name}" وجميع عداداتها المرتبطة. هل أنت متأكد؟`}
            />
            {/* Actions Toolbar */}
            <div className="flex justify-end mb-6">
                <a 
                    href="/PETRODIESEL2/public/pumps/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 font-bold"
                >
                    <Plus className="w-5 h-5" /> إضافة ماكينة
                </a>
            </div>

            {/* Grid */}
            {pumps.length === 0 ? (
                <Card className="text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200">
                    <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4 text-slate-400">
                        <Fuel className="w-12 h-12" />
                    </div>
                    <Title className="text-slate-600">لا توجد مكائن مضافة</Title>
                    <Text className="mt-2 text-slate-400">ابدأ بإضافة أول ماكينة وقود للنظام</Text>
                </Card>
            ) : (
                <Grid numItems={2} numItemsMd={3} numItemsLg={4} className="gap-3 md:gap-6">
                    {pumps.map((pump) => (
                        <motion.div key={pump.id} variants={itemVariants}>
                            <Card className="h-full flex flex-col hover:shadow-xl transition-shadow border-t-4 border-t-blue-500 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Fuel className="w-24 h-24" />
                                </div>

                                <Flex className="mb-4 items-start">
                                    <div>
                                        <Text className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-wider mb-1 truncate">
                                            {pump.tank_name || 'خزان غير محدد'}
                                        </Text>
                                        <Title className="text-lg md:text-2xl font-black text-slate-800 break-words leading-tight">{pump.name}</Title>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge icon={Zap} color="emerald" size="xs" className="scale-75 origin-right md:scale-100 shadow-emerald-500/20 shadow-lg">
                                            نشط
                                        </Badge>
                                        <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 rounded-full">
                                            {pump.product_type || 'وقود'}
                                        </span>
                                    </div>
                                </Flex>

                                <div className="bg-slate-50/50 rounded-xl p-2 md:p-4 mb-2 md:mb-4 flex-grow space-y-2 md:space-y-3 border border-slate-100">
                                    <Text className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2 flex items-center gap-2">
                                        <Gauge className="w-3 h-3" /> العدادات
                                    </Text>
                                    {pump.counters && pump.counters.length > 0 ? (
                                        pump.counters.map((counter, idx) => (
                                            <div key={counter.id} className="group/counter relative flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-2 md:p-3 rounded-lg shadow-sm border border-slate-100">
                                                <div className="flex items-center gap-2 md:gap-4 w-full">
                                                    <div className="hidden md:block p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                                                        <Gauge className="w-5 h-5" />
                                                    </div>
                                                    <div className="w-full">
                                                        <div className="font-mono text-sm md:text-lg font-black text-slate-700 leading-none mb-1 text-right dir-ltr truncate">
                                                            {parseFloat(counter.current_reading).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </div>
                                                        {counter.worker_name ? (
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md w-fit mt-1">
                                                                <User className="w-3 h-3 text-slate-400" /> 
                                                                <span className="pt-0.5">{counter.worker_name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-slate-400 italic mt-1">غير مخصص</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 left-2 text-[10px] font-black text-slate-200 group-hover/counter:text-blue-100 transition-colors max-w-[50%] truncate">
                                                    {counter.name || `#${String(idx + 1).padStart(2, '0')}`}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-slate-400 text-sm italic">
                                            لا توجد عدادات مرتبطة
                                        </div>
                                    )}
                                </div>

                                <Flex className="mt-auto pt-4 border-t border-slate-100 gap-2">
                                    <a
                                        href={`/PETRODIESEL2/public/pumps/edit?id=${pump.id}`}
                                        className="flex-1 py-2 px-3 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" /> تعديل
                                    </a>
                                    <button
                                        onClick={() => openDeleteModal(pump)}
                                        className="py-2 px-3 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Flex>
                            </Card>
                        </motion.div>
                    ))}
                </Grid>
            )}

            {/* Modal - Removed as we now use full page edit */}
        </motion.div>
    );
}
