import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, FileText, User, Hash, Droplet, ArrowRight, Save, Search, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function DischargeModal({ isOpen, onClose, tanks = [] }) {
    const [step, setStep] = useState('select'); // 'select' | 'distribute'
    const [loading, setLoading] = useState(false);
    const [pendingShipments, setPendingShipments] = useState([]);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [distributions, setDistributions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch pending shipments when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPendingShipments();
            setStep('select');
            setSelectedShipment(null);
            setDistributions([]);
        }
    }, [isOpen]);

    const fetchPendingShipments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/PETRODIESEL2/public/purchases/getPending');
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
            const response = await fetch('/PETRODIESEL2/public/purchases/processDischarge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    purchase_id: selectedShipment.id,
                    tanks: distributions.map(d => ({ id: d.id, quantity: d.quantity }))
                })
            });
            const result = await response.json();

            if (result.success) {
                toast.success('تم تفريغ الشحنة بنجاح');
                onClose();
                window.location.reload(); 
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
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white pointer-events-auto rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">تفريغ شحنة وقود</h2>
                                        <p className="text-blue-100 text-sm">
                                            {step === 'select' ? 'اختر الشحنة المراد تفريغها' : `توزيع شحنة #${selectedShipment?.invoice_number}`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
                                
                                {/* Step 1: Select Shipment */}
                                {step === 'select' && (
                                    <div className="flex flex-col h-full">
                                        <div className="p-4 bg-white border-b border-slate-200">
                                            <div className="relative">
                                                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    placeholder="بحث برقم الفاتورة أو اسم المورد..." 
                                                    className="w-full pl-4 pr-10 p-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                            {loading && <div className="text-center py-10 text-slate-500">جاري التحميل...</div>}
                                            
                                            {!loading && filteredShipments.length === 0 && (
                                                <div className="text-center py-12 flex flex-col items-center text-slate-400">
                                                    <div className="bg-slate-100 p-4 rounded-full mb-3"><FileText className="w-8 h-8"/></div>
                                                    <p>لا توجد شحنات معلقة.</p>
                                                    <button onClick={onClose} className="mt-4 text-blue-600 font-bold hover:underline">إلغاء</button>
                                                </div>
                                            )}

                                            {filteredShipments.map(shipment => (
                                                <div 
                                                    key={shipment.id}
                                                    onClick={() => handleSelectShipment(shipment)}
                                                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                                            shipment.fuel_type?.includes('Diesel') ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                                        }`}>
                                                            {shipment.fuel_type ? shipment.fuel_type.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                                {shipment.supplier_name}
                                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{shipment.invoice_number}</span>
                                                            </div>
                                                            <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-3">
                                                                <span className="flex items-center gap-1"><Droplet className="w-3 h-3"/> {Number(shipment.volume_ordered).toLocaleString()} L</span>
                                                                <span className="flex items-center gap-1"><User className="w-3 h-3"/> {shipment.driver_name || '---'}</span>
                                                                <span className="flex items-center gap-1"><Truck className="w-3 h-3"/> {shipment.truck_number || '---'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Distribute */}
                                {step === 'distribute' && selectedShipment && (
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm mb-6">
                                            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
                                                
                                                {/* Shipment Details Row */}
                                                <div className="flex flex-wrap items-center gap-6 flex-1">
                                                    
                                                    {/* Supplier */}
                                                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                                                            <Truck className="w-4 h-4"/>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase">المورد</div>
                                                            <div className="font-bold text-slate-700 text-sm">{selectedShipment.supplier_name}</div>
                                                        </div>
                                                    </div>

                                                    {/* Driver */}
                                                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                                            <User className="w-4 h-4"/>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase">السائق</div>
                                                            <div className="font-bold text-slate-700 text-sm">{selectedShipment.driver_name || '---'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Truck */}
                                                    <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                                            <Truck className="w-4 h-4"/>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase">المركبة</div>
                                                            <div className="font-bold text-slate-700 text-sm font-mono">{selectedShipment.truck_number || '---'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="flex items-center gap-3 bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-100">
                                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                            <Droplet className="w-4 h-4"/>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-blue-400 font-bold uppercase">الكمية</div>
                                                            <div className="font-black text-blue-700 text-lg font-mono leading-none">
                                                                {Number(selectedShipment.volume_ordered).toLocaleString()} <span className="text-xs font-bold text-blue-400">L</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Fuel Type */}
                                                    <div className="flex items-center gap-2">
                                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${selectedShipment.fuel_type?.toLowerCase().includes('diesel') ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                                            {selectedShipment.fuel_type || 'غير محدد'}
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* Remaining Status */}
                                                <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                                                    <div className="text-right">
                                                         <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">المتبقي للتوزيع</div>
                                                         <div className={`text-2xl font-black font-mono leading-none ${(Number(selectedShipment.volume_ordered) - distributions.reduce((a,b)=>a+b.quantity,0)) === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {(Number(selectedShipment.volume_ordered) - distributions.reduce((a,b)=>a+b.quantity,0)).toLocaleString()} <span className="text-xs text-slate-300">L</span>
                                                         </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                            <Droplet className="w-5 h-5 text-blue-500"/>
                                            توزيع الوقود على الخزانات المتاحة
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            {distributions.map(dist => {
                                                const availableSpace = dist.capacity - dist.current;
                                                const fillPercentage = Math.min(100, ((dist.current + dist.quantity) / dist.capacity) * 100);
                                                const isOverfilled = (dist.current + dist.quantity) > dist.capacity;

                                                return (
                                                    <div key={dist.id} className={`bg-white p-4 rounded-xl border transition-all ${isOverfilled ? 'border-red-300 bg-red-50' : (dist.quantity > 0 ? 'border-blue-400 shadow-sm' : 'border-slate-200')}`}>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div>
                                                                <div className="font-bold text-slate-800">{dist.name}</div>
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    السعة: {dist.capacity.toLocaleString()} | الحالي: {dist.current.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-slate-400">مساحة فارغة</div>
                                                                <div className="font-mono font-bold text-slate-600">{availableSpace.toLocaleString()} L</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                                                    <div className="absolute top-0 left-0 h-full bg-slate-300 w-full opacity-20"></div>
                                                                    <motion.div 
                                                                        initial={{ width: `${(dist.current/dist.capacity)*100}%` }}
                                                                        animate={{ width: `${fillPercentage}%` }}
                                                                        className={`h-full ${isOverfilled ? 'bg-red-500' : 'bg-blue-500'} transition-all`}
                                                                    />
                                                                    {/* Original Level Marker */}
                                                                    <div className="absolute top-0 h-full w-0.5 bg-slate-800 z-10" style={{ left: `${(dist.current/dist.capacity)*100}%` }} />
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                                                                    <span>0%</span>
                                                                    <span>{fillPercentage.toFixed(1)}%</span>
                                                                    <span>100%</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-40 relative">
                                                                <input 
                                                                    type="number" 
                                                                    min="0"
                                                                    className={`w-full p-2 pr-8 rounded-lg border outline-none font-bold text-center ${isOverfilled ? 'text-red-600 border-red-300' : 'text-slate-800 border-slate-200 focus:border-blue-500'}`}
                                                                    value={dist.quantity || ''}
                                                                    placeholder="الكمية"
                                                                    onChange={(e) => handleDistributionChange(dist.id, e.target.value)}
                                                                />
                                                                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">L</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
                                {step === 'distribute' && (
                                    <button 
                                        onClick={() => setStep('select')}
                                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                                    >
                                        رجوع
                                    </button>
                                )}
                                <button onClick={onClose} className={`px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all ${step === 'distribute' ? 'hidden' : ''}`}>
                                    إلغاء
                                </button>
                                
                                {step === 'distribute' && (
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={loading}
                                        className="px-8 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
