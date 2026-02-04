import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Button, Badge } from '@tremor/react';
import { Search, Download, Trash2, Edit, Truck, Droplet, AlertTriangle, CheckCircle2, LayoutGrid, List as ListIcon, Plus, Ruler } from 'lucide-react';
import { toast } from 'sonner';
import DischargeModal from './DischargeModal';
import AddTankModal from './AddTankModal';
import SimpleCalibrationModal from './SimpleCalibrationModal';

import DeleteConfirmationModal from './DeleteConfirmationModal';
import TransferAndDeleteModal from './TransferAndDeleteModal';
import SuccessAnimation from './SuccessAnimation';
import FuelTankCard from './FuelTankCard';

export default function TankList({ tanks = [], suppliers = [], fuelSettings = [], generalSettings = {}, fuelTypes = [] }) {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [isDischargeOpen, setIsDischargeOpen] = useState(false);
    const [isAddTankOpen, setIsAddTankOpen] = useState(false);
    const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
    const [selectedTank, setSelectedTank] = useState(null);
    const [editingTank, setEditingTank] = useState(null);

    // Delete Flow State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [tankToDelete, setTankToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSuccess = () => {
        setIsAddTankOpen(false);
        setEditingTank(null); // Clear editing state
        window.location.reload(); // Simple reload to fetch new data
    };

    const handleEdit = (tank) => {
        setEditingTank(tank);
        setIsAddTankOpen(true);
    };

    const initiateDelete = async (tank) => {
        setTankToDelete(tank);
        // Optimistically check if we know it's empty to skip server check if obviously full?
        // Actually, safer to ask server anyway or trust local data for initial UI
        // Let's use local data for speed, server will double check.
        if (tank.current > 1) {
             setTransferModalOpen(true);
        } else {
             setDeleteModalOpen(true);
        }
    };

    const confirmSimpleDelete = async () => {
        if (!tankToDelete) return;
        setIsDeleting(true);
        const baseUrl = window.BASE_URL || '/PETRODIESEL2/public';

        try {
            const response = await fetch(`${baseUrl}/tanks/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tankToDelete.id })
            });
            const result = await response.json();
            
            if (result.success) {
                setDeleteModalOpen(false);
                setSuccessMessage('تم حذف الخزان بنجاح');
                setShowSuccess(true);
            } else if (result.requires_transfer) {
                // Server says it's not empty (maybe data sync issue), open transfer modal
                setDeleteModalOpen(false);
                setTransferModalOpen(true);
                toast.warning(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل في حذف الخزان');
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmTransferAndDelete = async (tankId, transfersData) => {
        const baseUrl = window.BASE_URL || '/PETRODIESEL2/public';
        try {
            const response = await fetch(`${baseUrl}/tanks/transfer_and_delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: tankId, 
                    transfers: transfersData // Use the structured data array
                })
            });
            const result = await response.json();
            
            if (result.success) {
                setTransferModalOpen(false);
                setSuccessMessage(result.message);
                setShowSuccess(true);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('فشل في العملية');
        }
    };

    // Normalize Data
    const normalizedTanks = (tanks || []).map(tank => {
        const capacity = Number(tank.capacity_liters || 0);
        const current = Number(tank.current_volume || 0);
        const percentage = capacity > 0 ? ((current / capacity) * 100) : 0;
        
        return {
            id: tank.id,
            name: tank.name,
            product: tank.product_type || 'Fuel',
            fuel_type_id: tank.fuel_type_id, // Pass this through for editing
            total_cap: capacity,
            current: current,
            current_volume: current, // Add for modal compatibility
            capacity_liters: capacity, // Add for modal compatibility
            current_price: tank.current_price, // Pass through
            percentage: Math.min(100, Math.max(0, Number(percentage.toFixed(1)))),
            status: percentage < 20 ? 'Low Stock' : 'Active'
        };
    });

    const filteredTanks = normalizedTanks.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.product.toLowerCase().includes(search.toLowerCase())
    );

