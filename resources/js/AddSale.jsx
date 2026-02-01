import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, User, Droplets, CreditCard, Save, RefreshCw, 
    Wallet, Building2, AlertCircle, CheckCircle, Search, Truck, Database 
} from 'lucide-react';
import { Card, Title, Text, Metric } from '@tremor/react';
import { toast } from 'sonner';

export default function AddSale({ pumps = [], safes = [], banks = [], customers = [], initialSale = null }) {
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

    // --- Init ---
    useEffect(() => {
        // Set today's date from server timezone
        const today = new Date();
        const serverDate = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        if (!initialSale) {
            setFormData(prev => ({ ...prev, sale_date: serverDate }));
        }

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
                    tank_name: result.tank_name
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
                toast.success('تم حفظ عملية البيع بنجاح! 🎉');
                // Optional: Redirect or Reset
                setTimeout(() => window.location.href = `${window.BASE_URL || ''}/sales`, 1000);
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
        <div className="min-h-screen bg-slate-50/50 p-4" style={{ direction: 'rtl' }}>
             <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Main Form Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-9"
                >
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Header - Clean & Light */}
                        <div className="px-6 pt-6 pb-2 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">رقم الفاتورة:</span>
                                <span className="text-lg font-black text-slate-700 tracking-tight font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 dashed">
                                    {invoiceNumber}
                                </span>
                            </div>
                            
                            <input 
                                type="date" 
                                value={formData.sale_date}
                                onChange={(e) => setFormData(prev => ({...prev, sale_date: e.target.value}))}
                                className="bg-transparent border border-slate-200 text-slate-500 text-xs font-bold rounded-lg focus:ring-0 focus:border-blue-400 p-2 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            />
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-6">
                            
                            {/* 1. Selection Row (Compact) */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">الماكينة (Pump)</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.pump_id} 
                                                onChange={handlePumpChange}
                                                className="w-full text-sm font-bold text-black bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            >
                                                <option value="">اختر الماكينة...</option>
                                                {pumps.map(pump => (
                                                    <option key={pump.id} value={pump.id}>{pump.name} - {pump.product_name || 'وقود'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-[200px]">
                                        <label className="text-xs font-bold text-indigo-900 mb-1 block">العداد (Counter)</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.counter_id} 
                                                onChange={handleCounterChange}
                                                disabled={!formData.pump_id}
                                                className="w-full text-sm font-bold text-black bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                                            >
                                                <option value="">اختر العداد...</option>
                                                {/* Use loose comparison (==) to catch both string and number IDs */}
                                                {pumps.find(p => p.id == formData.pump_id)?.counters?.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            
                                            {loading && <RefreshCw className="w-4 h-4 absolute left-3 top-3 animate-spin text-blue-500" />}
                                        </div>
                                    </div>

                                    {/* Auto-shown Fuel & Worker Badges */}
                                    <AnimatePresence>
                                        {selectedCounter && (
                                            <>
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getFuelStyle(selectedCounter.fuel_type)} h-[42px] min-w-[120px]`}
                                                >
                                                    <Droplets className="w-4 h-4" />
                                                    <div>
                                                        <div className="text-[10px] opacity-75 leading-none">الوقود</div>
                                                        <div className="text-xs font-bold leading-none mt-1">{selectedCounter.fuel_type}</div>
                                                    </div>
                                                </motion.div>

                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm h-[42px] min-w-[140px]"
                                                >
                                                    <div className="p-1 bg-slate-100 rounded-full">
                                                        <User className="w-3 h-3 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 leading-none">العامل المسؤول</div>
                                                        <div className="text-xs font-bold leading-none mt-1">{selectedCounter.worker_name}</div>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* 2. Readings Row (Compact) */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                
                                {/* Opening Reading with Tank Name Badge */}
                                <div className="md:col-span-4 flex flex-col gap-2">
                                    {/* Tank Name Badge - Shows when counter is selected */}
                                    <AnimatePresence>
                                        {selectedCounter && selectedCounter.tank_name && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg px-3 py-1.5 shadow-md"
                                            >
                                                <Database className="w-4 h-4" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] opacity-80">البئر/الخزان</span>
                                                    <span className="text-sm font-bold leading-none">{selectedCounter.tank_name}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Previous Reading */}
                                    <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 w-full">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <RefreshCw className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-500 block">قراءة العداد السابقة</span>
                                            <div className="text-lg font-mono font-black text-slate-700 tracking-tight">
                                                {formatNumber(formData.opening_reading) || '---'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Closing Reading - Smaller Size */}
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">القراءة الحالية</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.closing_reading} 
                                            onChange={handleReadingChange}
                                            disabled={!selectedCounter}
                                            autoFocus
                                            className={`w-full font-mono text-base font-bold border rounded-xl p-2.5 focus:ring-4 outline-none transition-all shadow-sm ${
                                                parseFloat(formData.closing_reading) < parseFloat(formData.opening_reading) 
                                                ? 'border-red-300 focus:ring-red-500/10 bg-red-50 text-red-600' 
                                                : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-400 bg-white text-slate-800'
                                            }`}
                                            placeholder={selectedCounter ? formatNumber(selectedCounter.current_reading) : '000000'}
                                        />
                                        <div className="absolute left-3 top-2.5 text-[10px] text-slate-300 font-bold">لتر</div>
                                    </div>
                                    {parseFloat(formData.closing_reading) < parseFloat(formData.opening_reading) && (
                                        <p className="text-[10px] text-red-500 mt-1 font-bold flex items-center gap-1 animate-pulse">
                                            <AlertCircle className="w-3 h-3" />
                                            خطأ: القراءة أقل من السابقة
                                        </p>
                                    )}
                                </div>

                                {/* Volume Sold */}
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">الكمية المباعة</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={formatNumber(formData.volume_sold)} 
                                            readOnly 
                                            className="w-full bg-indigo-50/50 text-indigo-600 font-mono text-base font-bold border border-indigo-100 rounded-xl p-2.5"
                                        />
                                        <div className="absolute left-3 top-2.5 text-[10px] text-indigo-300 font-bold">لتر</div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider with Price Info */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-xs text-slate-400 font-mono">
                                        سعر الوحدة: <span className="text-slate-700 font-bold">{formatCurrency(formData.unit_price)}</span>
                                    </span>
                                </div>
                            </div>

                            {/* 3. Payment Details (Compact) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">طريقة الدفع</label>
                                    <div className="flex rounded-lg overflow-hidden border border-slate-300">
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, payment_method: 'cash'}))}
                                            className={`flex-1 py-2 text-xs font-bold transition-all ${formData.payment_method === 'cash' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            💵 نقدي
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(p => ({...p, payment_method: 'credit'}))}
                                            className={`flex-1 py-2 text-xs font-bold transition-all ${formData.payment_method === 'credit' ? 'bg-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            📄 آجل
                                        </button>
                                    </div>
                                </div>

                                {formData.payment_method === 'cash' ? (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">نوع الحساب</label>
                                            <select 
                                                value={formData.account_type}
                                                onChange={(e) => setFormData(p => ({...p, account_type: e.target.value, account_id: ''}))}
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="safe">خزنة (Safe)</option>
                                                <option value="bank">بنك (Bank)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">الايداع في</label>
                                            <select 
                                                value={formData.account_id}
                                                onChange={(e) => setFormData(p => ({...p, account_id: e.target.value}))}
                                                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">اختر الحساب...</option>
                                                {formData.account_type === 'safe' 
                                                    ? safes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                                    : banks.map(b => <option key={b.id} value={b.id}>{b.bank_name} - {b.account_number}</option>)
                                                }
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">العميل (Customer)</label>
                                        <select 
                                            value={formData.customer_id}
                                            onChange={(e) => setFormData(p => ({...p, customer_id: e.target.value}))}
                                            className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 outline-none focus:ring-1 focus:ring-amber-500"
                                        >
                                            <option value="">اختر العميل...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} - رصيد: {formatCurrency(c.balance)}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={submitting || !formData.closing_reading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    حفظ العملية
                                </motion.button>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* Left Sidebar - Fixed Summary */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-3 lg:sticky lg:top-6 lg:bottom-6"
                >
                    <div className="bg-gradient-to-br from-indigo-600/90 to-purple-700/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 text-white border border-white/10 h-full min-h-[400px] flex flex-col relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-6 text-indigo-100">
                                <Wallet className="w-6 h-6" />
                                <h3 className="font-bold text-lg">ملخص العملية</h3>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md">
                                    <div className="text-xs text-indigo-200 mb-1">الكمية المباعة</div>
                                    <div className="text-2xl font-black font-mono tracking-tight flex items-baseline gap-1">
                                        {formatNumber(formData.volume_sold)}
                                        <span className="text-sm font-bold opacity-75">لتر</span>
                                    </div>
                                </div>

                                <div className="space-y-3 py-4">
                                    <div className="flex justify-between text-sm opacity-80">
                                        <span>سعر الوحدة:</span>
                                        <span className="font-mono">{formatCurrency(formData.unit_price)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm opacity-80">
                                        <span>عدد الوحدات:</span>
                                        <span className="font-mono">{formData.volume_sold}</span>
                                    </div>
                                    {formData.payment_method === 'credit' && (
                                        <div className="flex justify-between text-xs text-amber-300 font-bold bg-amber-500/10 p-2 rounded">
                                            <span>الدفع:</span>
                                            <span>آجل (ذمم)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/20">
                                <div className="text-sm text-indigo-200 mb-1">الإجمالي النهائي</div>
                                <div className="text-4xl font-black font-mono tracking-tight flex items-baseline gap-2">
                                    {formatNumber(formData.total_amount)}
                                    <span className="text-base font-bold text-indigo-200">SDG</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
