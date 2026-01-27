import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabGroup, TabList, Tab, Title, Text } from '@tremor/react';
import { Users, HardHat, Truck, Wallet } from 'lucide-react';

import WorkerList from './WorkerList';
import EmployeeList from './EmployeeList';
import DriverList from './DriverList';
import Payroll from './Payroll';

export default function HumanResources(props) {
    // Props contain the initial data loaded from PHP view
    const { workers = [], employees = [], drivers = [] } = props;
    
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <div className="p-6 max-w-[1800px] mx-auto space-y-8 animate-fade-in">


            {/* Tabs Navigation */}
            <div className="space-y-6">
                <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                    <TabList variant="solid" className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
                        <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-indigo-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5"/>
                                <span>الموظفين</span>
                            </div>
                        </Tab>
                        <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-blue-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <HardHat className="w-5 h-5"/>
                                <span>العمال</span>
                            </div>
                        </Tab>
                        <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-emerald-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <Truck className="w-5 h-5"/>
                                <span>السائقين</span>
                            </div>
                        </Tab>
                        <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 ui-selected:bg-amber-500 ui-selected:text-white ui-selected:shadow-md transition-all">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5"/>
                                <span>الرواتب</span>
                            </div>
                        </Tab>
                    </TabList>

                    <div className="mt-8">
                        <AnimatePresence mode='wait'>
                            {selectedIndex === 0 && (
                                <motion.div 
                                    key="employees"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <EmployeeList employees={employees} />
                                </motion.div>
                            )}
                            {selectedIndex === 1 && (
                                <motion.div 
                                    key="workers"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <WorkerList workers={workers} />
                                </motion.div>
                            )}
                            {selectedIndex === 2 && (
                                <motion.div 
                                    key="drivers"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <DriverList drivers={drivers} />
                                </motion.div>
                            )}
                            {selectedIndex === 3 && (
                                <motion.div 
                                    key="payroll"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Payroll employees={employees} workers={workers} drivers={drivers} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabGroup>
            </div>
        </div>
    );
}
