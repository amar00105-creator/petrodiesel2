import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabGroup, TabList, Tab } from '@tremor/react';
import { Users, Truck, Building2 } from 'lucide-react';

import SupplierList from './SupplierList';
import CustomerList from './CustomerList';

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

    return (
        <div className="p-6 max-w-[1800px] mx-auto min-h-screen space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-slate-800 p-8 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black font-cairo mb-2">العملاء والموردون</h1>
                        <p className="text-blue-100 text-lg opacity-90 max-w-2xl leading-relaxed">
                            إدارة متكاملة للأطراف المالية (موردين وزبائن) ومتابعة الأرصدة والديون.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex gap-8 border border-white/20">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{suppliers.length}</div>
                            <div className="text-xs text-blue-200">مورد</div>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{customers.length}</div>
                            <div className="text-xs text-blue-200">عميل</div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* Tabs Navigation */}
            <div className="space-y-6">
                <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                    <TabList variant="solid" className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
                        <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-blue-800 ui-selected:text-white ui-selected:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5"/>
                                <span>الموردين</span>
                            </div>
                        </Tab>
                        <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-indigo-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5"/>
                                <span>العملاء (الزبائن)</span>
                            </div>
                        </Tab>
                    </TabList>

                    <div className="mt-8">
                        <AnimatePresence mode='wait'>
                            {selectedIndex === 0 && (
                                <motion.div 
                                    key="suppliers"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <SupplierList suppliers={suppliers} />
                                </motion.div>
                            )}
                            {selectedIndex === 1 && (
                                <motion.div 
                                    key="customers"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <CustomerList customers={customers} onUpdate={handleCustomerUpdate} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabGroup>
            </div>
        </div>
    );
}