// Helper to format volume based on settings
    const formatVolume = (liters) => {
        const mode = generalSettings.volume_display_mode || 'liters';
        const gallons = liters / 4.5;
        
        if (mode === 'gallons') {
            return (
                <div className="flex flex-col items-end">
                   <span>{gallons.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs text-slate-400">Gal</span></span>
                </div>
            );
        }
        
        if (mode === 'both') {
            return (
                <div className="flex flex-col items-end text-right">
                    <span className="text-sm text-emerald-600 font-bold">{gallons.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px]">Gal</span></span>
                    <span className="text-[10px] text-slate-400">{liters.toLocaleString()} L</span>
                </div>
            );
        }

        // Default: Liters
        return (
            <span>{liters.toLocaleString()} <span className="text-xs text-slate-400">L</span></span>
        );
    };

    // Visual Tank Card Component
    const TankCard = ({ tank }) => {
        // Color logic
        let liquidColor = 'bg-blue-500';
        if (tank.product.includes('Diesel')) liquidColor = 'bg-amber-500';
        if (tank.product.includes('91')) liquidColor = 'bg-emerald-500';
        if (tank.product.includes('95')) liquidColor = 'bg-rose-500';

        const mode = generalSettings.volume_display_mode || 'liters';
        
        return (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
                <div className="flex justify-between items-start mb-4">
                    <Badge size="xs" color={tank.status === 'Low Stock' ? 'red' : 'slate'}>
                        {tank.product}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => { setSelectedTank(tank); setCalibrationModalOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="معايرة الخزان"
                        >
                            <Ruler className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => handleEdit(tank)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            <Edit className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => initiateDelete(tank)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center mb-6">
                    {/* Tank Visual Container */}
                    <div className="relative w-24 h-36 bg-slate-100 rounded-xl border-4 border-slate-200 overflow-hidden mb-4 shadow-inner">
                        {/* Liquid */}
                        <motion.div 
                            className={`absolute bottom-0 left-0 w-full ${liquidColor} opacity-80`}
                            initial={{ height: 0 }}
                            animate={{ height: `${tank.percentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/30" />
                            {/* Bubbles effect could go here */}
                        </motion.div>
                        
                        {/* Ruler markings */}
                        <div className="absolute right-0 top-0 h-full w-full flex flex-col justify-between py-2 px-1 items-end pointer-events-none opacity-30">
                            {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-[1px] bg-slate-900" />)}
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-slate-800 text-center">{tank.name}</h3>
                    <div className="text-2xl font-black text-slate-900 font-mono mt-1 flex flex-col items-center" dir="ltr">
                        {mode === 'gallons' && (
                             <span>{(tank.current / 4.5).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs text-slate-400 font-sans font-medium">Gal</span></span>
                        )}
                        {mode === 'liters' && (
                             <span>{tank.current.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-medium">L</span></span>
                        )}
                        {mode === 'both' && (
                            <>
                                <span className="text-emerald-600 text-xl">{(tank.current / 4.5).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-[10px] text-emerald-400 font-sans font-medium">Gal</span></span>
                                <span className="text-sm text-slate-400">{tank.current.toLocaleString()} L</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t pt-4">
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <span className="block text-slate-400 mb-1">السعة الكلية</span>
                        <span className="font-mono font-bold text-slate-700">
                             {mode === 'gallons' ? (tank.total_cap / 4.5).toLocaleString(undefined, { maximumFractionDigits: 0 }) : tank.total_cap.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                        <span className="block text-slate-400 mb-1">النسبة</span>
                        <span className={`font-mono font-bold ${tank.percentage < 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {tank.percentage}%
                        </span>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 max-w-[1800px] mx-auto space-y-8"
        >
            {/* Consolidated Header & Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                
                {/* Search & View Toggles */}
                 <div className="flex w-full xl:w-auto gap-4">
                    <div className="relative flex-1 xl:w-96">
                        <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                        <TextInput 
                            placeholder="بحث عن خزان أو منتج..." 
                            className="pl-4 pr-10 py-2 rounded-xl border-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                     <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="شبكة"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="قائمة"
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex gap-2 w-full xl:w-auto justify-end overflow-x-auto pb-1 xl:pb-0">
                    <Button 
                        variant="secondary" 
                        className="rounded-xl font-bold border-slate-200 hover:border-emerald-500 hover:text-emerald-600 whitespace-nowrap"
                        onClick={() => { setTankToDelete(null); setTransferModalOpen(true); }} // Open transfer modal without specific tank (Source select mode)
                    >
                        <span className="flex items-center gap-2">
                             <span className="text-xl">⇄</span> التحويلات
                        </span>
                    </Button>

                    <Button 
                        variant="secondary" 
                        icon={Plus} 
                        className="rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-100 whitespace-nowrap"
                        onClick={() => { setEditingTank(null); setIsAddTankOpen(true); }}
                    >
                        إضافة خزان
                    </Button>
                    <button 
                        className="custom-btn btn"
                        onClick={() => setIsDischargeOpen(true)}
                    >
                        <span>تفريغ شحنة</span>
                    </button>
                    <Button variant="secondary" icon={Download} className="rounded-xl font-bold border-slate-200 whitespace-nowrap">تقرير</Button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filteredTanks.map(tank => (
                        <FuelTankCard 
                            key={tank.id} 
                            tank={tank} 
                            onEdit={() => handleEdit(tank)}
                            onDelete={() => initiateDelete(tank)}
                            onCalibrate={() => { setSelectedTank(tank); setCalibrationModalOpen(true); }}
                        />
                    ))}
                    {filteredTanks.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-400">
                            لا توجد خزانات مطابقة للبحث
                        </div>
                    )}
                </div>
            )}

            {/* List View (Table) */}
            {viewMode === 'list' && (
                 <Card className="rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-slate-600">اسم الخزان</th>
                                    <th className="p-4 text-sm font-bold text-slate-600">المنتج</th>
                                    <th className="p-4 text-sm font-bold text-slate-600 w-1/3">المستوى</th>
                                    <th className="p-4 text-sm font-bold text-slate-600">السعة</th>
                                    <th className="p-4 text-sm font-bold text-slate-600">الحالي</th>
                                    <th className="p-4 text-sm font-bold text-slate-600 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTanks.map((tank) => (
                                    <tr key={tank.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 font-bold text-navy-900 flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg"><Droplet className="w-5 h-5 text-blue-500" /></div>
                                            {tank.name}
                                        </td>
                                        <td className="p-4"><Badge size="xs" color="slate">{tank.product}</Badge></td>
                                        <td className="p-4 flex items-center gap-2">
                                            <span className="text-xs font-bold w-10">{tank.percentage}%</span>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${tank.percentage}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono">
                                            {generalSettings.volume_display_mode === 'gallons' ? (tank.total_cap / 4.5).toLocaleString(undefined, { maximumFractionDigits: 0 }) : tank.total_cap.toLocaleString()}
                                        </td>
                                        <td className="p-4 font-mono font-bold">
                                            {formatVolume(tank.current)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { setSelectedTank(tank); setCalibrationModalOpen(true); }}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                    title="معايرة"
                                                >
                                                    <Ruler className="w-4 h-4"/>
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(tank)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit className="w-4 h-4"/>
                                                </button>
                                                <button 
                                                    onClick={() => initiateDelete(tank)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <SuccessAnimation 
                isVisible={showSuccess} 
                message={successMessage}
                onComplete={() => window.location.reload()}
            />

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmSimpleDelete}
                title="حذف الخزان"
                message={`هل أنت متأكد من حذف الخزان "${tankToDelete?.name}"؟`}
                isDeleting={isDeleting}
            />

            <TransferAndDeleteModal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                tank={tankToDelete}
                tanks={normalizedTanks} // Pass normalized for consistency or props.tanks if needed, but normalized has clean data
                onConfirm={confirmTransferAndDelete}
            />

            {/* Discharge Modal */}
            <DischargeModal 
                isOpen={isDischargeOpen} 
                onClose={() => setIsDischargeOpen(false)}
                tanks={tanks}
                suppliers={suppliers}
            />

            {/* Add Tank Modal */}
            <AddTankModal 
                isOpen={isAddTankOpen}
                onClose={() => setIsAddTankOpen(false)}
                onSuccess={handleSuccess}
                fuelSettings={fuelSettings}
                fuelTypes={fuelTypes}
                tank={editingTank} 
            />

            {/* Calibration Modal */}
            <SimpleCalibrationModal 
                isOpen={calibrationModalOpen}
                onClose={() => setCalibrationModalOpen(false)}
                tank={selectedTank}
                onSuccess={handleSuccess}
            />
        </motion.div>
    );
}
