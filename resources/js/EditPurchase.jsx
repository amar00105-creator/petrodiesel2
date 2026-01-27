import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, Button } from '@tremor/react';
import { ChevronLeft, Save, Building2, Truck, Droplet, Fuel, Calculator, User, Hash, CheckCircle } from 'lucide-react';

export default function EditPurchase({ purchase, suppliers = [], drivers = [], tanks = [], fuelTypes = [] }) {
    const [loading, setLoading] = useState(false);
    
    // Initial State from Purchase Prop
    const [volume, setVolume] = useState(purchase?.volume_ordered || '');
    const [price, setPrice] = useState(purchase?.price_per_liter || '');
    const [total, setTotal] = useState(purchase?.total_cost || 0);

    // Driver State
    const [driverName, setDriverName] = useState(purchase?.driver_name || '');
    const [truckNumber, setTruckNumber] = useState(purchase?.truck_number || '');

    // Calculations
    useEffect(() => {
        const v = parseFloat(volume) || 0;
        const p = parseFloat(price) || 0;
        setTotal(v * p);
    }, [volume, price]);

    const handleDriverSelect = (e) => {
         const val = e.target.value;
         setDriverName(val);
         const match = drivers.find(d => d.name === val);
         if(match) setTruckNumber(match.truck_number || '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Form submits natively to action
        e.target.submit();
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <Fuel className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <Title className="text-2xl font-bold text-navy-900 font-cairo">تعديل فاتورة مشتريات</Title>
                        <Text className="text-slate-500">تحديث بيانات الشحنة والفاتورة</Text>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                     <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                        <Hash className="w-5 h-5 text-slate-500" />
                        <span className="text-lg font-mono font-bold text-slate-700">{purchase?.invoice_number}</span>
                    </div>
                    <Button 
                        type="submit" 
                        form="editForm"
                        loading={loading}
                        className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 border-none"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        حفظ التعديلات
                    </Button>
                </div>
            </div>

            <form id="editForm" action="/PETRODIESEL2/public/purchases/update" method="POST" className="space-y-6" onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={purchase?.id} />
                <input type="hidden" name="total_cost" value={total} />
                
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Right Column: Key Info */}
                    <div className="space-y-6">
                         {/* Supplier */}
                         <Card className="rounded-3xl shadow-sm ring-1 ring-amber-100 bg-amber-50/30">
                            <label className="flex items-center gap-2 font-bold text-slate-700 mb-4">
                                <Building2 className="w-5 h-5 text-amber-500"/> المورد
                            </label>
                            <select 
                                name="supplier_id" 
                                defaultValue={purchase?.supplier_id}
                                className="w-full p-3.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold text-slate-700" 
                                required
                            >
                                <option value="">اختر المورد...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                         </Card>

                         {/* Tank Selection (If needed, legacy logic included tank_id, creating logic removed it in favor of offloading later. 
                             We include it here if the record explicitly has it, or we rely on 'Fuel Type' if that field exists. 
                             Purchase model has tank_id. Let's allowing editing it if status is not finalized/offloaded?
                             Actually, if status is 'ordered', tank isn't usually set yet. 
                             We will just keep standard fields.
                         */}
                          <Card className="rounded-3xl shadow-sm ring-1 ring-blue-100 bg-blue-50/30">
                            <label className="flex items-center gap-2 font-bold text-slate-700 mb-4">
                                <Fuel className="w-5 h-5 text-blue-500"/> نوع الوقود
                            </label>
                            <select 
                                name="fuel_type_id" 
                                defaultValue={purchase?.fuel_type_id}
                                className="w-full p-3.5 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold text-slate-700"
                            >
                                <option value="">اختر نوع الوقود...</option>
                                {fuelTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                            </select>
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
                                        placeholder="0.00"
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
                         <Card className="rounded-3xl shadow-sm ring-1 ring-indigo-100 bg-indigo-50/30">
                             <div className="flex justify-between items-center mb-4">
                                <label className="flex items-center gap-2 font-bold text-slate-700">
                                    <Truck className="w-5 h-5 text-indigo-500"/> السائق والشاحنة
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                     <input 
                                        type="text" name="driver_name" list="driverList"
                                        value={driverName} onChange={handleDriverSelect}
                                        className="w-full p-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                                        placeholder="اسم السائق..."
                                    />
                                    <datalist id="driverList">
                                        {drivers.map(d => <option key={d.id} value={d.name}/>)}
                                    </datalist>
                                </div>
                                <input 
                                    type="text" name="truck_number" 
                                    value={truckNumber} onChange={(e) => setTruckNumber(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                                    placeholder="رقم الشاحنة"
                                />
                            </div>
                         </Card>
                    </div>

                </div>
            </form>
        </motion.div>
    );
}
