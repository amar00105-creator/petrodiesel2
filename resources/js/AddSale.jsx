import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, User, Droplets, CreditCard, Save, RefreshCw, 
    Wallet, Building2, AlertCircle, CheckCircle, Search, Truck, Database, AlertTriangle, X 
} from 'lucide-react';
import { Card, Title, Text, Metric } from '@tremor/react';
import { toast } from 'sonner';
import { useTheme } from './components/ThemeProvider';

export default function AddSale({ pumps = [], safes = [], banks = [], customers = [], initialSale = null }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    // DEBUG: Log theme value
    console.log('🎨 AddSale Theme:', theme, 'isDark:', isDark);
    
    // --- State ---
    const [formData, setFormData] = useState({
        sale_date: '', // Will be set from server
        pump_id: '',
        counter_id: '',
        opening_reading: '',
        closing_reading: '',
        volume_sold: 0,
        unit_price: 0,
        total_amount: 0,
        payment_method: 'cash',
        account_type: 'safe',
        account_id: '',
        customer_id: '',
        notes: ''
    });

    const [selectedCounter, setSelectedCounter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('Loading...');
    const [stockWarning, setStockWarning] = useState({ show: false, available: 0 });
    const [successModal, setSuccessModal] = useState({ show: false, invoice: '', amount: 0 });

    // --- Init ---
    useEffect(() => {
        // Set today's date from server timezone
        import('./utils/serverTime').then(({ getServerDate }) => {
            if (!initialSale) {
                getServerDate().then(date => {
                    setFormData(prev => ({ ...prev, sale_date: date }));
                });
            }
        });

        // If edit mode, use existing invoice number
        if (initialSale && initialSale.invoice_number) {
            setInvoiceNumber(initialSale.invoice_number);
        } else {
            // Fetch New Invoice Number for creation
            fetch(`${window.BASE_URL || ''}/sales/getNextInvoiceNumber`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setInvoiceNumber(data.invoice_number);
                })
                .catch(err => console.error('Failed to fetch invoice number', err));
        }

        // Default to first safe if available
        if (safes.length > 0) {
            setFormData(prev => ({ ...prev, account_id: safes[0].id }));
        }

        // If edit mode
        if (initialSale) {
            setFormData(initialSale);
            // Pre-populate selectedCounter to enable inputs
            if (initialSale.counter_id) {
                setSelectedCounter({
                    fuel_type: initialSale.fuel_type || 'Unknown',
                    worker_name: initialSale.worker_name || 'Unknown',
                    worker_id: initialSale.worker_id,
                    price: parseFloat(initialSale.unit_price || 0),
                    current_reading: parseFloat(initialSale.opening_reading || 0)
                });
            }
        }
    }, [safes, initialSale]);

    // --- Logic ---
    
    // 1. Handle Machine/Counter Selection
    const handlePumpChange = (e) => {
        const pumpId = e.target.value;
        setFormData(prev => ({ 
            ...prev, 
            pump_id: pumpId, 
            counter_id: '', 
            opening_reading: '',
            unit_price: 0 
        }));
        setSelectedCounter(null);
    };

    const handleCounterChange = async (e) => {
        const counterId = e.target.value;
        setFormData(prev => ({ ...prev, counter_id: counterId }));

        if (!counterId) return;

        setLoading(true);
        try {
            const response = await fetch(`${window.BASE_URL || ''}/sales/getCounterDetails?counter_id=${counterId}`);
            const result = await response.json();

            if (result.success) {
                setSelectedCounter({
                    fuel_type: result.product_type,
                    worker_name: result.worker_name,
                    worker_id: result.worker_id,
                    price: parseFloat(result.price),
                    current_reading: parseFloat(result.current_reading),
                    tank_name: result.tank_name,
                    tank_volume: parseFloat(result.tank_volume || 0)
                });

                setFormData(prev => ({
                    ...prev,
                    unit_price: parseFloat(result.price),
                    opening_reading: parseFloat(result.current_reading),
                    worker_id: result.worker_id
                }));
                
                toast.success('تم تحميل بيانات العداد بنجاح');
            } else {
                toast.error('فشل تحميل بيانات العداد');
            }
        } catch (error) {
            console.error('API Error:', error);
            toast.error('خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    // 2. Calculations
    const handleReadingChange = (e) => {
        const closing = parseFloat(e.target.value) || 0;
        const opening = parseFloat(formData.opening_reading) || 0;
        
        // Don't calculate if closing is less than opening (unless it's empty/0 during typing)
        let volume = 0;
        if (closing >= opening) {
            volume = closing - opening;
        }

        const total = volume * formData.unit_price;

        setFormData(prev => ({
            ...prev,
            closing_reading: e.target.value,
            volume_sold: volume,
            total_amount: total
        }));
    };

    // 3. Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.counter_id || !formData.closing_reading) {
            toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
            return;
        }

        if (parseFloat(formData.closing_reading) < parseFloat(formData.opening_reading)) {
            toast.error('خطأ: القراءة الحالية أقل من القراءة السابقة!');
            return;
        }

        // Validate against tank volume
        if (selectedCounter && formData.volume_sold > selectedCounter.tank_volume) {
            setStockWarning({ show: true, available: selectedCounter.tank_volume });
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });
            // Ensure derived values are sent correctly
            data.append('invoice_number', invoiceNumber);

            const response = await fetch(`${window.BASE_URL || ''}/sales/store`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: data
            });

            const result = await response.json();

            if (result.success) {
                setSuccessModal({ show: true, invoice: invoiceNumber, amount: formData.total_amount });
            } else {
                toast.error(result.message || 'فشل حفظ العملية');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error('حدث خطأ أثناء الحفظ');
        } finally {
            setSubmitting(false);
        }
    };

    // --- Helpers ---
    const formatCurrency = (amt) => parseFloat(amt || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '') + ' SDG';
    const formatNumber = (num) => parseFloat(num || 0).toLocaleString('en-US');

    // Fuel badge styles
    const getFuelStyle = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('diesel') || t.includes('ديزل')) return 'bg-amber-100 text-amber-700 border-amber-200';
        if (t.includes('petrol') || t.includes('بنزين')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (t.includes('gas') || t.includes('غاز')) return 'bg-purple-100 text-purple-700 border-purple-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    return (
        <div className="h-screen bg-slate-50/50 dark:bg-[#0F172A] p-2 overflow-hidden" style={{ direction: 'rtl' }}>
             <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-full">
                
                {/* Main Form Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-9"
                >
                    {/* Dark Mode: Tiered Glass - Level 2 (Glassy Container) */}
                    {/* Dark Mode: Tiered Glass - Level 2 (Glassy Container) */}
                    <div className="glass-container relative rounded-3xl overflow-hidden transition-all duration-300">
                        
                        {/* Glass Edge Glow Effects */}
                        <div className="glass-edge-top"></div>
                        <div className="glass-edge-left"></div>
                        <div className="glass-edge-right"></div>

                        <div className="p-4 relative">
                             {/* Decorative Top Light Effect - Level 3 (Ultra Transparent) */}
                             <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl hidden dark:block pointer-events-none"></div>
                             <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl hidden dark:block pointer-events-none"></div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl hidden dark:block pointer-events-none"></div>

                            {/* Header Row */}
                            <div className="flex justify-between items-center mb-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 dark:from-slate-700/50 dark:to-slate-600/50 border border-blue-500/30 dark:border-slate-500/30 flex items-center justify-center text-blue-500 dark:text-slate-300 shadow-lg shadow-blue-500/10 dark:shadow-slate-500/20">
                                        <Calculator className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-none tracking-tight">تسجيل مبيعات</h1>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="glass-input px-2 py-0.5 rounded-md text-emerald-500 text-xs font-mono font-bold">#{invoiceNumber}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        value={formData.sale_date}
                                        onChange={(e) => setFormData(prev => ({...prev, sale_date: e.target.value}))}
                                        className="glass-input w-full text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:border-blue-500/50 transition-all cursor-pointer"
                                    />

                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="space-y-4 relative z-10">
                                
                                {/* 1. Pump & Counter Section - Glassy Border */}
                                {/* 1. Pump & Counter Section - Glassy Border */}
                                <div className="glass-section grid grid-cols-1 md:grid-cols-2 gap-4 p-1 rounded-xl">
                                    {/* Pump Select */}
                                    <div className="relative group p-4">
                                        <label className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                            <Truck className="w-3 h-3" /> الماكينة
                                        </label>
                                        <select 
                                            value={formData.pump_id} 
                                            onChange={handlePumpChange}
                                            className="w-full bg-transparent dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600/30 py-2 text-slate-700 dark:text-slate-200 font-bold outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-white/30"
                                        >
                                            <option value="" className="text-slate-500 bg-white dark:bg-slate-900 dark:text-slate-300">اختر الماكينة...</option>
                                            {pumps.map(pump => (
                                                <option key={pump.id} value={pump.id} className="text-slate-800 bg-white dark:bg-slate-900 dark:text-white">{pump.name} - {pump.product_name || 'وقود'}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Counter Select */}
                                    <div className="relative group p-4 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-600/25 md:pr-6">
                                        <label className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                            <Calculator className="w-3 h-3" /> العداد
                                        </label>
                                        <select 
                                            value={formData.counter_id} 
                                            onChange={handleCounterChange}
                                            disabled={!formData.pump_id}
                                            className="w-full bg-transparent dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600/30 py-2 text-slate-700 dark:text-slate-200 font-bold outline-none focus:border-purple-500 dark:focus:border-purple-400 transition-all appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 dark:hover:border-white/30"
                                        >
                                            <option value="" className="bg-white dark:bg-slate-900 dark:text-slate-300">اختر العداد...</option>
                                            {pumps.find(p => p.id == formData.pump_id)?.counters?.map(c => (
                                                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 dark:text-white">{c.name}</option>
                                            ))}
                                        </select>
                                        {loading && <div className="absolute left-4 top-10"><RefreshCw className="w-4 h-4 animate-spin text-purple-500"/></div>}
                                    </div>
                                </div>

                                {/* Active Counter Info (Badges) */}
                                <AnimatePresence>
                                    {selectedCounter && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getFuelStyle(selectedCounter.fuel_type)}`}>
                                                    <Droplets className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold">{selectedCounter.fuel_type}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 dark:border-0">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold">{selectedCounter.worker_name}</span>
                                                </div>
                                                {selectedCounter.tank_name && (
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 dark:border-0">
                                                        <Database className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">{selectedCounter.tank_name}</span>
                                                        <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 rounded ml-1">
                                                            {parseFloat(selectedCounter.tank_volume).toLocaleString()} L
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="mr-auto flex items-center gap-2">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">سعر الوحدة:</span>
                                                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded dark:border-0">{formatCurrency(formData.unit_price)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* 2. Readings Inputs - Transparent Glass Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Opening Reading - Glassy Border */}
                                    <div className="glass-input relative p-2.5 rounded-2xl group transition-all flex items-center justify-center gap-3">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">القراءة السابقة</label>
                                        <div className="text-lg font-mono font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                                            {formatNumber(formData.opening_reading) || '---'}
                                        </div>
                                        <div className="absolute left-2.5 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <Calculator className="w-4 h-4 text-slate-400 dark:text-white" />
                                        </div>
                                    </div>

                                    {/* Closing Reading */}
                                    <div className="glass-input-active relative p-2.5 rounded-2xl group transition-all flex items-center justify-center gap-3">
                                        <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>القراءة الحالية</label>
                                        <input 
                                            type="number" 
                                            value={formData.closing_reading} 
                                            onChange={handleReadingChange}
                                            disabled={!selectedCounter}
                                            className={`w-auto bg-transparent text-xl font-mono font-black outline-none text-center min-w-[120px] ${isDark ? 'text-white placeholder:text-white/10' : 'text-slate-800 placeholder:text-slate-300'}`}
                                            placeholder="000000"
                                        />
                                        <div className="absolute left-2.5 opacity-50 group-focus-within:opacity-100 transition-opacity">
                                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-500/20' : 'text-emerald-600 bg-emerald-100'}`}>LITERS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Payment Section */}
                                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-600/25">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Method Toggle */}
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 block">طريقة الدفع</label>
                                            <div className="glass-section flex p-1 rounded-xl">
                                                <button 
                                                    onClick={() => setFormData(p => ({...p, payment_method: 'cash'}))}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.payment_method === 'cash' ? 'bg-white dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-emerald-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                                >
                                                    نقدي
                                                </button>
                                                <button 
                                                    onClick={() => setFormData(p => ({...p, payment_method: 'credit'}))}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.payment_method === 'credit' ? 'bg-white dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 shadow-sm dark:shadow-amber-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                                >
                                                    آجل
                                                </button>
                                            </div>
                                        </div>

                                        {/* Dynamic Account Select */}
                                        <div className="md:col-span-2">
                                            {formData.payment_method === 'cash' ? (
                                                <div className="flex gap-4">
                                                    <div className="w-1/3">
                                                         <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">نوع الحساب</label>
                                                         <select 
                                                            value={formData.account_type}
                                                            onChange={(e) => setFormData(p => ({...p, account_type: e.target.value, account_id: ''}))}
                                                            className="glass-input w-full rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-white/30 transition-all"
                                                        >
                                                            <option value="safe" className="bg-white dark:bg-slate-900 dark:text-white">خزنة</option>
                                                            <option value="bank" className="bg-white dark:bg-slate-900 dark:text-white">بنك</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">وجهة الايداع</label>
                                                         <select 
                                                            value={formData.account_id}
                                                            onChange={(e) => setFormData(p => ({...p, account_id: e.target.value}))}
                                                            className="glass-input w-full rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-white/30 transition-all"
                                                        >
                                                            <option value="" className="bg-white dark:bg-slate-900 dark:text-slate-300">اختر...</option>
                                                            {formData.account_type === 'safe' 
                                                                ? safes.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 dark:text-white">{s.name}</option>)
                                                                : banks.map(b => <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 dark:text-white">{b.bank_name} - {b.account_number}</option>)
                                                            }
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">العميل</label>
                                                    <select 
                                                        value={formData.customer_id}
                                                        onChange={(e) => setFormData(p => ({...p, customer_id: e.target.value}))}
                                                        className="glass-input w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 dark:focus:border-white/30 transition-all"
                                                    >
                                                        <option value="" className="bg-white dark:bg-slate-900 dark:text-slate-300">اختر العميل...</option>
                                                        {customers.map(c => (
                                                            <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 dark:text-white">{c.name} - رصيد: {formatCurrency(c.balance)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4 flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={submitting || !formData.closing_reading}
                                        className={`
                                            px-8 py-4 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all relative overflow-hidden group
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500
                                            dark:from-emerald-600/90 dark:to-green-600/90 hover:shadow-emerald-500/50
                                        `}
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        {submitting ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                                        <span className="relative z-10">حفظ عملية البيع</span>
                                    </motion.button>
                                </div>

                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Left Sidebar - Summary */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-3 lg:sticky lg:top-6"
                >
                    {/* Summary Card - Glassy Border */}
                    <div className="glass-summary rounded-3xl p-5 relative overflow-hidden flex flex-col">
                        {/* Glass Edge Glow */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
                        
                         {/* Decorative Background - Level 3 (Ultra Transparent) */}
                         <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                         <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

                         <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-indigo-200 uppercase tracking-widest mb-6 border-b border-slate-200 dark:border-slate-600/30 pb-4 flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> ملخص الفاتورة
                            </h3>
                            
                            <div className="flex-1 space-y-8">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 dark:text-indigo-300 block mb-2">الكمية المباعة</span>
                                    <div className="glass-input p-4 rounded-2xl">
                                        <div className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400 flex items-baseline gap-1">
                                            {formatNumber(formData.volume_sold)}
                                            <span className="text-sm text-indigo-400/70 font-bold">L</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">سعر الوحدة</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-white">{formatNumber(formData.unit_price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">عدد الوحدات</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-white">{formData.volume_sold}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-600/30">
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-400 block mb-2">الإجمالي النهائي</span>
                                <div className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-indigo-200 tracking-tighter">
                                    {formatNumber(formData.total_amount)}
                                </div>
                                <div className="text-xs font-bold text-slate-400 mt-2 text-right">جنيه سوداني</div>
                            </div>
                         </div>
                    </div>
                </motion.div>

            </div>

            {/* Stock Warning Modal */}
            <AnimatePresence>
                {stockWarning.show && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setStockWarning({ show: false, available: 0 })}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl p-[2px] shadow-2xl shadow-amber-500/20 pointer-events-auto max-w-md w-full">
                                <div className="bg-slate-900/90 rounded-3xl p-8 text-center relative overflow-hidden">
                                    {/* Animated Background Glow */}
                                    <motion.div 
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-gradient-radial from-amber-500/20 to-transparent pointer-events-none"
                                    />
                                    
                                    {/* Warning Icon with Animation */}
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", delay: 0.1, damping: 10 }}
                                        className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/50"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            <AlertTriangle className="w-10 h-10 text-white" />
                                        </motion.div>
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="relative z-10 text-2xl font-black text-white mb-3"
                                    >
                                        الكمية غير كافية!
                                    </motion.h2>

                                    {/* Message */}
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="relative z-10 text-slate-300 mb-6 text-lg"
                                    >
                                        المخزون المتاح في الخزان غير كافٍ لإتمام هذه العملية
                                    </motion.p>

                                    {/* Available Quantity Display */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative z-10 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 mb-6 border border-amber-500/30"
                                    >
                                        <div className="text-sm text-amber-300 mb-1">الكمية المتاحة</div>
                                        <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                            {stockWarning.available.toLocaleString()}
                                        </div>
                                        <div className="text-amber-400 text-sm font-bold mt-1">لتر فقط</div>
                                    </motion.div>

                                    {/* Close Button */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStockWarning({ show: false, available: 0 })}
                                        className="relative z-10 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                                    >
                                        حسناً، فهمت
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {successModal.show && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl rounded-3xl p-[2px] shadow-2xl shadow-emerald-500/20 pointer-events-auto max-w-md w-full">
                                <div className="bg-slate-900/90 rounded-3xl p-8 text-center relative overflow-hidden">
                                    {/* Animated Background Glow */}
                                    <motion.div 
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-gradient-radial from-emerald-500/20 to-transparent pointer-events-none"
                                    />
                                    
                                    {/* Success Icon with Animation */}
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", delay: 0.1, damping: 10 }}
                                        className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50"
                                    >
                                        <motion.div
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                        >
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </motion.div>
                                    </motion.div>

                                    {/* Title */}
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="relative z-10 text-2xl font-black text-white mb-3"
                                    >
                                        تم الحفظ بنجاح! 🎉
                                    </motion.h2>

                                    {/* Invoice Number */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="relative z-10 text-slate-400 mb-4"
                                    >
                                        رقم الفاتورة: <span className="font-mono font-bold text-white">#{successModal.invoice}</span>
                                    </motion.div>

                                    {/* Amount Display */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative z-10 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl p-4 mb-6 border border-emerald-500/30"
                                    >
                                        <div className="text-sm text-emerald-300 mb-1">إجمالي المبلغ</div>
                                        <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                                            {parseFloat(successModal.amount).toLocaleString()}
                                        </div>
                                        <div className="text-emerald-400 text-sm font-bold mt-1">SDG</div>
                                    </motion.div>

                                    {/* Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="relative z-10 flex gap-3 justify-center"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => window.location.href = `${window.BASE_URL || ''}/sales`}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                                        >
                                            قائمة المبيعات
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                                        >
                                            عملية جديدة
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
