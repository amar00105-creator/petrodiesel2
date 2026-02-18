
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, User, Droplets, CreditCard, Save, RefreshCw, 
    Wallet, Building2, AlertCircle, CheckCircle, Search, Truck, Database, AlertTriangle, X,
    List, Grid, ArrowRightLeft, Check, ChevronUp, ChevronDown, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from './components/ThemeProvider';
import { openPrintPreview, formatDateArabic } from './utils/printPreview';

// --- Global Helpers ---
const getFuelStyle = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('diesel') || t.includes('ديزل')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (t.includes('petrol') || t.includes('بنزين')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (t.includes('gas') || t.includes('غاز')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
};
const formatCurrency = (amt) => parseFloat(amt || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '') + ' SDG';
const formatNumber = (num) => parseFloat(num || 0).toLocaleString('en-US');

// --- Sub-Component: Single Sale Form ---
// Compact no-scroll layout with glassmorphism and animations
const SingleSaleForm = ({ 
    pumps, safes, banks, customers, invoiceNumber, 
    formData, setFormData, handlePumpChange, handleCounterChange, 
    handleReadingChange, handleSubmit, submitting, selectedCounter, 
    loading, stockWarning, setStockWarning, formatCurrency, formatNumber, getFuelStyle, isDark 
}) => {

    const getFuelColor = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('diesel') || t.includes('ديزل') || t.includes('جاز')) return { main: '#f59e0b', bg: 'rgba(245,158,11,0.12)', glow: 'rgba(245,158,11,0.3)' };
        if (t.includes('petrol') || t.includes('بنزين')) return { main: '#10b981', bg: 'rgba(16,185,129,0.12)', glow: 'rgba(16,185,129,0.3)' };
        if (t.includes('gas') || t.includes('غاز')) return { main: '#a855f7', bg: 'rgba(168,85,247,0.12)', glow: 'rgba(168,85,247,0.3)' };
        return { main: '#3b82f6', bg: 'rgba(59,130,246,0.12)', glow: 'rgba(59,130,246,0.3)' };
    };

    const fuelColor = selectedCounter ? getFuelColor(selectedCounter.fuel_type) : null;

    return (
        <div className="space-y-3 relative z-10">
            {/* ROW 1: Pump + Counter + Worker in ONE row */}
            <div 
                className="rounded-2xl p-3 transition-all duration-500"
                style={{
                    background: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                    boxShadow: isDark ? '0 4px 24px -4px rgba(0,0,0,0.3)' : '0 4px 24px -4px rgba(0,0,0,0.08)',
                }}
            >
                <div className={`grid gap-3 items-end ${selectedCounter ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    {/* Pump Select */}
                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>
                            <Truck className="w-3 h-3" /> الماكينة
                        </label>
                        <select 
                            value={formData.pump_id} 
                            onChange={handlePumpChange}
                            className="w-full bg-transparent py-2 text-sm font-bold outline-none transition-all appearance-none cursor-pointer"
                            style={{
                                color: isDark ? '#e2e8f0' : '#334155',
                                borderBottom: `2px solid ${isDark ? 'rgba(96,165,250,0.3)' : 'rgba(59,130,246,0.3)'}`,
                            }}
                        >
                            <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>اختر الماكينة...</option>
                            {pumps.map(pump => (
                                <option key={pump.id} value={pump.id} style={{ background: isDark ? '#1e293b' : '#fff' }}>{pump.name} - {pump.product_name || 'وقود'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Counter Select */}
                    <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: isDark ? '#c084fc' : '#9333ea' }}>
                            <Calculator className="w-3 h-3" /> العداد
                        </label>
                        <select 
                            value={formData.counter_id} 
                            onChange={handleCounterChange}
                            disabled={!formData.pump_id}
                            className="w-full bg-transparent py-2 text-sm font-bold outline-none transition-all appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                color: isDark ? '#e2e8f0' : '#334155',
                                borderBottom: `2px solid ${isDark ? 'rgba(192,132,252,0.3)' : 'rgba(147,51,234,0.3)'}`,
                            }}
                        >
                            <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>اختر العداد...</option>
                            {pumps.find(p => p.id == formData.pump_id)?.counters?.map(c => (
                                <option key={c.id} value={c.id} style={{ background: isDark ? '#1e293b' : '#fff' }}>{c.name}</option>
                            ))}
                        </select>
                        {loading && <div className="absolute left-2 top-7"><RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: '#c084fc' }}/></div>}
                    </div>

                    {/* Worker Name — Animated appear */}
                    <AnimatePresence>
                        {selectedCounter && (
                            <motion.div
                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                className="flex items-center gap-2 py-2 px-3 rounded-xl"
                                style={{
                                    background: isDark ? 'rgba(96,165,250,0.08)' : 'rgba(59,130,246,0.06)',
                                    border: `1px solid ${isDark ? 'rgba(96,165,250,0.15)' : 'rgba(59,130,246,0.12)'}`,
                                }}
                            >
                                <div className="p-1.5 rounded-lg" style={{ background: isDark ? 'rgba(96,165,250,0.15)' : 'rgba(59,130,246,0.1)' }}>
                                    <User className="w-3.5 h-3.5" style={{ color: isDark ? '#60a5fa' : '#3b82f6' }} />
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>العامل</div>
                                    <div className="text-sm font-black" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{selectedCounter.worker_name || 'غير محدد'}</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ROW 2: Fuel Type + Tank Info — Animated bar */}
            <AnimatePresence>
                {selectedCounter && fuelColor && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        <div 
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                            style={{
                                background: fuelColor.bg,
                                border: `1px solid ${fuelColor.main}20`,
                                boxShadow: `0 2px 12px -4px ${fuelColor.glow}`,
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', delay: 0.1, damping: 12 }}
                                className="p-2 rounded-lg"
                                style={{ background: `linear-gradient(135deg, ${fuelColor.main}, ${fuelColor.main}cc)`, boxShadow: `0 4px 12px -2px ${fuelColor.glow}` }}
                            >
                                <Droplets className="w-4 h-4 text-white" />
                            </motion.div>
                            <span className="text-sm font-black" style={{ color: fuelColor.main }}>{selectedCounter.fuel_type}</span>
                            
                            <div className="h-4 w-px mx-1" style={{ background: `${fuelColor.main}30` }}></div>
                            
                            {selectedCounter.tank_name && (
                                <>
                                    <Database className="w-3.5 h-3.5" style={{ color: fuelColor.main }} />
                                    <span className="text-xs font-bold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{selectedCounter.tank_name}</span>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md" style={{ background: `${fuelColor.main}15`, color: fuelColor.main }}>
                                        {parseFloat(selectedCounter.tank_volume || 0).toLocaleString()} L
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ROW 3: Previous Reading (read-only) + Current Reading — Side by side */}
            <div className="grid grid-cols-2 gap-3">
                {/* Previous Reading — Read-only display */}
                <div 
                    className="relative p-3 rounded-2xl flex items-center justify-between gap-2 group transition-all duration-300"
                    style={{
                        background: isDark ? 'rgba(30,41,59,0.45)' : 'rgba(241,245,249,0.8)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                        boxShadow: isDark ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.04)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                            <Calculator className="w-3.5 h-3.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>القراءة السابقة</span>
                    </div>
                    <div className="text-xl font-mono font-black tracking-wider" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        {formatNumber(formData.opening_reading) || '---'}
                    </div>
                </div>

                {/* Current Reading — Editable input */}
                <div 
                    className="relative p-3 rounded-2xl flex items-center justify-between gap-2 group transition-all duration-300"
                    style={{
                        background: isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.04)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${parseFloat(formData.closing_reading) > parseFloat(formData.opening_reading) ? (isDark ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.3)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)')}`,
                        boxShadow: parseFloat(formData.closing_reading) > parseFloat(formData.opening_reading) 
                            ? `0 0 20px -4px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.05)` 
                            : (isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)'),
                    }}
                >
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="p-1.5 rounded-lg" style={{ background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }}>
                            <Calculator className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isDark ? '#34d399' : '#059669' }}>القراءة الحالية</span>
                    </div>
                    <input 
                        type="number" 
                        value={formData.closing_reading} 
                        onChange={handleReadingChange}
                        disabled={!selectedCounter}
                        className="w-auto bg-transparent text-xl font-mono font-black outline-none text-left min-w-[120px] placeholder:opacity-30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ 
                            color: '#32CD32', 
                            textShadow: '0 0 4px rgba(50,205,50,0.4)',
                        }}
                        placeholder="000000"
                        autoFocus
                    />
                </div>
            </div>

            {/* ROW 4: Payment + Submit — All in ONE compact row */}
            <div 
                className="rounded-2xl p-3 transition-all duration-300"
                style={{
                    background: isDark ? 'rgba(30,41,59,0.45)' : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                    boxShadow: isDark ? '0 2px 12px -2px rgba(0,0,0,0.3)' : '0 2px 12px -2px rgba(0,0,0,0.06)',
                }}
            >
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Payment Toggle */}
                    <div className="flex p-0.5 rounded-lg shrink-0" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                        <button 
                            onClick={() => setFormData(p => ({...p, payment_method: 'cash'}))}
                            className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                            style={{
                                background: formData.payment_method === 'cash' ? (isDark ? 'rgba(16,185,129,0.2)' : '#fff') : 'transparent',
                                color: formData.payment_method === 'cash' ? (isDark ? '#34d399' : '#059669') : (isDark ? '#64748b' : '#94a3b8'),
                                boxShadow: formData.payment_method === 'cash' ? (isDark ? '0 2px 8px rgba(16,185,129,0.15)' : '0 1px 4px rgba(0,0,0,0.08)') : 'none',
                            }}
                        >
                            <Wallet className="w-3 h-3 inline-block ml-1" /> نقدي
                        </button>
                        <button 
                            onClick={() => setFormData(p => ({...p, payment_method: 'credit'}))}
                            className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
                            style={{
                                background: formData.payment_method === 'credit' ? (isDark ? 'rgba(245,158,11,0.2)' : '#fff') : 'transparent',
                                color: formData.payment_method === 'credit' ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#64748b' : '#94a3b8'),
                                boxShadow: formData.payment_method === 'credit' ? (isDark ? '0 2px 8px rgba(245,158,11,0.15)' : '0 1px 4px rgba(0,0,0,0.08)') : 'none',
                            }}
                        >
                            <CreditCard className="w-3 h-3 inline-block ml-1" /> آجل
                        </button>
                    </div>

                    {/* Account Select */}
                    <div className="flex-1 min-w-[150px]">
                        {formData.payment_method === 'cash' ? (
                            <div className="flex gap-2">
                                <select 
                                    value={formData.account_type}
                                    onChange={(e) => setFormData(p => ({...p, account_type: e.target.value, account_id: ''}))}
                                    className="bg-transparent text-xs font-bold outline-none cursor-pointer py-1.5 px-2 rounded-lg"
                                    style={{
                                        color: isDark ? '#e2e8f0' : '#334155',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    }}
                                >
                                    <option value="safe" style={{ background: isDark ? '#1e293b' : '#fff' }}>خزنة</option>
                                    <option value="bank" style={{ background: isDark ? '#1e293b' : '#fff' }}>بنك</option>
                                </select>
                                <select 
                                    value={formData.account_id}
                                    onChange={(e) => setFormData(p => ({...p, account_id: e.target.value}))}
                                    className="flex-1 bg-transparent text-xs font-bold outline-none cursor-pointer py-1.5 px-2 rounded-lg"
                                    style={{
                                        color: isDark ? '#e2e8f0' : '#334155',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                    }}
                                >
                                    <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>اختر...</option>
                                    {formData.account_type === 'safe' 
                                        ? safes.map(s => <option key={s.id} value={s.id} style={{ background: isDark ? '#1e293b' : '#fff' }}>{s.name}</option>)
                                        : banks.map(b => <option key={b.id} value={b.id} style={{ background: isDark ? '#1e293b' : '#fff' }}>{b.bank_name}</option>)
                                    }
                                </select>
                            </div>
                        ) : (
                            <select 
                                value={formData.customer_id}
                                onChange={(e) => setFormData(p => ({...p, customer_id: e.target.value}))}
                                className="w-full bg-transparent text-xs font-bold outline-none cursor-pointer py-1.5 px-2 rounded-lg"
                                style={{
                                    color: isDark ? '#e2e8f0' : '#334155',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                }}
                            >
                                <option value="" style={{ background: isDark ? '#1e293b' : '#fff' }}>اختر العميل...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id} style={{ background: isDark ? '#1e293b' : '#fff' }}>{c.name} - رصيد: {formatCurrency(c.balance)}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmit}
                        disabled={submitting || !formData.closing_reading}
                        className="shrink-0 px-5 py-2 rounded-xl font-bold text-white text-sm flex items-center gap-2 transition-all relative overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            background: 'linear-gradient(135deg, #059669, #10b981)',
                            boxShadow: '0 4px 16px -4px rgba(16,185,129,0.4)',
                        }}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        {submitting ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                        <span className="relative z-10">{formData.id ? 'تحديث' : 'حفظ'}</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Component: Batch Sales Entry ---
const BatchSaleEntry = ({ pumps, safes, banks, customers, invoiceNumber, saleDate, onBatchSubmit, loading: globalLoading, globalPayment, fuelFilter = 'all', batchData = {}, setBatchData, setConfirmModal, setBatchSuccessModal }) => {
    
    // State to hold reading for each counter: { [counterId]: { closing: '', note: '' } }
    // const [batchData, setBatchData] = useState({}); // LIFTED TO PARENT
    // Local processing state
    const [processing, setProcessing] = useState(false);
    
    // Flatten counters
    const allcounters = React.useMemo(() => {
        let list = [];
        pumps.forEach(pump => {
            if (pump.counters) {
                pump.counters.forEach(counter => {
                    list.push({
                        ...counter,
                        pump_name: pump.name,
                        pump_id: pump.id,
                        fuel_type: pump.product_name || pump.product_type || 'غير محدد',
                        product_color: pump.product_color || '#64748b'
                    });
                });
            }
        });
        return list.filter(c => fuelFilter === 'all' || c.fuel_type === fuelFilter);
    }, [pumps, fuelFilter]);

    const handleInputChange = (counterId, field, value) => {
        setBatchData(prev => ({
            ...prev,
            [counterId]: {
                ...prev[counterId],
                [field]: value
            }
        }));
    };

    // Calculate row total
    const getRowData = (counter, entry) => {
        const closing = parseFloat(entry?.closing) || 0;
        const opening = entry?.opening ? parseFloat(entry.opening) : (parseFloat(counter.current_reading) || 0);
        const price = parseFloat(counter.current_price) || 0;
        
        const isValid = closing > opening;
        const volume = isValid ? closing - opening : 0;
        const total = volume * price;
        
        return { volume, total, isValid, closing, opening, price };
    };

    // Total of all valid entries
    const grandTotal = Object.entries(batchData || {}).reduce((sum, [id, entry]) => {
        const counter = allcounters.find(c => c.id == id);
        if (!counter) return sum;
        const { total } = getRowData(counter, entry);
        return sum + total;
    }, 0);

    const executeBatchSave = async () => {
        setConfirmModal({ show: false, count: 0, totalAmount: 0, onConfirm: null });
        setProcessing(true);
        try {
            const validRows = allcounters.filter(counter => {
                const entry = batchData[counter.id] || {};
                const { isValid, total } = getRowData(counter, entry);
                return isValid && total > 0 && !entry.success;
            });

            const promises = validRows.map(counter => {
                const entry = batchData[counter.id];
                const { volume, total, closing, opening, price } = getRowData(counter, entry);

                const formData = new FormData();
                formData.append('pump_id', counter.pump_id);
                formData.append('counter_id', counter.id);
                formData.append('sale_date', saleDate);
                formData.append('opening_reading', opening);
                formData.append('closing_reading', closing);
                formData.append('volume_sold', volume);
                formData.append('unit_price', price);
                formData.append('total_amount', total);
                formData.append('payment_method', globalPayment.method);
                formData.append('account_type', (globalPayment.method === 'bank') ? 'bank' : 'safe');
                
                if (entry.id) {
                     formData.append('id', entry.id);
                }
                
                if (globalPayment.method === 'credit') {
                     formData.append('customer_id', globalPayment.customer_id);
                } else {
                     formData.append('account_id', globalPayment.account_id);
                }
            
                formData.append('invoice_number', invoiceNumber);
                return onBatchSubmit(formData, counter.id).then(success => ({ id: counter.id, success }));
            });

            const results = await Promise.all(promises);
            const successful = results.filter(r => r.success);
            
            if (successful.length > 0) {
                 let batchTotal = 0;
                 setBatchData(prev => {
                    const next = { ...prev };
                    successful.forEach(r => {
                        if (next[r.id]) {
                            next[r.id].success = true;
                            const counter = allcounters.find(c => c.id == r.id);
                            if (counter) {
                                const { total } = getRowData(counter, next[r.id]);
                                batchTotal += total;
                            }
                        }
                    });
                    return next;
                 });

                 setBatchSuccessModal({
                     show: true,
                     count: successful.length,
                     totalAmount: batchTotal || grandTotal
                 });
            }

        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء الحفظ الجماعي');
        } finally {
            setProcessing(false);
        }
    };

    const handleGlobalSave = async () => {
        // Collect all valid rows
        const validRows = allcounters.filter(counter => {
            const entry = batchData[counter.id] || {};
            const { isValid, total } = getRowData(counter, entry);
            return isValid && total > 0 && !entry.success;
        });

        if (validRows.length === 0) {
            toast.error('لا توجد قراءات صالحة للحفظ');
            return;
        }

        // Validate Global Payment Selection
        if (globalPayment.method === 'credit' && !globalPayment.customer_id) {
            toast.error('الرجاء اختيار العميل للدفع الآجل');
            return;
        }
        if ((globalPayment.method === 'cash' || globalPayment.method === 'bank') && !globalPayment.account_id) {
            toast.error('الرجاء اختيار ' + (globalPayment.method === 'bank' ? 'البنك' : 'الخزنة') + ' للإيداع');
            return;
        }

        // Calculate total for confirmation
        let preTotal = 0;
        validRows.forEach(counter => {
            const entry = batchData[counter.id];
            const { total } = getRowData(counter, entry);
            preTotal += total;
        });

        // Show confirmation modal instead of browser confirm()
        setConfirmModal({ show: true, count: validRows.length, totalAmount: preTotal, onConfirm: executeBatchSave });
    };

    // Keyboard navigation helper
    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(`counter-input-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    return (
        <div className="space-y-4">
             {/* Header Metrics Removed - Replaced by Sticky Footer */}
             
             {/* Global Payment Settings Bar */}
             {/* Global Payment Settings Bar Removed - Moved to Parent */}

            <div className="overflow-x-auto glass-border-purple rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-4 transition-all duration-300 hover:shadow-lg">
                <table className="w-full text-sm text-right border-separate border-spacing-y-2">
                    <thead className="text-slate-800 dark:text-gray-100 uppercase font-bold text-lg">
                        <tr className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-900/80 rounded-xl transition-colors duration-300">
                            <th className="px-4 py-2.5 rounded-r-xl">الماكينة</th>
                            <th className="px-4 py-2.5">العداد</th>
                            <th className="px-4 py-2.5">نوع الوقود</th>
                            <th className="px-4 py-2.5">العامل</th>
                            <th className="px-4 py-2.5">السابقة</th>
                            <th className="px-4 py-2.5">الحالية</th>
                            <th className="px-4 py-2.5">الكمية</th>
                            <th className="px-4 py-2.5">السعر</th>
                            <th className="px-4 py-2.5 rounded-l-xl">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-200">
                        {allcounters.map((counter, index) => {
                            const entry = batchData[counter.id] || {};
                            const { volume, total, isValid, closing, opening, price } = getRowData(counter, entry);
                            const isSuccess = entry.success; // Flag if saved
                            
                            return (
                                <tr 
                                    key={counter.id} 
                                    className={`
                                        group transition-all duration-300 relative
                                        ${isValid 
                                            ? 'bg-emerald-50/50 dark:bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                            : 'bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 shadow-sm dark:shadow-black/20 hover:shadow-md'}
                                        ${isSuccess ? 'opacity-50 grayscale pointer-events-none' : ''}
                                        rounded-xl overflow-hidden
                                    `}
                                >
                                    <td className="px-4 py-1.5 font-bold text-lg text-slate-700 dark:text-slate-200 rounded-r-xl transition-colors">
                                        <span>{counter.pump_name}</span>
                                    </td>
                                    <td className="px-4 py-1.5 font-bold text-slate-500 dark:text-slate-400 transition-colors">
                                        <span className="text-lg">{counter.name}</span>
                                    </td>
                                    <td className="px-4 py-1.5">
                                        <span 
                                            className="text-base font-bold px-3 py-1.5 rounded-lg backdrop-blur-md"
                                            style={{ 
                                                color: counter.product_color,
                                                backgroundColor: counter.product_color + '15',
                                                boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)`
                                            }}
                                        >
                                            {counter.fuel_type || counter.product_type || 'غير محدد'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-1.5 font-bold text-lg text-slate-600 dark:text-slate-400 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {counter.worker_name || 'غير محدد'}
                                        </div>
                                    </td>
                                    {/* Payment Column Removed */}
                                    <td className="px-4 py-1.5 font-mono font-bold text-2xl text-red-600 dark:text-red-400">{opening.toLocaleString()}</td>
                                    <td className="px-4 py-1.5">
                                        <div className={`relative rounded-lg overflow-hidden transition-all backdrop-blur-md ${isValid ? 'ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] bg-emerald-500/5' : 'ring-1 ring-slate-300/20 dark:ring-slate-600/30 bg-white/5 shadow-inner'}`}>
                                            <input 
                                                id={`counter-input-${index}`}
                                                type="number"
                                                value={entry.closing || ''}
                                                onChange={(e) => handleInputChange(counter.id, 'closing', e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                className="w-36 bg-transparent px-3 pr-8 py-1.5 outline-none font-black text-2xl font-mono text-lime-600 dark:text-lime-400 text-center placeholder:text-slate-400 dark:placeholder:text-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="0.00"
                                            />
                                            <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col border-l border-slate-200/20 dark:border-slate-600/20">
                                                <button 
                                                    tabIndex={-1}
                                                    onClick={() => handleInputChange(counter.id, 'closing', (parseFloat(entry.closing || 0) + 1).toString())}
                                                    className="flex-1 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </button>
                                                <button 
                                                    tabIndex={-1}
                                                    onClick={() => handleInputChange(counter.id, 'closing', Math.max(0, (parseFloat(entry.closing || 0) - 1)).toString())}
                                                    className="flex-1 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors border-t border-slate-200/20 dark:border-slate-600/20"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-1.5 font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                        {volume > 0 ? volume.toLocaleString() : '-'}
                                    </td>
                                    <td className="px-4 py-1.5 font-mono font-bold text-lg text-slate-500 dark:text-slate-400">{price}</td>
                                    <td className="px-4 py-1.5 rounded-l-xl font-black text-xl font-mono text-blue-600 dark:text-blue-400 transition-colors">
                                        {total > 0 ? total.toLocaleString() : '-'}
                                        {isSuccess && <Check className="inline-block w-4 h-4 text-emerald-500 mr-2" />}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
             <div className="mt-4 p-4 mb-24 glass-border-amber rounded-2xl bg-amber-50/50 dark:bg-amber-500/[0.03] backdrop-blur-xl text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>تنبيه: سيتم حفظ جميع العمليات المدخلة دفعة واحدة برقم فاتورة موحد (#{invoiceNumber}). تأكد من مراجعة القراءات قبل الحفظ.</p>
             </div>

            {/* Static Summary Footer */}
            <div className="w-full glass-border-emerald bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 z-10 transition-all duration-300 mt-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">إجمالي اللترات</span>
                             <span className="text-lg font-bold font-mono text-slate-800 dark:text-white flex items-center gap-1">
                                {allcounters.reduce((acc, counter) => {
                                     const entry = batchData[counter.id] || {};
                                     if (!entry.closing) return acc;
                                     const open = parseFloat(counter.current_reading || 0);
                                     const close = parseFloat(entry.closing || 0);
                                     return acc + (close > open ? (close - open) : 0);
                                }, 0).toLocaleString()}
                                <span className="text-xs text-slate-500">L</span>
                             </span>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">إجمالي المبلغ</span>
                            <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                                {grandTotal.toLocaleString()} <span className="text-sm text-slate-400">SDG</span>
                            </span>
                        </div>
                        <div className="hidden md:flex flex-col ml-6">
                             <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">العدادات</span>
                             <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {Object.values(batchData || {}).filter(d => d.success).length} <span className="text-slate-400 font-normal">/ {allcounters.length}</span>
                             </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleGlobalSave}
                            disabled={processing || globalLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>حفظ الكل ({invoiceNumber})</span>
                        </button>
                        <button 
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">تحديث</span>
                        </button>
                        <button
                            className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                            title="معاينة الطباعة"
                            onClick={() => {
                                // Build table rows for ALL counters
                                const headers = ['الماكينة', 'العداد', 'نوع الوقود', 'العامل', 'السابق', 'الحالي', 'الكمية', 'السعر', 'الإجمالي'];
                                let totalAmount = 0;
                                let totalVolume = 0;
                                const rows = allcounters.map(counter => {
                                    const entry = batchData[counter.id] || {};
                                    const { volume, total, opening, closing, price } = getRowData(counter, entry);
                                    totalAmount += total;
                                    totalVolume += volume;
                                    return [
                                        counter.pump_name || '-',
                                        counter.name || '-',
                                        counter.fuel_type || '-',
                                        counter.worker_name || '-',
                                        parseFloat(opening).toLocaleString('en-US'),
                                        closing > 0 ? parseFloat(closing).toLocaleString('en-US') : '-',
                                        volume > 0 ? volume.toLocaleString('en-US') : '-',
                                        parseFloat(price).toLocaleString('en-US'),
                                        total > 0 ? total.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'
                                    ];
                                });
                                const footerRow = ['', '', '', 'الإجمالي', '', '', totalVolume.toLocaleString('en-US'), '', totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' SDG'];
                                
                                let tableHtml = '<table><thead><tr>';
                                headers.forEach(h => tableHtml += `<th>${h}</th>`);
                                tableHtml += '</tr></thead><tbody>';
                                rows.forEach(row => {
                                    tableHtml += '<tr>';
                                    row.forEach(cell => tableHtml += `<td>${cell}</td>`);
                                    tableHtml += '</tr>';
                                });
                                tableHtml += '</tbody><tfoot><tr>';
                                footerRow.forEach(cell => tableHtml += `<td>${cell}</td>`);
                                tableHtml += '</tr></tfoot></table>';
                                
                                openPrintPreview({
                                    title: 'تقرير مبيعات يومي',
                                    subtitle: 'فاتورة رقم ' + invoiceNumber + ' — ' + formatDateArabic(saleDate),
                                    content: tableHtml,
                                    landscape: true,
                                    extraStyles: `
                                        table { font-size: 10px; }
                                        th, td { padding: 6px 8px; white-space: nowrap; }
                                        tfoot td { background: #374151; color: white; font-weight: bold; font-size: 12px; }
                                    `
                                });
                            }}
                        >
                            <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">معاينة</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function AddSale({ pumps = [], safes = [], banks = [], customers = [], initialSale = null }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    // --- State ---
    const [activeTab, setActiveTab] = useState(() => {
        try { return localStorage.getItem('sales_active_tab') || 'single'; } catch { return 'single'; }
    });
    
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

    // Lifted Batch Data State
    const [batchData, setBatchData] = useState({});

    const [selectedCounter, setSelectedCounter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState('Loading...');
    const [stockWarning, setStockWarning] = useState({ show: false, available: 0 });
    const [successModal, setSuccessModal] = useState({ show: false, invoice: '', amount: 0 });
    const [batchSuccessModal, setBatchSuccessModal] = useState({ show: false, count: 0, totalAmount: 0 });
    const [confirmModal, setConfirmModal] = useState({ show: false, count: 0, totalAmount: 0, onConfirm: null });
    const [fuelFilter, setFuelFilter] = useState('all');

    // Calculate unique fuel types
    const uniqueFuelTypes = React.useMemo(() => {
        const types = new Set();
        pumps.forEach(p => {
             // Look into pumps or their counters if structured that way. 
             // Based on usage in BatchSaleEntry, pump.product_name seems to be the main source
             const type = p.product_name || p.product_type || (p.counters && p.counters[0]?.fuel_type);
             if (type) types.add(type);
        });
        return Array.from(types);
    }, [pumps]);

    // START Global Payment Settings (Lifted)
    const [globalPayment, setGlobalPayment] = useState({
        method: 'cash',
        account_id: safes[0]?.id || '',
        customer_id: ''
    });

    const handleGlobalPaymentChange = (field, value) => {
        setGlobalPayment(prev => ({ ...prev, [field]: value }));
    };
    // END Global Payment Settings

    // Initialize for Edit Mode
    useEffect(() => {
        // Set today's date from server timezone
        import('./utils/serverTime').then(({ getServerDate }) => {
            if (!initialSale) { // Only fetch date if it's a new sale
                getServerDate().then(date => {
                    setFormData(prev => ({ ...prev, sale_date: date }));
                });
            }
        });

        if (initialSale) {
            console.log('Editing Sale:', initialSale);
            
            if (Array.isArray(initialSale) && initialSale.length > 0) {
                // Batch Edit Mode
                setActiveTab('batch');
                setInvoiceNumber(initialSale[0].invoice_number);
                setFormData(prev => ({ ...prev, sale_date: initialSale[0].sale_date })); // Set date
                
                const newBatchData = {};
                initialSale.forEach(sale => {
                    newBatchData[sale.counter_id] = {
                        id: sale.id, // Store Sale ID for updates
                        opening: sale.opening_reading, // Store original opening reading
                        closing: sale.closing_reading,
                        note: sale.notes || '',
                        success: false // Allow editing by not marking as 'done/locked'
                    };
                });
                setBatchData(newBatchData);

            } else if (!Array.isArray(initialSale)) {
                // Single Sale Edit Mode
                setActiveTab('single');
                setFormData({
                    ...initialSale,
                    payment_method: initialSale.payment_method || initialSale.method || 'cash',
                    account_type: initialSale.account_type || 'safe'
                });
                setInvoiceNumber(initialSale.invoice_number);
                
                // Select the pump/counter
                if (initialSale.pump_id && initialSale.counter_id) {
                    const pump = pumps.find(p => p.id == initialSale.pump_id);
                    if (pump && pump.counters) {
                         const counter = pump.counters.find(c => c.id == initialSale.counter_id);
                         if (counter) setSelectedCounter({ ...counter, pump_name: pump.name });
                    }
                }
            }
        } else {
            // New Sale Mode - Fetch Invoice Number
             fetch(`${window.BASE_URL || ''}/sales/getNextInvoiceNumber`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setInvoiceNumber(data.invoice_number);
                })
                .catch(err => console.error('Failed to fetch invoice number', err));
        }

        // Default to first safe
        if (safes.length > 0 && !formData.account_id) {
            setFormData(prev => ({ ...prev, account_id: safes[0].id }));
        }

        // If edit mode - Re-apply logic if needed or ensure consistent state
        if (initialSale && !Array.isArray(initialSale)) {
             // For single sale, we might need to re-trigger counter details if not loaded
             if (initialSale.counter_id && !selectedCounter) {
                 handleCounterChange({ target: { value: initialSale.counter_id } }, true); 
             }
        }
    }, [safes, initialSale]);


    // Initialize Global Payment (Batch Mode) Default
    useEffect(() => {
        if (safes.length > 0 && !globalPayment.account_id) {
            setGlobalPayment(prev => ({ ...prev, account_id: safes[0].id }));
        }
    }, [safes]);

    // --- Logic ---
    
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

    const handleCounterChange = async (e, isEditInit = false) => {
        const counterId = isEditInit ? e.target.value : e.target.value;
        if (!isEditInit) setFormData(prev => ({ ...prev, counter_id: counterId }));

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

                if (!isEditInit) {
                    setFormData(prev => ({
                        ...prev,
                        unit_price: parseFloat(result.price),
                        opening_reading: parseFloat(result.current_reading),
                        worker_id: result.worker_id
                    }));
                }
                
                if (!isEditInit) toast.success('تم تحميل بيانات العداد بنجاح');
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

    const handleReadingChange = (e) => {
        const closing = parseFloat(e.target.value) || 0;
        const opening = parseFloat(formData.opening_reading) || 0;
        
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
        
        // Check Tank Volume
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
            data.append('invoice_number', invoiceNumber);

            // Check if Editing
            const isEdit = !!formData.id;
            const url = isEdit ? `${window.BASE_URL || ''}/sales/update_ajax` : `${window.BASE_URL || ''}/sales/store`;

            const response = await fetch(url, {
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

     // Batch Submit Handler
     const handleBatchRowSubmit = async (rowFormData, counterId) => {
        setSubmitting(true);
        try {
            // Determine if edit or create
            const saleId = rowFormData.get('id');
            const url = saleId ? `${window.BASE_URL || ''}/sales/update_ajax` : `${window.BASE_URL || ''}/sales/store`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: rowFormData
            });
            const result = await response.json();
            if (result.success) {
                toast.success('تم حفظ العملية بنجاح');
                // Mark row as success locally to disable it
                // We need to access the setBatchData via a ref or by passing setter to child?
                // Actually BatchSaleEntry tracks its own state, let's reload checking logic.
                // Or better: pass a callback to update local state in the child?
                // Simplest: Just reload page or fetch new Data. But to be smooth, we just mark it as done.
                // But `handleBatchRowSubmit` is defined here in parent.
                // Let's force a re-fetch of invoice number for next op
                 fetch(`${window.BASE_URL || ''}/sales/getNextInvoiceNumber`)
                    .then(res => res.json())
                    .then(d => d.success && setInvoiceNumber(d.invoice_number));
                
                return true; // Signal success
            } else {
                toast.error(result.message || 'فشل الحفظ');
                return false;
            }
        } catch (error) {
             toast.error('خطأ في الاتصال');
             return false;
        } finally {
            setSubmitting(false);
        }
    };




    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#0F172A] p-2 overflow-y-auto" style={{ direction: 'rtl' }}>
             <div className={`${activeTab === 'batch' ? 'w-full px-4' : 'max-w-[1600px] mx-auto'} grid grid-cols-1 lg:grid-cols-12 gap-4 items-start h-full transition-all duration-300`}>
                
                {/* Main Form Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={activeTab === 'batch' ? "lg:col-span-12" : "lg:col-span-9"}
                >
                    <div className="glass-container relative rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl dark:shadow-blue-500/5 backdrop-blur-3xl">
                        
                        {/* Colored Glass Edge Lines */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent dark:via-blue-500/40"></div>
                        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400/15 to-transparent dark:via-indigo-500/30"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400/15 to-transparent dark:via-indigo-500/30"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/10 to-transparent dark:via-blue-500/20"></div>

                        <div className="p-4 relative">
                             {/* Decorative Backgrounds */}
                             <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl hidden dark:block pointer-events-none"></div>
                             <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl hidden dark:block pointer-events-none"></div>

                            {/* Header Row — Compact */}
                            <div className="flex justify-between items-center mb-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Calculator className="w-5 h-5 text-white" />
                                    </div>
                                    <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">تسجيل مبيعات</h1>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></span>
                                        #{invoiceNumber}
                                    </span>
                                    <input 
                                        type="date" 
                                        value={formData.sale_date}
                                        onChange={(e) => setFormData(prev => ({...prev, sale_date: e.target.value}))}
                                        className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                                        style={{
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* TABS NAVIGATION & GLOBAL CONTROLS */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                                <div className="flex gap-1.5 p-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-xl relative z-10 w-fit shadow-sm">
                                    <button
                                        onClick={() => { setActiveTab('single'); try { localStorage.setItem('sales_active_tab', 'single'); } catch {} }}
                                        className={`
                                            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300
                                            ${activeTab === 'single' 
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'}
                                        `}
                                    >
                                        <List className="w-4 h-4" />
                                        فاتورة مفردة
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('batch'); try { localStorage.setItem('sales_active_tab', 'batch'); } catch {} }}
                                        className={`
                                            flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300
                                            ${activeTab === 'batch' 
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10'}
                                        `}
                                    >
                                        <Grid className="w-4 h-4" />
                                        إدخال العدادات
                                    </button>
                                </div>

                                {/* Fuel Filter (Visible only in Batch Mode) */}
                                <AnimatePresence>
                                    {activeTab === 'batch' && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="glass-border-cyan flex items-center gap-2 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl px-3 py-2 rounded-xl shadow-sm mx-auto"
                                        >
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">نوع الوقود:</label>
                                            <select 
                                                value={fuelFilter}
                                                onChange={(e) => setFuelFilter(e.target.value)}
                                                className="bg-transparent text-sm font-bold text-slate-700 dark:text-emerald-400 outline-none cursor-pointer min-w-[100px]"
                                            >
                                                <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">الكل</option>
                                                {uniqueFuelTypes.map(type => (
                                                    <option key={type} value={type} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{type}</option>
                                                ))}
                                            </select>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Global Payment Settings (Visible only in Batch Mode) */}
                                <AnimatePresence>
                                    {activeTab === 'batch' && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="glass-border-amber bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl px-4 py-2 rounded-xl shadow-sm flex flex-wrap items-center gap-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-blue-500" />
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">إعدادات الدفع:</span>
                                            </div>
                                            
                                            <select 
                                                value={globalPayment.method}
                                                onChange={(e) => handleGlobalPaymentChange('method', e.target.value)}
                                                className="bg-transparent text-sm font-bold text-slate-700 dark:text-white outline-none cursor-pointer"
                                            >
                                                <option value="cash" className="text-slate-800">نقد</option>
                                                <option value="bank" className="text-slate-800">بنك</option>
                                                <option value="credit" className="text-slate-800">آجل</option>
                                            </select>

                                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

                                            {globalPayment.method === 'credit' ? (
                                                <div className="flex items-center gap-2 min-w-[200px]">
                                                    <User className="w-4 h-4 text-purple-500" />
                                                    <select 
                                                        value={globalPayment.customer_id}
                                                        onChange={(e) => handleGlobalPaymentChange('customer_id', e.target.value)}
                                                        className="bg-transparent w-full text-sm font-bold text-slate-700 dark:text-white outline-none cursor-pointer"
                                                    >
                                                        <option value="">اختر العميل...</option>
                                                        {customers.map(c => <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>)}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 min-w-[200px]">
                                                    <Building2 className="w-4 h-4 text-emerald-500" />
                                                    <select 
                                                        value={globalPayment.account_id}
                                                        onChange={(e) => handleGlobalPaymentChange('account_id', e.target.value)}
                                                        className="bg-transparent w-full text-sm font-bold text-slate-700 dark:text-white outline-none cursor-pointer"
                                                    >
                                                        {globalPayment.method === 'bank' ? (
                                                            <>
                                                                <option value="">اختر البنك...</option>
                                                                {banks.map(b => <option key={b.id} value={b.id} className="text-slate-800">{b.bank_name} - {b.account_number}</option>)}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {safes.map(s => <option key={s.id} value={s.id} className="text-slate-800">{s.name}</option>)}
                                                            </>
                                                        )}
                                                    </select>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Content Area */}
                            <AnimatePresence mode="wait">
                                {activeTab === 'single' ? (
                                    <motion.div
                                        key="single"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <SingleSaleForm 
                                            pumps={pumps} 
                                            safes={safes} 
                                            banks={banks} 
                                            customers={customers} 
                                            invoiceNumber={invoiceNumber}
                                            formData={formData}
                                            setFormData={setFormData}
                                            handlePumpChange={handlePumpChange}
                                            handleCounterChange={handleCounterChange}
                                            handleReadingChange={handleReadingChange}
                                            handleSubmit={handleSubmit}
                                            submitting={submitting}
                                            selectedCounter={selectedCounter}
                                            loading={loading}
                                            stockWarning={stockWarning}
                                            setStockWarning={setStockWarning}
                                            formatCurrency={formatCurrency}
                                            formatNumber={formatNumber}
                                            getFuelStyle={getFuelStyle}
                                            isDark={isDark}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="batch"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <BatchSaleEntry 
                                            pumps={pumps}
                                            safes={safes}
                                            banks={banks}
                                            customers={customers}
                                            invoiceNumber={invoiceNumber}
                                            saleDate={formData.sale_date}
                                            loading={submitting}
                                            globalPayment={globalPayment}
                                            fuelFilter={fuelFilter}
                                            batchData={batchData}
                                            setBatchData={setBatchData}
                                            setConfirmModal={setConfirmModal}
                                            setBatchSuccessModal={setBatchSuccessModal}
                                            onBatchSubmit={async (data, id) => {
                                                const success = await handleBatchRowSubmit(data, id);
                                                if (success) {
                                                    // This internal state setting is not ideal here but works due to closure
                                                    // Better architecture would be state lifting entirely 
                                                    // but for speed inside this file:
                                                    // We trigger a re-render of BatchSaleEntry by key or let it manage itself
                                                    // Actually, BatchSaleEntry needs to know about success to mark row.
                                                    // We return success, let Child handle it.
                                                    return success;
                                                }
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </div>
                </motion.div>

                {/* Left Sidebar - Summary (Only visible for Single Mode) */}
                <AnimatePresence>
                    {activeTab === 'single' && (
                        <motion.div 
                            key="sidebar-summary"
                            initial={{ opacity: 0, x: -20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 'auto' }}
                            exit={{ opacity: 0, x: -20, width: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:col-span-3 lg:sticky lg:top-6"
                        >
                        <div className="glass-summary rounded-3xl p-5 relative overflow-hidden flex flex-col shadow-2xl dark:shadow-indigo-500/5 backdrop-blur-3xl">
                            {/* Colored Glass Edge Lines */}
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent dark:via-indigo-500/50"></div>
                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent dark:via-purple-500/40"></div>
                            <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-purple-400/15 to-transparent dark:via-purple-500/30"></div>
                            <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-indigo-400/15 to-transparent dark:via-indigo-500/30"></div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/8 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-indigo-200 uppercase tracking-widest mb-6 border-b border-slate-200/30 dark:border-indigo-500/10 pb-4 flex items-center gap-2">
                                    <Wallet className="w-4 h-4" /> ملخص الفاتورة
                                </h3>
                                
                                <div className="flex-1 space-y-8">
                                    <div>
                                        <span className="text-xs font-bold text-slate-400 dark:text-indigo-300 block mb-2">الكمية المباعة</span>
                                        <div className="glass-border-blue p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-500/[0.03] backdrop-blur-xl">
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

                                <div className="mt-auto pt-6 border-t border-slate-200/30 dark:border-indigo-500/10">
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-400 block mb-2">الإجمالي النهائي</span>
                                    <div className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-indigo-200 tracking-tighter">
                                        {formatNumber(formData.total_amount)}
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 mt-2 text-right">جنيه سوداني</div>
                                </div>
                            </div>
                        </div>

                        </motion.div>
                    )}
                </AnimatePresence>

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
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 bg-gradient-radial from-amber-500/20 to-transparent pointer-events-none"
                                    />
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", delay: 0.1, damping: 10 }}
                                        className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/50"
                                    >
                                        <AlertTriangle className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="relative z-10 text-2xl font-black text-white mb-3">الكمية غير كافية!</h2>
                                    <p className="relative z-10 text-slate-300 mb-6 text-lg">المخزون المتاح في الخزان غير كافٍ لإتمام هذه العملية</p>
                                    <div className="relative z-10 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-4 mb-6 border border-amber-500/30">
                                        <div className="text-sm text-amber-300 mb-1">الكمية المتاحة</div>
                                        <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                            {stockWarning.available.toLocaleString()}
                                        </div>
                                        <div className="text-amber-400 text-sm font-bold mt-1">لتر فقط</div>
                                    </div>
                                    <button
                                        onClick={() => setStockWarning({ show: false, available: 0 })}
                                        className="relative z-10 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
                                    >
                                        حسناً، فهمت
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Batch Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setConfirmModal({ show: false, count: 0, totalAmount: 0 })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl p-[2px] shadow-2xl shadow-blue-500/20 max-w-md w-full">
                                <div className="bg-slate-900/95 rounded-3xl p-8 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 to-transparent pointer-events-none" />
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                                        className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-blue-500/40"
                                    >
                                        <AlertCircle className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="relative z-10 text-xl font-black text-white mb-4">تأكيد عملية الحفظ</h2>
                                    <div className="relative z-10 bg-white/5 rounded-2xl p-5 mb-5 border border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-400 text-sm">عدد العدادات</span>
                                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{confirmModal.count}</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-2" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">إجمالي المبلغ</span>
                                            <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">{parseFloat(confirmModal.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-emerald-400">SDG</span></span>
                                        </div>
                                    </div>
                                    <p className="relative z-10 text-slate-400 text-sm mb-6">هل أنت متأكد من حفظ هذه العمليات؟</p>
                                    <div className="relative z-10 flex gap-3 justify-center">
                                        <button
                                            onClick={() => { if (confirmModal.onConfirm) confirmModal.onConfirm(); }}
                                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            نعم، حفظ
                                        </button>
                                        <button
                                            onClick={() => setConfirmModal({ show: false, count: 0, totalAmount: 0 })}
                                            className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Batch Success Modal */}
            <AnimatePresence>
                {batchSuccessModal.show && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.7, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.7, y: 30 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-teal-500/20 backdrop-blur-xl rounded-3xl p-[2px] shadow-2xl shadow-emerald-500/30 max-w-lg w-full">
                                <div className="bg-slate-900/95 rounded-3xl p-10 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-radial from-emerald-500/15 to-transparent pointer-events-none" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-conic from-emerald-500/20 via-transparent to-emerald-500/20 rounded-full blur-xl pointer-events-none"
                                    />
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                                        className="relative z-10 mx-auto w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50"
                                    >
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="relative z-10 text-2xl font-black text-white mb-2"
                                    >
                                        تم الحفظ بنجاح! 🎉
                                    </motion.h2>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative z-10 mb-6"
                                    >
                                        <span className="text-slate-400">تم حفظ </span>
                                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 mx-1">{batchSuccessModal.count}</span>
                                        <span className="text-slate-400"> عداد بنجاح</span>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="relative z-10 bg-gradient-to-r from-emerald-500/15 to-green-500/15 rounded-2xl p-6 mb-6 border border-emerald-500/30"
                                    >
                                        <div className="text-sm text-emerald-300 mb-2 font-bold">إجمالي المبلغ</div>
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.6, type: 'spring', damping: 15 }}
                                            className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400"
                                        >
                                            {parseFloat(batchSuccessModal.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </motion.div>
                                        <div className="text-emerald-400 text-sm font-bold mt-2">SDG</div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="relative z-10 text-slate-500 text-sm mb-6"
                                    >
                                        رقم الفاتورة: <span className="font-mono font-bold text-emerald-400">#{invoiceNumber}</span>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="relative z-10 flex gap-3 justify-center"
                                    >
                                        <button
                                            onClick={() => window.location.href = `${window.BASE_URL || ''}/sales`}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
                                        >
                                            قائمة المبيعات
                                        </button>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                                        >
                                            عملية جديدة
                                        </button>
                                    </motion.div>
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
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-xl rounded-3xl p-[2px] shadow-2xl shadow-emerald-500/20 max-w-md w-full">
                                <div className="bg-slate-900/90 rounded-3xl p-8 text-center relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-radial from-emerald-500/20 to-transparent pointer-events-none" />
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/50"
                                    >
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="relative z-10 text-2xl font-black text-white mb-3">تم الحفظ بنجاح! 🎉</h2>
                                    <div className="relative z-10 text-slate-400 mb-4">
                                        رقم الفاتورة: <span className="font-mono font-bold text-white">#{successModal.invoice}</span>
                                    </div>
                                    <div className="relative z-10 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl p-4 mb-6 border border-emerald-500/30">
                                        <div className="text-sm text-emerald-300 mb-1">إجمالي المبلغ</div>
                                        <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                                            {parseFloat(successModal.amount).toLocaleString()}
                                        </div>
                                        <div className="text-emerald-400 text-sm font-bold mt-1">SDG</div>
                                    </div>
                                    <div className="relative z-10 flex gap-3 justify-center">
                                        <button
                                            onClick={() => window.location.href = `${window.BASE_URL || ''}/sales`}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                                        >
                                            قائمة المبيعات
                                        </button>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                                        >
                                            عملية جديدة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
