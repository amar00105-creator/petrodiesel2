import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, FileText, User, Hash, Droplet, ArrowRight, Save, Search, AlertCircle, Check, MapPin, Fuel, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function DischargeModal({ isOpen, onClose, tanks = [] }) {
    const [step, setStep] = useState('select'); // 'select' | 'distribute' | 'success'
    const [loading, setLoading] = useState(false);
    const [pendingShipments, setPendingShipments] = useState([]);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [distributions, setDistributions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');

    // Fetch pending shipments when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPendingShipments();
            setStep('select');
            setSelectedShipment(null);
            setDistributions([]);
            setSupplierInvoiceNo('');
        }
    }, [isOpen]);

    const fetchPendingShipments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${window.BASE_URL}/purchases/getPending`);
            const data = await res.json();
            if (data.success) {
                setPendingShipments(data.data);
            } else {
                toast.error('فشل في تحميل الشحنات المعلقة');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    // Get fuel color from shipment data or fallback
    const getFuelColor = (shipment) => {
        if (shipment?.fuel_color_hex) return shipment.fuel_color_hex;
        const t = (shipment?.fuel_type || '').toLowerCase();
        if (t.includes('ديزل') || t.includes('diesel')) return '#f59e0b';
        if (t.includes('بنزين') || t.includes('petrol') || t.includes('91') || t.includes('95')) return '#10b981';
        if (t.includes('غاز') || t.includes('gas')) return '#8b5cf6';
        return '#3b82f6';
    };

    const handleSelectShipment = (shipment) => {
        setSelectedShipment(shipment);
        
        // Normalize fuel type for matching (Arabic -> English keyword)
        const getFuelKeyword = (type) => {
            if (!type) return '';
            const t = type.toLowerCase();
            if (t.includes('ديزل') || t.includes('diesel')) return 'diesel';
            if (t.includes('بنزين') || t.includes('petrol') || t.includes('gasoline') || t.includes('91') || t.includes('95')) return 'petrol';
            if (t.includes('غاز') || t.includes('gas') || t.includes('lpg')) return 'gas';
            return t; // fallback
        };

        const fuelTypeKeyword = getFuelKeyword(shipment.fuel_type);

        const relevantTanks = tanks.filter(t => {
            // Priority 1: Match by ID (Most Robust)
            if (shipment.fuel_type_id && t.fuel_type_id) {
                return String(shipment.fuel_type_id) === String(t.fuel_type_id);
            }

            // Priority 2: Fallback to Name Matching
            if (!fuelTypeKeyword) return true; 
            
            // properties from raw DB objects: product_type
            const pType = (t.product_type || t.product || '').toLowerCase();
            
            // Flexible matching
            if (fuelTypeKeyword === 'petrol') {
                return pType.includes('petrol') || pType.includes('gasoline') || pType.includes('91') || pType.includes('95') || pType.includes('بنزين');
            }
            if (fuelTypeKeyword === 'diesel') {
                return pType.includes('diesel') || pType.includes('ديزل');
            }
            if (fuelTypeKeyword === 'gas') {
                return pType.includes('gas') || pType.includes('lpg') || pType.includes('غاز');
            }
            
            return pType.includes(fuelTypeKeyword);
        });

        if (relevantTanks.length === 0) {
            toast.warning(`لا توجد خزانات مطابقة لنوع الوقود: ${shipment.fuel_type}`);
        }

        setDistributions(relevantTanks.map(t => ({
            id: t.id,
            name: t.name,
            current: Number(t.current_volume || 0),
            capacity: Number(t.capacity_liters || 0),
            product: t.product_type,
            quantity: 0
        })));
        
        setStep('distribute');
    };

    const handleDistributionChange = (id, value) => {
        setDistributions(prev => prev.map(d => 
            d.id === id ? { ...d, quantity: Number(value) } : d
        ));
    };

    const handleSubmit = async () => {
        const totalDistributed = distributions.reduce((sum, d) => sum + d.quantity, 0);
        const shipmentVolume = Number(selectedShipment.volume_ordered);
        
        // Validate total matches shipment volume (allow tiny variance for float errors?)
        if (Math.abs(totalDistributed - shipmentVolume) > 1) {
            toast.error(`الكمية الموزعة (${totalDistributed.toLocaleString()}) لا تطابق كمية الشحنة (${shipmentVolume.toLocaleString()})`);
            return;
        }

        // Validate tank capacities
        const overfilledTank = distributions.find(d => (d.current + d.quantity) > d.capacity);
        if (overfilledTank) {
            toast.error(`الخزان ${overfilledTank.name} سيمتلئ فوق سعته!`);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${window.BASE_URL}/purchases/processDischarge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchase_id: selectedShipment.id,
                    tanks: distributions.map(d => ({ id: d.id, quantity: d.quantity })),
                    supplier_invoice_no: supplierInvoiceNo || null
                })
            });
            const result = await response.json();

            if (result.success) {
                setStep('success');
                // Delay reload to show the animation
                setTimeout(() => {
                    onClose();
                    window.location.reload(); 
                }, 4000);
            } else {
                toast.error(result.message || 'حدث خطأ');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    const filteredShipments = pendingShipments.filter(s => 
        (s.invoice_number?.includes(searchTerm)) ||
        (s.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={step !== 'success' ? onClose : undefined}
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div 
                            className="bg-white pointer-events-auto rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden dark:ring-1 dark:ring-white/15"
                            style={{
                                ...(document.documentElement.classList.contains('dark') ? {
                                    background: 'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(30,41,59,0.95))',
                                    backdropFilter: 'blur(24px)',
                                    boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 30px -10px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                                } : {})
                            }}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600/90 dark:to-indigo-600/80 p-5 text-white flex justify-between items-center shrink-0" style={{ backdropFilter: 'blur(10px)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">تفريغ شحنة وقود</h2>
                                        <p className="text-blue-100 dark:text-blue-200/70 text-sm">
                                            {step === 'select' ? 'اختر الشحنة المراد تفريغها' : step === 'success' ? 'تم التفريغ بنجاح' : `توزيع شحنة #${selectedShipment?.invoice_number}`}
                                        </p>
                                    </div>
                                </div>
                                {step !== 'success' && (
                                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20"><X className="w-5 h-5" /></button>
                                )}
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-transparent">
                                
                                {/* Step 1: Select Shipment */}
                                {step === 'select' && (
                                    <div className="flex flex-col h-full">
                                        <div className="p-4 bg-white dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.08]">
                                            <div className="relative">
                                                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                                <input 
                                                    type="text" 
                                                    placeholder="بحث برقم الفاتورة أو اسم المورد..." 
                                                    className="w-full pl-4 pr-10 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-slate-200 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-500/50 outline-none transition-colors"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {loading && <div className="text-center py-10 text-slate-500 dark:text-slate-400">جاري التحميل...</div>}
                                            
                                            {!loading && filteredShipments.length === 0 && (
                                                <div className="text-center py-12 flex flex-col items-center text-slate-400 dark:text-slate-500">
                                                    <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full mb-3"><FileText className="w-8 h-8"/></div>
                                                    <p>لا توجد شحنات معلقة.</p>
                                                    <button onClick={onClose} className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline">إلغاء</button>
                                                </div>
                                            )}

                                            {filteredShipments.map(shipment => {
                                                const fuelColor = getFuelColor(shipment);
                                                return (
                                                <motion.div 
                                                    key={shipment.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onClick={() => handleSelectShipment(shipment)}
                                                    className="bg-white dark:bg-white/[0.04] dark:backdrop-blur-xl p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-400 dark:hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-blue-500/10 cursor-pointer transition-all group ring-1 ring-black/[0.02] dark:ring-white/[0.04]"
                                                >
                                                    {/* All info in ONE row */}
                                                    <div className="flex items-center gap-3">
                                                        {/* Truck Icon colored by fuel type */}
                                                        <div 
                                                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                                            style={{ 
                                                                backgroundColor: fuelColor + '18',
                                                                color: fuelColor,
                                                                boxShadow: `0 2px 8px ${fuelColor}20`
                                                            }}
                                                        >
                                                            <Truck className="w-5 h-5" />
                                                        </div>

                                                        {/* Station / Supplier */}
                                                        <div className="min-w-0 shrink-0">
                                                            <div className="font-bold text-sm text-slate-800 dark:text-white truncate">{shipment.supplier_name}</div>
                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">المورد</div>
                                                        </div>

                                                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 shrink-0"></div>

                                                        {/* Invoice Number */}
                                                        <div className="shrink-0">
                                                            <div className="font-bold text-sm text-slate-700 dark:text-slate-200 font-mono">#{shipment.invoice_number}</div>
                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">الفاتورة</div>
                                                        </div>

                                                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 shrink-0"></div>

                                                        {/* Driver */}
                                                        <div className="shrink-0 flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                            <div>
                                                                <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{shipment.driver_name || '---'}</div>
                                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">السائق</div>
                                                            </div>
                                                        </div>

                                                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 shrink-0"></div>

                                                        {/* Truck Number */}
                                                        <div className="shrink-0 flex items-center gap-1.5">
                                                            <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                                            <div>
                                                                <div className="font-semibold text-sm text-slate-700 dark:text-slate-200 font-mono">{shipment.truck_number || '---'}</div>
                                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">الشاحنة</div>
                                                            </div>
                                                        </div>

                                                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 shrink-0"></div>

                                                        {/* Fuel Name - colored by fuel settings */}
                                                        <div className="shrink-0">
                                                            <div className="font-bold text-sm truncate" style={{ color: fuelColor }}>{shipment.fuel_type || 'غير محدد'}</div>
                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">الوقود</div>
                                                        </div>

                                                        {/* Spacer */}
                                                        <div className="flex-1"></div>

                                                        {/* Quantity Badge */}
                                                        <div className="shrink-0 text-left">
                                                            <div className="font-black text-base text-slate-800 dark:text-white font-mono leading-none">{Number(shipment.volume_ordered).toLocaleString()}<span className="text-[10px] text-slate-400 mr-0.5">L</span></div>
                                                        </div>

                                                        {/* Arrow */}
                                                        <div className="text-blue-500 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Distribute */}
                                {step === 'distribute' && selectedShipment && (() => {
                                    const fuelColor = getFuelColor(selectedShipment);
                                    const totalDistributed = distributions.reduce((a,b) => a + b.quantity, 0);
                                    const remaining = Number(selectedShipment.volume_ordered) - totalDistributed;

                                    return (
                                    <div className="flex-1 overflow-y-auto p-5">
                                        {/* ═══ Compact Shipment Info Header ═══ */}
                                        <div className="bg-white/90 dark:bg-white/[0.05] dark:backdrop-blur-xl p-3 rounded-xl border border-slate-200/60 dark:border-white/[0.1] shadow-sm dark:shadow-none mb-5 ring-1 ring-black/[0.02] dark:ring-white/[0.04]">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {/* Fuel Icon */}
                                                <div 
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: fuelColor + '18', color: fuelColor }}
                                                >
                                                    <Truck className="w-4.5 h-4.5" />
                                                </div>

                                                {/* Info chips - compact row */}
                                                <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/80 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
                                                        <MapPin className="w-3 h-3 text-slate-400" />{selectedShipment.supplier_name}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg font-mono">
                                                        #{selectedShipment.invoice_number}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg">
                                                        <User className="w-3 h-3 text-slate-400" />{selectedShipment.driver_name || '---'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg font-mono">
                                                        <Truck className="w-3 h-3 text-slate-400" />{selectedShipment.truck_number || '---'}
                                                    </span>
                                                    <span 
                                                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg"
                                                        style={{ backgroundColor: fuelColor + '15', color: fuelColor }}
                                                    >
                                                        <Droplet className="w-3 h-3" />{selectedShipment.fuel_type || 'غير محدد'}
                                                    </span>
                                                </div>

                                                {/* Volume & Remaining */}
                                                <div className="flex items-center gap-3 shrink-0 mr-auto">
                                                    <div className="text-center">
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">الكمية</div>
                                                        <div className="font-black text-sm text-slate-800 dark:text-white font-mono">{Number(selectedShipment.volume_ordered).toLocaleString()} <span className="text-[9px] text-slate-400">L</span></div>
                                                    </div>
                                                    <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                                                    <div className="text-center">
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">المتبقي</div>
                                                        <div className={`font-black text-sm font-mono ${remaining === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {remaining.toLocaleString()} <span className="text-[9px] text-slate-400">L</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            <Droplet className="w-4 h-4 text-blue-500"/>
                                            توزيع الوقود على الخزانات المتاحة
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            {distributions.map(dist => {
                                                const availableSpace = dist.capacity - dist.current;
                                                const fillPercentage = Math.min(100, ((dist.current + dist.quantity) / dist.capacity) * 100);
                                                const currentPercentage = (dist.current / dist.capacity) * 100;
                                                const isOverfilled = (dist.current + dist.quantity) > dist.capacity;
                                                const spacePercentage = ((availableSpace) / dist.capacity) * 100;

                                                return (
                                                    <div key={dist.id} className={`bg-white dark:bg-white/[0.04] dark:backdrop-blur-sm p-4 rounded-xl border transition-all ring-1 ${isOverfilled ? 'border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 ring-red-500/10' : (dist.quantity > 0 ? 'border-blue-400/50 dark:border-blue-500/30 shadow-sm ring-blue-500/5 dark:ring-blue-500/10' : 'border-slate-200/80 dark:border-white/[0.08] ring-black/[0.02] dark:ring-white/[0.04]')}`}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-bold text-sm text-slate-800 dark:text-white">{dist.name}</div>
                                                            </div>
                                                            {/* Centered capacity/current */}
                                                            <div className="flex items-center gap-4 text-center flex-1 justify-center">
                                                                <div>
                                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">السعة</div>
                                                                    <div className="font-mono font-bold text-sm text-slate-700 dark:text-slate-200">{dist.capacity.toLocaleString()}</div>
                                                                </div>
                                                                <div className="h-5 w-px bg-slate-200 dark:bg-white/10"></div>
                                                                <div>
                                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">الحالي</div>
                                                                    <div className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{dist.current.toLocaleString()}</div>
                                                                </div>
                                                            </div>
                                                            {/* Available space with progress bar */}
                                                            <div className="text-right flex items-center gap-3 shrink-0">
                                                                <div className="w-20">
                                                                    <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className="h-full rounded-full transition-all duration-300"
                                                                            style={{ 
                                                                                width: `${spacePercentage}%`,
                                                                                backgroundColor: spacePercentage > 50 ? '#10b981' : spacePercentage > 20 ? '#f59e0b' : '#ef4444'
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">فارغ</div>
                                                                    <div className={`font-mono font-bold text-sm ${spacePercentage > 50 ? 'text-emerald-600 dark:text-emerald-400' : spacePercentage > 20 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{availableSpace.toLocaleString()} L</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                                                                    <div className="absolute top-0 left-0 h-full bg-slate-300 w-full opacity-20"></div>
                                                                    <motion.div 
                                                                        initial={{ width: `${currentPercentage}%` }}
                                                                        animate={{ width: `${fillPercentage}%` }}
                                                                        transition={{ type: 'spring', stiffness: 100 }}
                                                                        className={`h-full rounded-full ${isOverfilled ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                                                                    />
                                                                    {/* Original Level Marker */}
                                                                    <div className="absolute top-0 h-full w-0.5 bg-slate-800 dark:bg-white z-10 opacity-50" style={{ left: `${currentPercentage}%` }} />
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                                                                    <span>0%</span>
                                                                    <span className={`font-bold ${isOverfilled ? 'text-red-500' : 'text-blue-500'}`}>{fillPercentage.toFixed(1)}%</span>
                                                                    <span>100%</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-36 relative">
                                                                <input 
                                                                    type="number" 
                                                                    min="0"
                                                                    className={`w-full p-2 pr-8 rounded-lg border outline-none font-bold text-center text-sm transition-colors ${isOverfilled ? 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 dark:bg-red-500/10' : 'text-slate-800 dark:text-white border-slate-200 dark:border-white/[0.1] dark:bg-white/[0.04] focus:border-blue-500 dark:focus:border-blue-500/50'}`}
                                                                    value={dist.quantity || ''}
                                                                    placeholder="الكمية"
                                                                    onChange={(e) => handleDistributionChange(dist.id, e.target.value)}
                                                                />
                                                                <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold">L</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    );
                                })()}

                                {/* ═══ Step 3: Success Animation ═══ */}
                                {step === 'success' && (() => {
                                    const sc = getFuelColor(selectedShipment);
                                    return (
                                    <div className="flex-1 flex items-center justify-center p-6">
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center w-full max-w-lg"
                                        >
                                            {/* ═══ Polished Animated Scene ═══ */}
                                            <div className="relative w-full mx-auto mb-8" style={{ height: '280px' }}>
                                                
                                                {/* Sky / Background gradient */}
                                                <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700">
                                                    {/* Clouds */}
                                                    <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                                        className="absolute top-4 left-8 w-16 h-5 bg-white/60 dark:bg-white/10 rounded-full" />
                                                    <motion.div animate={{ x: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                                        className="absolute top-8 right-12 w-20 h-4 bg-white/40 dark:bg-white/5 rounded-full" />
                                                </div>

                                                {/* Main SVG Scene */}
                                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    
                                                    {/* ── Road surface ── */}
                                                    <rect x="0" y="155" width="480" height="20" className="fill-slate-500 dark:fill-slate-600"/>
                                                    <line x1="0" y1="165" x2="480" y2="165" strokeDasharray="20 15" className="stroke-amber-300 dark:stroke-amber-500" strokeWidth="2" opacity="0.6"/>
                                                    {/* Curb */}
                                                    <rect x="0" y="172" width="480" height="4" className="fill-slate-400 dark:fill-slate-500"/>
                                                    
                                                    {/* ── Ground cross-section ── */}
                                                    <rect x="0" y="176" width="480" height="8" className="fill-green-600 dark:fill-green-800" opacity="0.5"/>
                                                    <rect x="0" y="184" width="480" height="96" className="fill-amber-800 dark:fill-amber-900" opacity="0.25"/>
                                                    {/* Earth texture dots */}
                                                    {[40, 100, 170, 250, 320, 400, 140, 280, 360, 60, 200, 440].map((cx, i) => (
                                                        <circle key={`d${i}`} cx={cx} cy={195 + (i % 3) * 25} r={1.5 + (i % 2)} className="fill-amber-700 dark:fill-amber-800" opacity="0.2"/>
                                                    ))}

                                                    {/* ── Underground Tank ── */}
                                                    <motion.g initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                                                        {/* Tank shadow */}
                                                        <ellipse cx="240" cy="258" rx="72" ry="8" className="fill-black" opacity="0.08"/>
                                                        {/* Tank outer body */}
                                                        <rect x="168" y="210" width="144" height="46" rx="23" className="fill-slate-300 dark:fill-slate-600" />
                                                        <rect x="168" y="210" width="144" height="46" rx="23" fill="none" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2.5"/>
                                                        {/* Tank inner - fuel filling */}
                                                        <clipPath id="tankClip">
                                                            <rect x="172" y="213" width="136" height="40" rx="20"/>
                                                        </clipPath>
                                                        <motion.rect 
                                                            x="172" y="253" width="136" height="40"
                                                            initial={{ y: 253 }}
                                                            animate={{ y: 213 }}
                                                            transition={{ delay: 1.2, duration: 2, ease: 'easeInOut' }}
                                                            clipPath="url(#tankClip)"
                                                            rx="20"
                                                            style={{ fill: sc }}
                                                            opacity="0.7"
                                                        />
                                                        {/* Tank highlight */}
                                                        <rect x="185" y="216" width="90" height="6" rx="3" className="fill-white" opacity="0.15"/>
                                                        {/* Tank label */}
                                                        <text x="240" y="238" textAnchor="middle" className="fill-slate-500 dark:fill-slate-400" fontSize="10" fontWeight="bold" fontFamily="monospace" opacity="0.6">TANK</text>
                                                        {/* Pipe from ground into tank */}
                                                        <rect x="236" y="184" width="8" height="28" rx="2" className="fill-slate-400 dark:fill-slate-500"/>
                                                        <rect x="234" y="182" width="12" height="5" rx="2" className="fill-slate-500 dark:fill-slate-400"/>
                                                    </motion.g>

                                                    {/* ── Tanker Truck ── */}
                                                    <motion.g
                                                        initial={{ x: 200, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.1, duration: 1.2, type: 'spring', stiffness: 40, damping: 12 }}
                                                    >
                                                        {/* Truck shadow */}
                                                        <ellipse cx="250" cy="170" rx="95" ry="5" className="fill-black" opacity="0.1"/>

                                                        {/* ── Tanker barrel ── */}
                                                        <rect x="145" y="108" width="150" height="52" rx="26" style={{ fill: sc + '30' }} className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="2"/>
                                                        {/* Barrel highlight */}
                                                        <rect x="160" y="114" width="110" height="8" rx="4" className="fill-white" opacity="0.2"/>
                                                        {/* Barrel bands */}
                                                        <line x1="195" y1="108" x2="195" y2="160" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" opacity="0.4"/>
                                                        <line x1="245" y1="108" x2="245" y2="160" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" opacity="0.4"/>
                                                        {/* Hazmat diamond */}
                                                        <g transform="translate(210, 124)">
                                                            <rect width="20" height="20" rx="2" transform="rotate(45 10 10)" style={{ fill: sc + '40' }} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1"/>
                                                        </g>
                                                        {/* Barrel end caps */}
                                                        <ellipse cx="145" cy="134" rx="4" ry="26" className="fill-slate-400 dark:fill-slate-500" opacity="0.3"/>
                                                        <ellipse cx="295" cy="134" rx="4" ry="26" className="fill-slate-400 dark:fill-slate-500" opacity="0.3"/>

                                                        {/* ── Cab ── */}
                                                        <rect x="295" y="112" width="48" height="48" rx="6" className="fill-slate-600 dark:fill-slate-500"/>
                                                        <rect x="295" y="112" width="48" height="48" rx="6" fill="none" className="stroke-slate-700 dark:stroke-slate-400" strokeWidth="1.5"/>
                                                        {/* Windshield */}
                                                        <rect x="303" y="118" width="28" height="18" rx="3" className="fill-sky-300 dark:fill-sky-500" opacity="0.7"/>
                                                        <rect x="305" y="120" width="10" height="14" rx="2" className="fill-sky-200 dark:fill-sky-400" opacity="0.4"/>
                                                        {/* Door line */}
                                                        <line x1="318" y1="138" x2="318" y2="156" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1"/>
                                                        {/* Mirror */}
                                                        <rect x="292" y="122" width="5" height="8" rx="1.5" className="fill-slate-500 dark:fill-slate-400"/>
                                                        {/* Bumper */}
                                                        <rect x="340" y="148" width="8" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400"/>
                                                        {/* Headlight */}
                                                        <circle cx="344" cy="140" r="3" className="fill-amber-300 dark:fill-amber-400" opacity="0.8"/>

                                                        {/* ── Chassis ── */}
                                                        <rect x="150" y="157" width="195" height="5" rx="2" className="fill-slate-700 dark:fill-slate-500"/>

                                                        {/* ── Wheels ── */}
                                                        {/* Rear axle (dual) */}
                                                        <circle cx="185" cy="167" r="11" className="fill-slate-800 dark:fill-slate-300"/>
                                                        <circle cx="185" cy="167" r="6" className="fill-slate-500 dark:fill-slate-600"/>
                                                        <circle cx="185" cy="167" r="2" className="fill-slate-400 dark:fill-slate-500"/>
                                                        <circle cx="210" cy="167" r="11" className="fill-slate-800 dark:fill-slate-300"/>
                                                        <circle cx="210" cy="167" r="6" className="fill-slate-500 dark:fill-slate-600"/>
                                                        <circle cx="210" cy="167" r="2" className="fill-slate-400 dark:fill-slate-500"/>
                                                        {/* Front axle */}
                                                        <circle cx="325" cy="167" r="11" className="fill-slate-800 dark:fill-slate-300"/>
                                                        <circle cx="325" cy="167" r="6" className="fill-slate-500 dark:fill-slate-600"/>
                                                        <circle cx="325" cy="167" r="2" className="fill-slate-400 dark:fill-slate-500"/>

                                                        {/* ── Hose from truck to ground ── */}
                                                        <motion.path
                                                            d="M 220 158 Q 225 170 230 176 Q 235 180 240 184"
                                                            fill="none"
                                                            className="stroke-slate-600 dark:stroke-slate-400"
                                                            strokeWidth="5"
                                                            strokeLinecap="round"
                                                            initial={{ pathLength: 0 }}
                                                            animate={{ pathLength: 1 }}
                                                            transition={{ delay: 0.8, duration: 0.5 }}
                                                        />
                                                        {/* Hose connector at truck */}
                                                        <circle cx="220" cy="158" r="4" className="fill-slate-500 dark:fill-slate-400"/>
                                                    </motion.g>

                                                    {/* ── Fuel flow through hose ── */}
                                                    {[...Array(6)].map((_, i) => (
                                                        <motion.circle
                                                            key={`flow${i}`}
                                                            r="3"
                                                            style={{ fill: sc }}
                                                            initial={{ offsetDistance: '0%', opacity: 0 }}
                                                            animate={{ opacity: [0, 1, 1, 0] }}
                                                            transition={{ delay: 1.2 + i * 0.35, duration: 0.7, repeat: 4, ease: 'linear' }}
                                                        >
                                                            <motion.animate
                                                                attributeName="cx"
                                                                values="220;230;240"
                                                                dur="0.7s"
                                                                begin={`${1.2 + i * 0.35}s`}
                                                                repeatCount="4"
                                                            />
                                                            <motion.animate
                                                                attributeName="cy"
                                                                values="158;170;184"
                                                                dur="0.7s"
                                                                begin={`${1.2 + i * 0.35}s`}
                                                                repeatCount="4"
                                                            />
                                                        </motion.circle>
                                                    ))}

                                                    {/* ── Sparkles on completion ── */}
                                                    {[
                                                        { cx: 200, cy: 195, d: 2.2 }, { cx: 280, cy: 200, d: 2.5 },
                                                        { cx: 220, cy: 250, d: 2.8 }, { cx: 260, cy: 240, d: 3.0 },
                                                        { cx: 190, cy: 230, d: 2.6 }, { cx: 290, cy: 225, d: 3.2 },
                                                    ].map((sp, i) => (
                                                        <motion.circle
                                                            key={`sp${i}`}
                                                            cx={sp.cx} cy={sp.cy} r="2"
                                                            className="fill-amber-400"
                                                            initial={{ opacity: 0, scale: 0 }}
                                                            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                                                            transition={{ delay: sp.d, duration: 0.6 }}
                                                        />
                                                    ))}
                                                </svg>
                                            </div>

                                            {/* ═══ Success message ═══ */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 25 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6, type: 'spring', stiffness: 80 }}
                                            >
                                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3" style={{ backgroundColor: sc + '18' }}>
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                                                    >
                                                        <Check className="w-7 h-7" style={{ color: sc }} />
                                                    </motion.div>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1.5">تم التفريغ بنجاح!</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                                    تم تفريغ <span className="font-bold text-slate-700 dark:text-slate-200">{Number(selectedShipment?.volume_ordered).toLocaleString()} لتر</span> من <span className="font-bold" style={{ color: sc }}>{selectedShipment?.fuel_type}</span>
                                                </p>
                                                <motion.div
                                                    initial={{ width: '100%' }}
                                                    animate={{ width: '0%' }}
                                                    transition={{ duration: 4, ease: 'linear' }}
                                                    className="h-1 rounded-full mt-4 mx-auto"
                                                    style={{ maxWidth: '180px', backgroundColor: sc }}
                                                />
                                            </motion.div>
                                        </motion.div>
                                    </div>
                                    );
                                })()}
                            </div>

                            {/* Footer */}
                            {step !== 'success' && (
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-200 dark:border-white/[0.08] flex items-center gap-3 shrink-0 backdrop-blur-sm">
                                {step === 'distribute' && (
                                    <button 
                                        onClick={() => setStep('select')}
                                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/[0.1] transition-all"
                                    >
                                        رجوع
                                    </button>
                                )}
                                
                                {/* Optional Supplier Invoice Number */}
                                {step === 'distribute' && (
                                    <div className="relative flex-1 max-w-[220px]">
                                        <FileText className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                        <input
                                            type="text"
                                            placeholder="رقم فاتورة المورد (اختياري)"
                                            value={supplierInvoiceNo}
                                            onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                                            className="w-full h-10 pr-9 pl-3 text-sm rounded-xl border border-slate-200/80 bg-white text-slate-700 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:bg-white/[0.04] dark:border-white/[0.1] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-blue-400/20 dark:focus:border-blue-500/50"
                                        />
                                    </div>
                                )}
                                
                                {/* Spacer to push buttons to the left */}
                                <div className="flex-1"></div>
                                <button onClick={onClose} className={`px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/[0.1] transition-all ${step === 'distribute' ? 'hidden' : ''}`}>
                                    إلغاء
                                </button>
                                
                                {step === 'distribute' && (
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={loading}
                                        className="px-8 py-2.5 rounded-xl font-bold bg-blue-600 dark:bg-blue-600/90 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent dark:border-blue-500/30"
                                    >
                                        {loading ? 'جاري الحفظ...' : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                تأكيد التفريغ
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
