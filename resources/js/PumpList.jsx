import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Badge, Flex, Grid, Metric, Button } from '@tremor/react';
import { Fuel, Gauge, User, Settings, Trash2, Plus, Zap } from 'lucide-react';
import EditPumpModal from './EditPumpModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SuccessAnimation from './SuccessAnimation';
import FuelPumpCard from './FuelPumpCard';

export default function PumpList({ pumps = [], tanks = [], workers = [] }) {
    // Success Animation State
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
                // Close delete modal first
                setDeleteModalOpen(false);
                // Show success animation
                setSuccessMessage('تم حذف الماكينة بنجاح');
                setShowSuccess(true);
            } else {
                alert(data.message || 'فشل عملية الحذف');
            }
        } catch (e) {
            console.error(e);
            alert('خطأ في الاتصال');
        } finally {
            setIsDeleting(false);
            if (!showSuccess) {
                 setDeleteModalOpen(false); 
                 setItemToDelete(null);
            }
        }
    };

    const handleAnimationComplete = () => {
        setShowSuccess(false);
        window.location.reload(); 
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

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [pumpToEdit, setPumpToEdit] = useState(null);

    const handleEdit = (pump) => {
        setPumpToEdit(pump);
        setEditModalOpen(true);
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="p-6 max-w-[1900px] mx-auto"
        >
            <SuccessAnimation 
                isVisible={showSuccess} 
                message={successMessage}
                onComplete={handleAnimationComplete}
            />
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="تحذير: حذف ماكينة وقود"
                isDeleting={isDeleting}
                message={`سيتم حذف الماكينة "${itemToDelete?.name}" وجميع عداداتها المرتبطة. هل أنت متأكد من الحذف؟`}
            />

            {/* Edit Modal */}
            {pumpToEdit && (
                <EditPumpModal 
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    pump={pumpToEdit}
                    tanks={tanks}
                    workers={workers}
                />
            )}

            {/* Actions Toolbar */}
            <div className="flex justify-end mb-6">
                <a 
                    href="/PETRODIESEL2/public/pumps/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 font-bold dark:bg-blue-600 dark:hover:bg-blue-700 dark:shadow-none"
                >
                    <Plus className="w-5 h-5" /> إضافة ماكينة
                </a>
            </div>

            {/* Grid */}
            {pumps.length === 0 ? (
                <Card className="relative overflow-hidden text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200 dark:bg-white/5 dark:backdrop-blur-xl dark:border-blue-400/20 dark:shadow-[0_0_40px_-10px_rgba(59,130,246,0.1)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
                    <div className="relative z-10">
                    <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4 text-slate-400 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-blue-400/20">
                        <Fuel className="w-12 h-12" />
                    </div>
                    <Title className="text-slate-600 dark:text-blue-100 dark:drop-shadow-sm">لا توجد مكائن مضافة</Title>
                    <Text className="mt-2 text-slate-400 dark:text-slate-400">ابدأ بإضافة أول ماكينة وقود للنظام</Text>
                    </div>
                </Card>
            ) : (
                <Grid numItems={2} numItemsMd={3} numItemsLg={5} className="gap-4">
                    {pumps.map((pump) => (
                        <motion.div key={pump.id} variants={itemVariants}>
                            <FuelPumpCard 
                                pumpName={pump.name}
                                fuelType={pump.product_type || 'وقود'}
                                counters={pump.counters || []}
                                sourceWell={pump.tank_name || 'خزان غير محدد'}
                                onEdit={() => handleEdit(pump)}
                                onDelete={() => openDeleteModal(pump)}
                            />
                        </motion.div>
                    ))}
                </Grid>
            )}
        </motion.div>
    );
}
