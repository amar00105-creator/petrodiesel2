import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, TextInput, Badge, Button, Select, SelectItem } from '@tremor/react';
import { Search, Plus, Minus, DollarSign, Calendar, Save, History, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function Payroll({ employees = [], workers = [], drivers = [], search = '' }) {
    const [view, setView] = useState('sheet'); // 'sheet' or 'history'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    // const [searchTerm, setSearchTerm] = useState(''); // Lifted to parent
    
    // Modal State
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState('advance'); // advance, deduction, bonus
    const [selectedEntity, setSelectedEntity] = useState(null); // { id, type, name }

    useEffect(() => {
        // Here we could fetch specific monthly data if needed
    }, [selectedMonth, selectedYear]);

    // Unified List
    const allStaff = [
        ...employees.map(e => ({ ...e, type: 'employee', typeName: 'موظف' })),
        ...workers.map(w => ({ ...w, type: 'worker', typeName: 'عامل' })),
        ...drivers.map(d => ({ ...d, type: 'driver', typeName: 'سائق' }))
    ].filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const handleAction = (staff, type) => {
        setSelectedEntity(staff);
        setActionType(type);
        setIsActionModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Controls - Filters Only, Search moved to parent */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200 p-4 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:ring-white/10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Title className="dark:text-white">كشف الرواتب</Title>
                        <Badge>{allStaff.length} موظف</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none dark:bg-white/10 dark:border-white/10 dark:text-white"
                        >
                            {Array.from({length: 12}, (_, i) => (
                                <option key={i+1} value={i+1} className="dark:bg-slate-800">{i+1} - {new Date(0, i).toLocaleString('ar-EG', {month: 'long'})}</option>
                            ))}
                        </select>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none dark:bg-white/10 dark:border-white/10 dark:text-white"
                        >
                            <option value="2024" className="dark:bg-slate-800">2024</option>
                            <option value="2025" className="dark:bg-slate-800">2025</option>
                            <option value="2026" className="dark:bg-slate-800">2026</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* List */}
            <div className="grid gap-4">
                {allStaff.map(staff => (
                    <PayrollRow 
                        key={`${staff.type}-${staff.id}`} 
                        staff={staff} 
                        onAction={handleAction}
                    />
                ))}
            </div>

            {/* Action Modal */}
            <PayrollActionModal 
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                type={actionType}
                entity={selectedEntity}
            />
        </div>
    );
}

