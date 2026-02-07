import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabGroup, TabList, Tab, Title, Text } from '@tremor/react';
import { Users, HardHat, Truck, Wallet, Search, Plus } from 'lucide-react';

import WorkerList from './WorkerList';
import EmployeeList from './EmployeeList';
import DriverList from './DriverList';
import Payroll from './Payroll';

export default function HumanResources(props) {
    // Props contain the initial data loaded from PHP view
    const { workers = [], employees = [], drivers = [] } = props;
    
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [search, setSearch] = useState('');

    const employeeRef = useRef(null);
    const workerRef = useRef(null);
    const driverRef = useRef(null);

    const handleAddClick = () => {
        if (selectedIndex === 0 && employeeRef.current) {
            employeeRef.current.openAddModal();
        } else if (selectedIndex === 1 && workerRef.current) {
            workerRef.current.openAddModal();
        } else if (selectedIndex === 2 && driverRef.current) {
            driverRef.current.openAddModal();
        }
    };

    return (
        <div className="p-6 max-w-[1800px] mx-auto space-y-8 animate-fade-in dark:bg-[#0F172A] min-h-screen">

            {/* Title and Subtitle removed as requested */}

            {/* Unified Controls & Tabs */}
            <div className="space-y-6">
                <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        <TabList variant="solid" className="bg-white dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 p-1 rounded-2xl shadow-sm border border-slate-100 w-full xl:w-auto overflow-x-auto">
                            <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 ui-selected:bg-indigo-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5"/>
                                    <span>الموظفين</span>
                                </div>
                            </Tab>
                            <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 ui-selected:bg-blue-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <HardHat className="w-5 h-5"/>
                                    <span>العمال</span>
                                </div>
                            </Tab>
                            <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 ui-selected:bg-emerald-600 ui-selected:text-white ui-selected:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-5 h-5"/>
                                    <span>السائقين</span>
                                </div>
                            </Tab>
                            <Tab className="px-6 py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 ui-selected:bg-amber-500 ui-selected:text-white ui-selected:shadow-md transition-all">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5"/>
                                    <span>الرواتب</span>
                                </div>
                            </Tab>
                        </TabList>

                        <div className="flex items-center gap-3 w-full xl:w-auto">
                            <div className="relative flex-1 xl:w-80">
                                <Search className="absolute right-3 top-2.5 text-slate-400 w-5 h-5 dark:text-slate-500"/>
                                <input 
                                    type="text"
                                    placeholder={
                                        selectedIndex === 0 ? "بحث في الموظفين..." :
                                        selectedIndex === 1 ? "بحث في العمال..." :
                                        selectedIndex === 2 ? "بحث في السائقين..." : 
                                        "بحث في السجلات..."
                                    }
                                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm placeholder:dark:text-slate-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            
                            {selectedIndex !== 3 && (
                                <button 
                                    onClick={handleAddClick}
                                    className={`
                                        px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 whitespace-nowrap
                                        ${selectedIndex === 0 ? 'bg-navy-900 hover:bg-navy-800 dark:bg-indigo-600 dark:hover:bg-indigo-700' : 
                                          selectedIndex === 1 ? 'bg-blue-600 hover:bg-blue-700' : 
                                          'bg-emerald-600 hover:bg-emerald-700'}
                                    `}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>إضافة {
                                        selectedIndex === 0 ? 'موظف' :
                                        selectedIndex === 1 ? 'عامل' : 'سائق'
                                    }</span>
                                </button>
                            )}
                        </div>
                    </div>

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
                                    <EmployeeList ref={employeeRef} employees={employees} search={search} />
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
                                    <WorkerList ref={workerRef} workers={workers} search={search} />
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
                                    <DriverList ref={driverRef} drivers={drivers} search={search} />
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
                                    <Payroll employees={employees} workers={workers} drivers={drivers} search={search} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabGroup>
            </div>
        </div>
    );
}
