import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Save, Building2, Truck, Droplet, Fuel, Calculator, User, Plus, CheckCircle, Hash, X, Calendar, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import AddSupplierModal from './AddSupplierModal';
import { useTheme } from './components/ThemeProvider';

export default function CreatePurchase({ suppliers = [], tanks = [], drivers = [], fuelTypes = [], invoiceNumber, canAddSupplier = false, canAddDriver = false }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // State
    const [purchaseDate, setPurchaseDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [volume, setVolume] = useState('');
    const [price, setPrice] = useState('');
    const [total, setTotal] = useState(0);
    const [driverName, setDriverName] = useState('');
    const [truckNumber, setTruckNumber] = useState('');
    const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

    useEffect(() => {
        import('./utils/serverTime').then(({ getServerDate }) => {
            getServerDate().then(date => setPurchaseDate(date));
        });
    }, []);

    useEffect(() => {
        const v = parseFloat(volume) || 0;
        const p = parseFloat(price) || 0;
        setTotal(v * p);
    }, [volume, price]);

    const handleDriverSelect = (e) => {
        const val = e.target.value;
        setDriverName(val);
        const match = drivers.find(d => d.id == val);
        if (match) setTruckNumber(match.truck_number || '');
        else setTruckNumber('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!driverName) { toast.error('يجب تحديد السائق'); return; }
        if (!truckNumber) { toast.error('يجب إدخال رقم الشاحنة'); return; }
        if (!e.target.checkValidity()) { e.target.reportValidity(); return; }

        setLoading(true);
        try {
            const formData = new FormData(e.target);
            formData.set('total_cost', total);
            const response = await fetch(`${window.BASE_URL}/purchases/store`, {
                method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
            });
            let result;
            try { result = await response.json(); } catch { throw new Error("Invalid Server Response"); }
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => { window.location.href = `${window.BASE_URL}/purchases`; }, 2500);
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

    // Animation variants
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 300 } } };

    // Shared classes
    const selectClasses = `w-full bg-transparent dark:bg-slate-800/50 border-b-2 border-slate-300/50 dark:border-slate-600/30 py-2.5 text-slate-700 dark:text-slate-200 font-bold outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-all cursor-pointer hover:border-slate-400 dark:hover:border-white/30`;
    const labelClasses = `flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3`;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 relative"
        >
            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.5 }}
                            className="bg-white dark:bg-slate-800 rounded-full p-8 shadow-2xl shadow-emerald-500/50 mb-8"
                        >
                            <CheckCircle className="w-24 h-24 text-emerald-500" />
                        </motion.div>
                        <motion.h2 
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                            className="text-4xl font-black text-white font-cairo text-center"
                        >تم حفظ الفاتورة بنجاح</motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                            className="text-emerald-300 mt-4 text-xl font-bold"
                        >جاري التوجيه إلى القائمة...</motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div 
                variants={item} initial="hidden" animate="show"
                className="relative overflow-hidden rounded-2xl p-5 md:p-6"
            >
                {/* Header Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-800/90 dark:via-slate-800/80 dark:to-slate-900/90"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
                <div className="absolute inset-0 backdrop-blur-xl dark:backdrop-blur-2xl"></div>
                <div className="absolute inset-0 ring-1 ring-white/10 dark:ring-white/[0.06] rounded-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <a 
                            href={`${window.BASE_URL}/purchases`}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                        <div className="p-3 bg-white/15 rounded-2xl shadow-lg backdrop-blur-sm">
                            <Fuel className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">فاتورة مشتريات جديدة</h1>
                            <p className="text-blue-100 dark:text-slate-400 text-sm font-medium">تسجيل شحنة وقود واردة جديدة</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-white/10 dark:bg-amber-500/10 backdrop-blur-sm px-4 py-2.5 rounded-xl ring-1 ring-white/20 dark:ring-amber-500/20">
                            <Hash className="w-5 h-5 text-amber-300 dark:text-amber-400" />
                            <span className="text-lg font-mono font-black text-white dark:text-amber-300">{invoiceNumber}</span>
                        </div>
                        <motion.button 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            type="submit" form="createForm" disabled={loading}
                            className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-white font-black shadow-lg backdrop-blur-sm transition-all ring-1 ring-white/20 dark:ring-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            حفظ الفاتورة
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <form id="createForm" onSubmit={handleSubmit}>
                <input type="hidden" name="invoice_number" value={invoiceNumber} />
                <input type="hidden" name="status" value="in_transit" />
                <input type="hidden" name="total_cost" value={total} />
                <input type="hidden" name="driver_name" value={drivers.find(d => d.id == driverName)?.name || ''} />

                {/* Main 3-Column Layout */}
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* Column 1: Supplier & Fuel */}
                    <motion.div variants={item} className="space-y-5">
                        {/* Supplier Card */}
                        <div className="glass-border-amber p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <label className={`${labelClasses} text-amber-600 dark:text-amber-400`}>
                                    <Building2 className="w-4 h-4" /> المورد <span className="text-red-500">*</span>
                                </label>
                                {canAddSupplier && (
                                    <button type="button" onClick={() => setIsAddSupplierOpen(true)} 
                                        className="text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors ring-1 ring-amber-200/50 dark:ring-amber-500/20 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> جديد
                                    </button>
                                )}
                            </div>
                            <select name="supplier_id" className={selectClasses} required>
                                <option value="" className="dark:bg-slate-900 dark:text-slate-300">اختر المورد...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id} className="dark:bg-slate-900 dark:text-white">{s.name}</option>)}
                            </select>

                            {/* Date */}
                            <div className="mt-5 pt-4 border-t border-slate-200/30 dark:border-white/[0.06]">
                                <label className={`${labelClasses} text-amber-600 dark:text-amber-400`}>
                                    <Calendar className="w-4 h-4" /> تاريخ الفاتورة
                                </label>
                                <input 
                                    type="date" name="purchase_date"
                                    value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                                    className="w-full bg-transparent dark:bg-slate-800/50 border-b-2 border-slate-300/50 dark:border-slate-600/30 py-2.5 text-slate-700 dark:text-slate-200 font-bold outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Fuel Type Card */}
                        <div className="glass-border-blue p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:shadow-lg">
                            <label className={`${labelClasses} text-blue-600 dark:text-blue-400`}>
                                <Fuel className="w-4 h-4" /> نوع الوقود <span className="text-red-500">*</span>
                            </label>
                            <select name="fuel_type_id" className={`${selectClasses} focus:border-blue-500 dark:focus:border-blue-400`} required>
                                <option value="" className="dark:bg-slate-900 dark:text-slate-300">اختر نوع الوقود...</option>
                                {fuelTypes.map(ft => <option key={ft.id} value={ft.id} className="dark:bg-slate-900 dark:text-white">{ft.name}</option>)}
                            </select>
                        </div>
                    </motion.div>

                    {/* Column 2: Cost Calculator */}
                    <motion.div variants={item} className="space-y-5">
                        {/* Quantity */}
                        <div className="glass-input relative p-4 rounded-2xl group transition-all flex flex-col items-center justify-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 shadow-inner hover:shadow-lg">
                            <label className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">الكمية (لتر)</label>
                            <input 
                                type="number" step="0.01" name="volume_ordered"
                                value={volume} onChange={e => setVolume(e.target.value)}
                                className="w-full bg-transparent text-2xl font-mono font-black text-center outline-none text-blue-600 dark:text-blue-300 placeholder:text-blue-600/20 dark:placeholder:text-blue-400/20 drop-shadow-[0_0_2px_rgba(37,99,235,0.3)]"
                                placeholder="0.00" required
                            />
                            <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity"><Droplet className="w-5 h-5 text-blue-500" /></div>
                        </div>

                        {/* Price */}
                        <div className="glass-input relative p-4 rounded-2xl group transition-all flex flex-col items-center justify-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-inner hover:shadow-lg">
                            <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">السعر / لتر</label>
                            <input 
                                type="number" step="0.01" name="price_per_liter"
                                value={price} onChange={e => setPrice(e.target.value)}
                                className="w-full bg-transparent text-2xl font-mono font-black text-center outline-none text-emerald-600 dark:text-emerald-400 placeholder:text-emerald-600/20 dark:placeholder:text-emerald-400/20 drop-shadow-[0_0_2px_rgba(16,185,129,0.3)]"
                                placeholder="0.00" required
                            />
                            <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity"><Calculator className="w-5 h-5 text-emerald-500" /></div>
                        </div>

                        {/* Total */}
                        <motion.div 
                            animate={{ scale: total > 0 ? [1, 1.01, 1] : 1 }}
                            transition={{ duration: 0.3 }}
                            className="relative p-5 rounded-2xl overflow-hidden shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-100 dark:opacity-0 transition-opacity duration-300"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-green-600/20 opacity-0 dark:opacity-100 transition-opacity duration-300 ring-1 ring-emerald-500/30 rounded-2xl"></div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 dark:bg-emerald-500/20 rounded-xl backdrop-blur-sm">
                                        <Calculator className="w-6 h-6 text-white dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/80 dark:text-emerald-300 uppercase tracking-widest font-bold">الإجمالي النهائي</div>
                                        <div className="text-sm font-bold text-white/60 dark:text-slate-400">Total Cost</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-black font-mono tracking-tighter text-white dark:text-emerald-300 drop-shadow-md">
                                    {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
                                    <span className="text-base font-normal text-white/60 dark:text-slate-500 mr-1">IQD</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Column 3: Transport */}
                    <motion.div variants={item}>
                        <div className="glass-border-purple p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                            
                            {/* Driver */}
                            <div className="flex-1 pb-5 border-b border-slate-200/30 dark:border-white/[0.06]">
                                <div className="flex justify-between items-center mb-3">
                                    <label className={`${labelClasses} text-indigo-600 dark:text-indigo-400 mb-0`}>
                                        <User className="w-4 h-4" /> السائق <span className="text-red-500">*</span>
                                    </label>
                                    {canAddDriver && (
                                        <button type="button" onClick={() => setIsAddDriverOpen(true)}
                                            className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors ring-1 ring-indigo-200/50 dark:ring-indigo-500/20 flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> جديد
                                        </button>
                                    )}
                                </div>
                                <select
                                    name="driver_id" value={driverName} onChange={handleDriverSelect}
                                    className={`${selectClasses} focus:border-indigo-500 dark:focus:border-indigo-400`}
                                    required
                                >
                                    <option value="" className="dark:bg-slate-900 dark:text-slate-300">اختر السائق...</option>
                                    {drivers.map(d => <option key={d.id} value={d.id} className="dark:bg-slate-900 dark:text-white">{d.name}</option>)}
                                </select>
                            </div>

                            {/* Truck */}
                            <div className="flex-1 pt-5">
                                <label className={`${labelClasses} text-indigo-600 dark:text-indigo-400`}>
                                    <Truck className="w-4 h-4" /> الشاحنة <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" name="truck_number"
                                    value={truckNumber} onChange={(e) => setTruckNumber(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-slate-300/50 dark:border-slate-600/30 py-2.5 text-slate-700 dark:text-slate-200 font-bold outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all placeholder:text-slate-400/50 dark:placeholder:text-slate-500/50"
                                    placeholder="رقم الشاحنة" required
                                />
                            </div>

                            {/* Visual divider with truck icon */}
                            <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-white/[0.06] flex items-center justify-center gap-3 text-slate-400 dark:text-slate-600">
                                <div className="h-px flex-1 bg-gradient-to-l from-slate-200 dark:from-slate-700 to-transparent"></div>
                                <Truck className="w-5 h-5" />
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent"></div>
                            </div>

                            {/* Status indicator */}
                            <div className="mt-3 text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100/80 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-1 ring-orange-200/50 dark:ring-orange-500/20">
                                    <Truck className="w-3.5 h-3.5" /> شاحن - في الطريق
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </form>

            <AddSupplierModal 
                isOpen={isAddSupplierOpen} 
                onClose={() => setIsAddSupplierOpen(false)}
                onSuccess={() => window.location.reload()}
            />

            {/* Add Driver Modal - Glassmorphism */}
            <AnimatePresence>
                {isAddDriverOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAddDriverOpen(false)}
                            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-white/95 dark:bg-[#1e293b]/90 dark:backdrop-blur-2xl pointer-events-auto rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-md overflow-hidden ring-1 ring-black/[0.05] dark:ring-white/[0.06]">
                                {/* Modal Header */}
                                <div className="p-6 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-indigo-800 dark:text-indigo-300">إضافة سائق جديد</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">أدخل بيانات السائق</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsAddDriverOpen(false)} className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-500 dark:text-slate-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم السائق</label>
                                        <input id="newDriverName" className="w-full p-3 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all" placeholder="اسم السائق" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الشاحنة</label>
                                        <input id="newDriverTruck" className="w-full p-3 bg-white/80 dark:bg-white/5 border border-slate-200/40 dark:border-white/[0.06] rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 dark:text-white dark:placeholder-slate-500 backdrop-blur-sm transition-all" placeholder="رقم الشاحنة" />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-5 bg-slate-50/80 dark:bg-white/5 flex gap-3 backdrop-blur-sm">
                                    <button onClick={() => setIsAddDriverOpen(false)}
                                        className="flex-1 px-4 py-2.5 bg-white/80 dark:bg-white/10 ring-1 ring-black/[0.04] dark:ring-white/[0.06] text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-white/15 transition-all"
                                    >إلغاء</button>
                                    <button onClick={() => {
                                        setDriverName(document.getElementById('newDriverName').value);
                                        setTruckNumber(document.getElementById('newDriverTruck').value);
                                        setIsAddDriverOpen(false);
                                        toast.success('تم تحديد السائق (محلياً)');
                                    }}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> حفظ
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