function PayrollRow({ staff, onAction }) {
    const [baseSalary, setBaseSalary] = useState(0); // This should be fetched
    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial Fetch (Ideally done in bulk parent but doing here for simplicity)
    useEffect(() => {
        const fetchSalary = async () => {
            try {
                const res = await fetch(`/PETRODIESEL2/public/hr/api?entity=payroll&action=get_salary&e_type=${staff.type}&e_id=${staff.id}`);
                const data = await res.json();
                if (data.success) setBaseSalary(data.amount);
            } catch(e) {}
        };
        fetchSalary();
    }, [staff]);

    const handleSaveSalary = async () => {
        setLoading(true);
        try {
            const form = new FormData();
            form.append('e_type', staff.type);
            form.append('e_id', staff.id);
            form.append('amount', baseSalary);
            
            await fetch('/PETRODIESEL2/public/hr/api?entity=payroll&action=set_salary', {
                method: 'POST',
                body: form
            });
            setIsEditingSalary(false);
            toast.success('تم حفظ الراتب الأساسي');
        } catch (e) {
            toast.error('خطأ في الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div layout className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition-all hover:shadow-md dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-1/4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                        ${staff.type === 'employee' ? 'bg-indigo-500' : staff.type === 'worker' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                        {staff.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 dark:text-white">{staff.name}</div>
                        <Badge size="xs" color="slate">{staff.typeName}</Badge>
                    </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    {/* Base Salary */}
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 dark:bg-white/5 dark:border-white/10">
                        <div className="text-xs text-slate-500 mb-1 dark:text-slate-400">الراتب الأساسي</div>
                        <div className="flex items-center gap-2">
                            {isEditingSalary ? (
                                <input 
                                    type="number" 
                                    value={baseSalary} 
                                    onChange={(e) => setBaseSalary(e.target.value)}
                                    className="w-20 bg-white border border-slate-300 rounded px-1 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            ) : (
                                <span className="font-bold font-mono dark:text-white">{Number(baseSalary).toLocaleString()}</span>
                            )}
                            
                            {isEditingSalary ? (
                                <button onClick={handleSaveSalary} disabled={loading} className="text-green-600 hover:bg-green-100 p-1 rounded">
                                    <Save className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={() => setIsEditingSalary(true)} className="text-slate-400 hover:text-blue-600 p-1 rounded dark:hover:text-blue-400">
                                    <History className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex gap-2 justify-center">
                        <button onClick={() => onAction(staff, 'advance')} 
                            className="flex-1 py-2 px-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-bold text-sm flex justify-center items-center gap-2 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20">
                            <Wallet className="w-4 h-4"/>
                            <span>سلفة</span>
                        </button>
                        <button onClick={() => onAction(staff, 'deduction')}
                            className="flex-1 py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-bold text-sm flex justify-center items-center gap-2 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">
                            <Minus className="w-4 h-4"/>
                            <span>خصم</span>
                        </button>
                        <button onClick={() => onAction(staff, 'bonus')}
                            className="flex-1 py-2 px-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-bold text-sm flex justify-center items-center gap-2 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20">
                            <Plus className="w-4 h-4"/>
                            <span>مكافأة</span>
                        </button>
                    </div>

                    {/* Net (Placeholder for now) */}
                    <div className="text-center bg-slate-800 text-white rounded-lg p-2 dark:bg-slate-900">
                        <div className="text-[10px] text-slate-400">الصافي التقديري</div>
                        <div className="font-bold font-mono text-lg">{Number(baseSalary).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function PayrollActionModal({ isOpen, onClose, type, entity }) {
    if (!isOpen || !entity) return null;

    const titles = {
        advance: 'تسجيل سلفة',
        deduction: 'تسجيل خصم / جزاء',
        bonus: 'تسجيل مكافأة'
    };

    const colors = {
        advance: 'amber',
        deduction: 'red',
        bonus: 'green'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        fd.append('e_type', entity.type);
        fd.append('e_id', entity.id);
        fd.append('type', type);

        try {
            const res = await fetch('/PETRODIESEL2/public/hr/api?entity=payroll&action=add_entry', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                toast.success('تمت العملية بنجاح');
                onClose();
            } else {
                toast.error(data.message || 'خطأ');
            }
        } catch(e) {
            toast.error('خطأ في الاتصال');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden dark:bg-slate-900 dark:border dark:border-white/10"
            >
                <div className={`p-4 border-b border-${colors[type]}-100 bg-${colors[type]}-50 flex justify-between items-center dark:bg-${colors[type]}-900/20 dark:border-${colors[type]}-900/50`}>
                    <h3 className={`font-bold text-lg text-${colors[type]}-800 dark:text-${colors[type]}-400`}>{titles[type]}</h3>
                    <button onClick={onClose} className="dark:text-slate-400">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="text-center font-bold text-slate-700 dark:text-white">{entity.name}</div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300">المبلغ (ريال)</label>
                        <input type="number" name="amount" required step="0.01"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-mono text-center dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300">ملاحظات / السبب</label>
                        <textarea name="notes" rows="2"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 dark:text-slate-300">التاريخ</label>
                        <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                        />
                    </div>

                    <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white shadow-lg bg-${colors[type] === 'amber' ? 'amber-500 hover:bg-amber-600' : colors[type] === 'red' ? 'red-600 hover:bg-red-700' : 'green-600 hover:bg-green-700'}`}>
                        حفظ
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
