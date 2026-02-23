import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, Grid } from '@tremor/react';
import { Fuel, Gauge, User, Settings, Trash2, Plus, Zap, LayoutGrid, List, Filter } from 'lucide-react';
import EditPumpModal from './EditPumpModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import SuccessAnimation from './SuccessAnimation';
import FuelPumpCard from './FuelPumpCard';
import { can } from './utils/permissions';

export default function PumpList({ pumps = [], tanks = [], workers = [], user }) {
    // ═══ View Mode (persisted) ═══
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('pumps_view_mode') || 'grid');
    const toggleView = (mode) => { setViewMode(mode); localStorage.setItem('pumps_view_mode', mode); };

    // ═══ Fuel Type Filter (persisted) ═══
    const [fuelFilter, setFuelFilter] = useState(() => localStorage.getItem('pumps_fuel_filter') || 'all');
    const setFilter = (f) => { setFuelFilter(f); localStorage.setItem('pumps_fuel_filter', f); };

    // Get unique fuel types
    const fuelTypes = useMemo(() => {
        const types = [...new Set(pumps.map(p => p.product_type).filter(Boolean))];
        return types;
    }, [pumps]);

    // Filtered pumps
    const filteredPumps = useMemo(() => {
        if (fuelFilter === 'all') return pumps;
        return pumps.filter(p => p.product_type === fuelFilter);
    }, [pumps, fuelFilter]);

    // ═══ Success Animation State ═══
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // ═══ Delete Modal State ═══
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (pump) => { setItemToDelete(pump); setDeleteModalOpen(true); };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const form = new FormData();
        form.append('id', itemToDelete.id);
        try {
            const response = await fetch('/PETRODIESEL2/public/pumps/delete_ajax', { method: 'POST', body: form });
            const data = await response.json();
            if (data.success) {
                setDeleteModalOpen(false);
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
            if (!showSuccess) { setDeleteModalOpen(false); setItemToDelete(null); }
        }
    };

    const handleAnimationComplete = () => { setShowSuccess(false); window.location.reload(); };

    // ═══ Edit Modal State ═══
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [pumpToEdit, setPumpToEdit] = useState(null);
    const handleEdit = (pump) => { setPumpToEdit(pump); setEditModalOpen(true); };

    // ═══ Animations ═══
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    // ═══ Fuel type color helpers ═══
    const getFuelColor = (type) => {
        if (!type) return { bg: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200/50 dark:border-slate-500/20', dot: 'bg-slate-400' };
        const t = type.toLowerCase();
        if (t.includes('ديزل') || t.includes('diesel') || t.includes('جاز') || t.includes('سولار'))
            return { bg: 'bg-blue-50/80 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200/50 dark:border-blue-500/20', dot: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-600' };
        if (t.includes('بنزين') || t.includes('gasoline') || t.includes('petrol'))
            return { bg: 'bg-orange-50/80 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200/50 dark:border-orange-500/20', dot: 'bg-orange-500', gradient: 'from-orange-500 to-amber-500' };
        return { bg: 'bg-emerald-50/80 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200/50 dark:border-emerald-500/20', dot: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500' };
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 max-w-[1900px] mx-auto">
            <SuccessAnimation isVisible={showSuccess} message={successMessage} onComplete={handleAnimationComplete} />
            <DeleteConfirmationModal
                isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete}
                title="تحذير: حذف ماكينة وقود" isDeleting={isDeleting}
                message={`سيتم حذف الماكينة "${itemToDelete?.name}" وجميع عداداتها المرتبطة. هل أنت متأكد من الحذف؟`}
            />
            {pumpToEdit && (
                <EditPumpModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} pump={pumpToEdit} tanks={tanks} workers={workers} />
            )}

            {/* ═══ Toolbar ═══ */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                {/* Left: View Toggle + Fuel Filter */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg">
                        <button
                            onClick={() => toggleView('grid')}
                            className={`relative p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'}`}
                            title="عرض شبكي"
                        >
                            {viewMode === 'grid' && (
                                <motion.div layoutId="viewToggle" className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md shadow-blue-500/30" transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                            )}
                            <LayoutGrid className="w-5 h-5 relative z-10" />
                        </button>
                        <button
                            onClick={() => toggleView('list')}
                            className={`relative p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'}`}
                            title="عرض عمودي"
                        >
                            {viewMode === 'list' && (
                                <motion.div layoutId="viewToggle" className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md shadow-blue-500/30" transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                            )}
                            <List className="w-5 h-5 relative z-10" />
                        </button>
                    </div>

                    {/* Fuel Type Filter */}
                    {fuelTypes.length > 0 && (
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg">
                            <button
                                onClick={() => setFilter('all')}
                                className={`relative px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${fuelFilter === 'all' ? 'text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5'}`}
                            >
                                {fuelFilter === 'all' && (
                                    <motion.div layoutId="fuelFilter" className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg shadow-md" transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <Filter className="w-3.5 h-3.5" /> الكل
                                </span>
                            </button>
                            {fuelTypes.map(type => {
                                const fc = getFuelColor(type);
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        className={`relative px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${fuelFilter === type ? 'text-white shadow-lg' : `${fc.text} hover:bg-slate-100/50 dark:hover:bg-white/5`}`}
                                    >
                                        {fuelFilter === type && (
                                            <motion.div layoutId="fuelFilter" className={`absolute inset-0 bg-gradient-to-r ${fc.gradient || 'from-blue-500 to-indigo-600'} rounded-lg shadow-md`} transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                                        )}
                                        <span className="relative z-10 flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${fuelFilter === type ? 'bg-white' : fc.dot}`}></span>
                                            {type}
                                        </span>
                                    </button>
                                );
                            })}
                            {fuelFilter !== 'all' && (
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1">
                                    ({filteredPumps.length})
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Add Button - Only shown if user has pumps.create permission */}
                {can(user, 'pumps.create') && (
                <a
                    href="/PETRODIESEL2/public/pumps/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 font-bold dark:bg-blue-600 dark:hover:bg-blue-700 dark:shadow-none"
                >
                    <Plus className="w-5 h-5" /> إضافة ماكينة
                </a>
                )}
            </div>

            {/* ═══ Content ═══ */}
            {filteredPumps.length === 0 ? (
                <Card className="relative overflow-hidden text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200 dark:bg-white/5 dark:backdrop-blur-xl dark:border-blue-400/20 dark:shadow-[0_0_40px_-10px_rgba(59,130,246,0.1)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4 text-slate-400 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-1 dark:ring-blue-400/20">
                            <Fuel className="w-12 h-12" />
                        </div>
                        <Title className="text-slate-600 dark:text-blue-100 dark:drop-shadow-sm">
                            {fuelFilter !== 'all' ? `لا توجد مكائن من نوع "${fuelFilter}"` : 'لا توجد مكائن مضافة'}
                        </Title>
                        <Text className="mt-2 text-slate-400 dark:text-slate-400">
                            {fuelFilter !== 'all' ? 'جرّب تغيير الفلتر أو أضف ماكينة جديدة' : 'ابدأ بإضافة أول ماكينة وقود للنظام'}
                        </Text>
                    </div>
                </Card>
            ) : viewMode === 'grid' ? (
                /* ═══ Grid View ═══ */
                <Grid numItems={2} numItemsMd={3} numItemsLg={5} className="gap-4">
                    {filteredPumps.map((pump) => (
                        <motion.div key={pump.id} variants={itemVariants}>
                            <FuelPumpCard
                                pumpName={pump.name}
                                fuelType={pump.product_type || 'وقود'}
                                counters={pump.counters || []}
                                sourceWell={pump.tank_name || 'خزان غير محدد'}
                                onEdit={can(user, 'pumps.edit') ? () => handleEdit(pump) : null}
                                onDelete={can(user, 'pumps.delete') ? () => openDeleteModal(pump) : null}
                            />
                        </motion.div>
                    ))}
                </Grid>
            ) : (
                /* ═══ List View ═══ */
                <div className="space-y-2">
                    {filteredPumps.map((pump) => {
                        const counters = pump.counters || [];
                        const fc = getFuelColor(pump.product_type);
                        const isDiesel = pump.product_type && (pump.product_type.includes('ديزل') || pump.product_type.includes('Diesel') || pump.product_type.includes('جاز'));

                        return (
                            <motion.div key={pump.id} variants={itemVariants}>
                                <div className="relative overflow-hidden rounded-xl bg-white/90 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow hover:shadow-lg transition-all group">
                                    {/* Color accent line */}
                                    <div className={`absolute top-0 right-0 bottom-0 w-1 bg-gradient-to-b ${isDiesel ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-amber-500'}`} />

                                    <div className="relative z-10 flex items-stretch">
                                        {/* ── Left: Pump Info (fixed width) ── */}
                                        <div className="flex items-center gap-3 p-3 pl-4 min-w-0" style={{ width: '420px', flexShrink: 0 }}>
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${isDiesel ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-amber-500'} flex items-center justify-center shadow ${isDiesel ? 'shadow-blue-500/20' : 'shadow-orange-500/20'}`}>
                                                <Fuel className="w-5 h-5 text-white" />
                                            </div>

                                            {/* Name */}
                                            <h3 className="font-black text-base text-slate-800 dark:text-white truncate flex-1 min-w-0">{pump.name}</h3>

                                            {/* Fuel Type Badge */}
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${fc.bg} border ${fc.border} flex-shrink-0`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${fc.dot}`}></span>
                                                <span className={`text-xs font-bold ${fc.text}`}>{pump.product_type || 'وقود'}</span>
                                            </div>

                                            {/* Tank */}
                                            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex-shrink-0">
                                                <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{pump.tank_name || 'غير محدد'}</span>
                                            </div>
                                        </div>

                                        {/* ── Vertical Divider ── */}
                                        <div className={`w-px flex-shrink-0 ${isDiesel ? 'bg-blue-200/40 dark:bg-blue-500/15' : 'bg-orange-200/40 dark:bg-orange-500/15'}`} />

                                        {/* ── Center: Counters (stacked vertically) ── */}
                                        <div className="flex-1 min-w-0">
                                            {counters.length > 0 ? (
                                                counters.map((counter, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center justify-center gap-3 px-4 py-2 ${
                                                            idx < counters.length - 1
                                                                ? isDiesel ? 'border-b border-blue-100/40 dark:border-blue-500/10' : 'border-b border-orange-100/40 dark:border-orange-500/10'
                                                                : ''
                                                        }`}
                                                    >
                                                        {/* Counter index */}
                                                        <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black
                                                            ${isDiesel
                                                                ? 'bg-blue-100/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                : 'bg-orange-100/80 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                            }`}>
                                                            {idx + 1}
                                                        </span>

                                                        {/* Worker icon + name */}
                                                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate" style={{ width: '140px' }}>
                                                            {counter.worker_name || 'عامل غير مخصص'}
                                                        </span>

                                                        {/* Divider */}
                                                        <div className="h-5 w-px bg-slate-200/50 dark:bg-white/10 flex-shrink-0"></div>

                                                        {/* Reading */}
                                                        <div className="flex items-center gap-1.5 flex-shrink-0" style={{ width: '120px' }}>
                                                            <span className="font-mono text-sm font-black text-slate-800 dark:text-white tabular-nums">
                                                                {parseFloat(counter.current_reading || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">لتر</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-center h-full px-4 py-2">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">لا توجد عدادات</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Vertical Divider ── */}
                                        <div className={`w-px flex-shrink-0 ${isDiesel ? 'bg-blue-200/40 dark:bg-blue-500/15' : 'bg-orange-200/40 dark:bg-orange-500/15'}`} />

                                        {/* ── Right: Actions (permission-gated) ── */}
                                        <div className="flex items-center gap-1.5 px-3 flex-shrink-0">
                                            {can(user, 'pumps.edit') && (
                                            <button
                                                onClick={() => handleEdit(pump)}
                                                className="p-2 rounded-lg bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all hover:scale-105"
                                                title="تعديل"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                            </button>
                                            )}
                                            {can(user, 'pumps.delete') && (
                                            <button
                                                onClick={() => openDeleteModal(pump)}
                                                className="p-2 rounded-lg bg-red-50/80 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all hover:scale-105"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
