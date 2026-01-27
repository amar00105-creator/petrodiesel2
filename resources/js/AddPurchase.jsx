import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Metric, DonutChart } from '@tremor/react';
import { Truck, Droplets, Wallet, Save, FileText, Calendar, Fuel } from 'lucide-react';
import { toast } from 'sonner';

export default function AddPurchase({ suppliers, tanks }) {
    const [formData, setFormData] = useState({
        supplier_id: '',
        tank_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        invoice_number: '',
        quantity: '',
        unit_price: '',
        vat_rate: 15, // Default 15%
        vat_amount: 0,
        subtotal: 0,
        total_cost: 0,
        notes: ''
    });

    const [selectedTank, setSelectedTank] = useState(null);

    // Calculations
    const calculateTotal = (qty, price, taxRate) => {
        const q = parseFloat(qty) || 0;
        const p = parseFloat(price) || 0;
        const r = parseFloat(taxRate) || 0;

        const sub = q * p;
        const tax = sub * (r / 100);
        const total = sub + tax;

        setFormData(prev => ({ 
            ...prev, 
            subtotal: sub,
            vat_amount: tax,
            total_cost: total 
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'tank_id') {
            setSelectedTank(tanks.find(t => t.id == value));
        }

        if (['quantity', 'unit_price', 'vat_rate'].includes(name)) {
            const qty = name === 'quantity' ? value : formData.quantity;
            const price = name === 'unit_price' ? value : formData.unit_price;
            const rate = name === 'vat_rate' ? value : formData.vat_rate;
            calculateTotal(qty, price, rate);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = new FormData();
        Object.keys(formData).forEach(key => form.append(key, formData[key]));
        
        try {
            const response = await fetch('/PETRODIESEL2/public/purchases/store', {
                method: 'POST',
                body: form
            });

            if (response.redirected || response.ok) {
                toast.success('تم تسجيل فاتورة الشراء بنجاح');
                setTimeout(() => window.location.href = '/PETRODIESEL2/public/purchases', 1000);
            } else {
                toast.error('حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            toast.error('فشل الاتصال بالخادم');
        }
    };

    // Animation
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <motion.div 
            initial="hidden" animate="visible" variants={containerVariants}
            className="grid grid-cols-12 gap-6 h-full p-6 max-w-[1800px] mx-auto"
        >
            {/* Left Panel: Summary & Tank State (4 Cols) */}
            <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 flex flex-col gap-6 sticky top-8 h-fit">
                
                {/* Total Cost Card */}
                <Card className="bg-navy-900 border-none shadow-2xl relative overflow-hidden p-8 text-center group">
                    <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"></div>
                    <Text className="text-blue-200 uppercase tracking-widest mb-2 font-mono relative z-10">إجمالي الفاتورة</Text>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter relative z-10">
                        {formData.total_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="text-xl text-blue-400 ml-2">SAR</span>
                    </div>
                </Card>

                {/* Tank Visualizer */}
                <Card className="bg-white ring-1 ring-slate-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <Title className="text-navy-900 mb-6">حالة الخزان المستقبل</Title>
                    {selectedTank ? (
                        <>
                            <div className="relative w-40 h-40">
                                <DonutChart
                                    data={[
                                        { name: 'Current', value: parseFloat(selectedTank.current_volume) || 0 },
                                        { name: 'Capacity', value: parseFloat(selectedTank.capacity) || 10000 },
                                    ]}
                                    variant="pie"
                                    colors={['indigo', 'slate']}
                                    showLabel={false}
                                    className="h-40 w-40"
                                />
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <Droplets className="w-8 h-8 text-indigo-500 mb-1" />
                                    <span className="text-xs font-bold text-slate-500">{selectedTank.product_type}</span>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <Text className="font-bold text-lg text-navy-900">{selectedTank.name}</Text>
                                <Text className="text-slate-500 text-sm">السعة الحالية: {selectedTank.current_volume} لتر</Text>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400">
                            <Fuel className="w-16 h-16 mx-auto mb-3 opacity-20"/>
                            <p>اختر الخزان لعرض حالته</p>
                        </div>
                    )}
                </Card>

            </motion.div>

            {/* Right Panel: Purchase Form (8 Cols) */}
            <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 overflow-y-auto pb-20 px-2 scrollbar-thin">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div>
                            <Title className="font-bold text-navy-900 text-xl">تسجيل مشتروات وقود</Title>
                            <Text className="text-sm text-slate-500">إدخال شحنة وقود جديدة للمحطة</Text>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>

                    <Card className="space-y-6">
                        {/* Supplier & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">المورد</label>
                                <select 
                                    name="supplier_id" 
                                    value={formData.supplier_id} 
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    required
                                >
                                    <option value="">اختر المورد...</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name || 'Unknown Supplier'}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الفاتورة</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-slate-400 w-5 h-5"/>
                                    <input 
                                        type="date" 
                                        name="purchase_date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tank & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">الخزان (المستودع)</label>
                                <select 
                                    name="tank_id" 
                                    value={formData.tank_id} 
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    required
                                >
                                    <option value="">تفريغ في...</option>
                                    {tanks.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.product_type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">الكمية (لتر)</label>
                                <input 
                                    type="number" 
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-lg"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">سعر الشراء (للوحدة)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    name="unit_price"
                                    value={formData.unit_price}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-lg"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                         {/* Tax & Totals */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">نسبة الضريبة (%)</label>
                                <input 
                                    type="number" 
                                    name="vat_rate"
                                    value={formData.vat_rate}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-center text-blue-600"
                                    placeholder="15"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">قيمة الضريبة</label>
                                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-center text-slate-500">
                                    {(parseFloat(formData.vat_amount) || 0).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">الإجمالي قبل الضريبة</label>
                                <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-center text-slate-700">
                                    {(parseFloat(formData.subtotal) || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Invoice & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الفاتورة المرجعي</label>
                                <div className="relative">
                                    <FileText className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                                    <input 
                                        type="text" 
                                        name="invoice_number"
                                        value={formData.invoice_number}
                                        onChange={handleChange}
                                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                        placeholder="مثال: INV-2024-001"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات</label>
                                <textarea 
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    rows="1"
                                    placeholder="أي تفاصيل إضافية..."
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <Save className="w-5 h-5"/> تسجيل الفاتورة
                        </button>
                    </div>

                </form>
            </motion.div>
        </motion.div>
    );
}
