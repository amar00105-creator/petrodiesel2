import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabGroup, TabList, Tab } from '@tremor/react';
import { Users, Truck, Building2 } from 'lucide-react';

import SupplierList from './SupplierList';
import CustomerList from './CustomerList';
import AddSupplierModal from './AddSupplierModal';
import AddCustomerModal from './AddCustomerModal';

export default function Partners(props) {
    const { suppliers = [], customers: initialCustomers = [] } = props;
    
    // Manage customers in state to allow updates without reload
    const [customers, setCustomers] = useState(initialCustomers);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Update state when initialCustomers changes (e.g. if we did reload, though we try to avoid it)
    React.useEffect(() => {
        setCustomers(initialCustomers);
    }, [initialCustomers]);

    const handleCustomerUpdate = (newCustomers) => {
        setCustomers(newCustomers);
    };

    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

    const handleAdd = () => {
        if (selectedIndex === 0) setIsAddSupplierOpen(true);
        else setIsAddCustomerOpen(true);
    };

    const handleExport = (type) => {
        // Simple generic export based on active tab data
        const dataToExport = selectedIndex === 0 ? suppliers : customers;
        const filename = selectedIndex === 0 ? 'suppliers' : 'customers';
        
        if (type === 'print') {
            window.print();
            return;
        }

        if (dataToExport.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }

        // Generate CSV
        const headers = Object.keys(dataToExport[0]).join(',');
        const rows = dataToExport.map(item => Object.values(item).map(val => `"${val}"`).join(','));
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto min-h-screen space-y-8 animate-fade-in">

            {/* Tabs Navigation & Actions Header */}
            <div className="space-y-6">
                <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-6">
                        {/* Right Side: Tabs (RTL) */}
                        <div className="w-full md:w-auto flex justify-center md:justify-start">
                            <TabList variant="solid" className="bg-slate-50 p-1 rounded-xl shadow-inner border border-slate-200/50">
                                <Tab className="px-6 py-2 rounded-lg font-bold text-slate-500 ui-selected:bg-blue-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4"/>
                                        <span>الموردين</span>
                                    </div>
                                </Tab>
                                <Tab className="px-6 py-2 rounded-lg font-bold text-slate-500 ui-selected:bg-indigo-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4"/>
                                        <span>العملاء (الزبائن)</span>
                                    </div>
                                </Tab>
                            </TabList>
                        </div>

                        {/* Left Side: Actions */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
                            <button 
                                onClick={() => handleExport('csv')}
                                className="flex items-center GAP-2 px-4 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold border border-slate-200 transition-colors text-sm"
                            >
                                <span>تصدير</span>
                            </button>
                            <button 
                                onClick={() => handleAdd()} 
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm"
                            >
                                <span>{selectedIndex === 0 ? 'إضافة مورد' : 'إضافة عميل'}</span>
                            </button>
                             <button 
                                onClick={() => window.print()} 
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold border border-slate-200 transition-colors text-sm"
                            >
                                <span>طباعة</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <AnimatePresence mode='wait'>
                            {selectedIndex === 0 && (
                                <motion.div 
                                    key="suppliers"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <SupplierList suppliers={suppliers} hideHeader={true} />
                                </motion.div>
                            )}
                            {selectedIndex === 1 && (
                                <motion.div 
                                    key="customers"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <CustomerList customers={customers} onUpdate={handleCustomerUpdate} hideHeader={true} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabGroup>
            </div>

            {/* Modals */}
            <AddSupplierModal isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} onSuccess={() => window.location.reload()} />
            <AddCustomerModal isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} onSuccess={() => window.location.reload()} />
        </div>
    );
}
