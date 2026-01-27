import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, Button } from '@tremor/react';
import { ChevronLeft, Save, Building2, Truck, Droplet, Fuel, Calculator, User, Plus, CheckCircle, Hash, X } from 'lucide-react';
import { toast } from 'sonner';
import AddSupplierModal from './AddSupplierModal';

export default function CreatePurchase({ suppliers = [], tanks = [], drivers = [], fuelTypes = [], invoiceNumber, canAddSupplier = false, canAddDriver = false }) {
    const [loading, setLoading] = useState(false);
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Local state for calculations
    const [volume, setVolume] = useState('');
    const [price, setPrice] = useState('');
    const [total, setTotal] = useState(0);

    // Driver Lookup State
    const [driverName, setDriverName] = useState(''); // Stores the ID
    const [truckNumber, setTruckNumber] = useState('');
    
    // Driver Modal
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

    useEffect(() => {
        const v = parseFloat(volume) || 0;
        const p = parseFloat(price) || 0;
        setTotal(v * p);
    }, [volume, price]);

    const handleDriverSelect = (e) => {
         const val = e.target.value;
         setDriverName(val); // this now stores the ID
         const match = drivers.find(d => d.id == val);
         if(match) setTruckNumber(match.truck_number || '');
         else setTruckNumber('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Strict Validation
        if (!driverName) {
            toast.error('يجب تحديد السائق');
            return;
        }
        if (!truckNumber) {
            toast.error('يجب إدخال رقم الشاحنة');
            return;
        }
        
        if (!e.target.checkValidity()) {
            e.target.reportValidity();
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(e.target);
            // Append calculated fields explicitely if needed or rely on form
            formData.set('total_cost', total);

            const response = await fetch(`${window.BASE_URL}/purchases/store`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                // If JSON parse fails, it's likely a PHP Fatal Error (HTML)
                console.error("JSON Parse Error:", jsonError);
                throw new Error("Invalid Server Response (Not JSON)");
            }

            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.href = `${window.BASE_URL}/purchases`;
                }, 2500);
            } else {
                toast.error(result.message || 'حدث خطأ غير معروف');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-5xl mx-auto space-y-6 relative">
            
            {/* Success Overlay Animation */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-navy-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.5 }}
                            className="bg-white rounded-full p-8 shadow-2xl shadow-emerald-500/50 mb-8"
                        >
                            <motion.div
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <CheckCircle className="w-24 h-24 text-emerald-500" />
                            </motion.div>
                        </motion.div>
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black text-white font-cairo text-center"
                        >
                            تم حفظ الفاتورة بنجاج
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-emerald-200 mt-4 text-xl font-bold"
                        >
                            جاري التوجيه إلى القائمة...
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <Fuel className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <Title className="text-2xl font-bold text-navy-900 font-cairo">فاتورة مشتريات جديدة</Title>
                        <Text className="text-slate-500">تسجيل شحنة وقود واردة جديدة</Text>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                     <div className="hidden md:flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                        <Hash className="w-5 h-5 text-amber-600" />
                        <span className="text-lg font-mono font-bold text-navy-900">{invoiceNumber}</span>
                    </div>
                    <Button 
                        type="submit" 
                        form="createForm"
                        loading={loading}
                        className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-lg shadow-blue-900/20 border-none"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        حفظ الفاتورة
                    </Button>
                </div>
            </div>

            <form id="createForm" onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="invoice_number" value={invoiceNumber} />
                <input type="hidden" name="status" value="in_transit" />
                <input type="hidden" name="total_cost" value={total} />
                <input type="hidden" name="driver_name" value={drivers.find(d => d.id == driverName)?.name || ''} />
                
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Right Column: Key Info */}
                    <div className="space-y-6">
                         {/* Supplier */}
                         <Card className="rounded-3xl shadow-sm ring-1 ring-amber-100 bg-amber-50/30 overflow-visible relative z-20">
                            <div className="flex justify-between items-center mb-4">
                                <label className="flex items-center gap-2 font-bold text-slate-700">
                                    <Building2 className="w-5 h-5 text-amber-500"/> المورد
                                </label>
                                {canAddSupplier && (
                                    <button type="button" onClick={() => setIsAddSupplierOpen(true)} className="text-xs bg-white text-amber-600 px-3 py-1.5 rounded-lg font-bold shadow-sm hover:shadow-md transition-shadow border border-amber-100 flex items-center gap-1">
                                        <Plus className="w-3 h-3"/> جديد
                                    </button>
                                )}
                            </div>
                            <select name="supplier_id" className="w-full p-3.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold text-slate-700" required>
                                <option value="">اختر المورد...</option>
                                <option value="new_supplier_trigger" className="font-bold text-amber-600 bg-amber-50">+ إضافة مورد جديد</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                         </Card>

                         {/* Fuel Type Only - Tank Selection Removed */}
                         <Card className="rounded-3xl shadow-sm ring-1 ring-blue-100 bg-blue-50/30">
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                                        <Fuel className="w-5 h-5 text-blue-500"/> نوع الوقود <span className="text-red-500">*</span>
                                    </label>
                                    <select name="fuel_type_id" className="w-full p-3.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-slate-700" required>
                                        <option value="">اختر نوع الوقود...</option>
                                        {fuelTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                                    </select>
                                </div>
                            </div>
                         </Card>
                    </div>

                    {/* Left Column: Cost & Transport */}
                    <div className="space-y-6">
                        {/* Cost Calculator */}
                         <Card className="rounded-3xl shadow-sm ring-1 ring-emerald-100 bg-emerald-50/30">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الكمية (لتر)</label>
                                    <input 
                                        type="number" step="0.01" name="volume_ordered" 
                                        value={volume} onChange={e => setVolume(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                                        placeholder="0.00" required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">السعر / لتر</label>
                                    <input 
                                        type="number" step="0.01" name="price_per_liter" 
                                        value={price} onChange={e => setPrice(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none" 
                                        placeholder="0.00" required
                                    />
                                </div>
                            </div>
                            <div className="bg-emerald-600 p-4 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-emerald-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg"><Calculator className="w-6 h-6"/></div>
                                    <div>
                                        <div className="text-xs opacity-80">الإجمالي النهائي</div>
                                        <div className="font-bold text-lg">Total Cost</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-black font-mono tracking-tighter">
                                    {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-base font-normal opacity-70">IQD</span>
                                </div>
                            </div>
                         </Card>

                         {/* Transport */}
                         <Card className="rounded-3xl shadow-sm ring-1 ring-indigo-100 bg-indigo-50/30 relative">
                             <div className="flex justify-between items-center mb-4">
                                <label className="flex items-center gap-2 font-bold text-slate-700">
                                    <Truck className="w-5 h-5 text-indigo-500"/> السائق والشاحنة <span className="text-red-500">*</span>
                                </label>
                                {canAddDriver && (
                                    <button type="button" onClick={() => setIsAddDriverOpen(true)} className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-bold shadow-sm hover:shadow-md transition-shadow border border-indigo-100 flex items-center gap-1">
                                        <Plus className="w-3 h-3"/> جديد
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						 {/* Driver Selection */}
                                 <div>
                                     <select 
                                        name="driver_id" 
                                        value={driverName} // Actually this should be ID now
                                        onChange={handleDriverSelect}
                                        className={`w-full p-3.5 rounded-xl border ${!driverName ? 'border-red-300 ring-2 ring-red-100' : 'border-indigo-200'} focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-slate-700`}
                                        required
                                     >
                                        <option value="">اختر السائق...</option>
                                        {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                     </select>
                                 </div>
                                 <input 
                                    type="text" name="truck_number" 
                                    value={truckNumber} onChange={(e) => setTruckNumber(e.target.value)}
                                    className={`w-full p-3 rounded-xl border ${!truckNumber ? 'border-red-300 ring-2 ring-red-100' : 'border-indigo-200'} focus:ring-2 focus:ring-indigo-500 outline-none bg-white`} 
                                    placeholder="رقم الشاحنة" required
                                />
                            </div>
                         </Card>
                    </div>

                </div>
            </form>

            <AddSupplierModal 
                isOpen={isAddSupplierOpen} 
                onClose={() => setIsAddSupplierOpen(false)}
                onSuccess={() => window.location.reload()}
            />
            
             {isAddDriverOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                         <Title>إضافة سائق جديد</Title>
                         <div className="space-y-4 mt-4">
                             <input id="newDriverName" className="w-full p-3 border rounded-xl" placeholder="اسم السائق" />
                             <input id="newDriverTruck" className="w-full p-3 border rounded-xl" placeholder="رقم الشاحنة" />
                             <Button onClick={() => {
                                 // Quick simulation or ajax
                                 // Ideally call backend API.
                                 // For now just close and fill
                                 setDriverName(document.getElementById('newDriverName').value);
                                 setTruckNumber(document.getElementById('newDriverTruck').value);
                                 setIsAddDriverOpen(false);
                                 toast.success('تم تحديد السائق (محلياً)');
                             }} className="w-full mt-2">حفظ</Button>
                             <Button variant="secondary" onClick={() => setIsAddDriverOpen(false)} className="w-full">إلغاء</Button>
                         </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
