import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    Wallet, 
    DollarSign,
    Fuel,
    Activity,
    Plus, 
    Truck, 
    Banknote, 
    Clock, 
    ArrowRight,
    FileText
} from 'lucide-react';
import { useTheme } from './components/ThemeProvider';
import InventoryWidget from './components/dashboard/InventoryWidget';
import FinancialCard from './components/dashboard/FinancialCard';
import AddTransactionModal from './AddTransactionModal'; // Check path if needed, assuming same dir or one level up? 
// Wait, AddTransactionModal is likely in components or root resources/js. 
// Based on AccountingDashboard.jsx: import AddTransactionModal from './AddTransactionModal'; 
// So it is in resources/js/AddTransactionModal.jsx

export default function Dashboard({ data, categories, safes, banks, suppliers, customers }) {
    const [activeModal, setActiveModal] = useState(null);
    const safeData = data || {};
    
    const stock = {
        petrol: safeData.petrolStock || { current: 0, capacity: 10000 },
        diesel: safeData.dieselStock || { current: 0, capacity: 10000 },
        gas: safeData.gasStock || { current: 0, capacity: 0 }
    };

    return (
        // Ultra-compact: h-screen, p-3 padding, overflow-hidden on body
        // pb-10 to leave that "small space at the bottom" the user asked for
        <div className="h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 p-3 pb-8 overflow-hidden flex flex-col">
            
            <div className="max-w-[1920px] mx-auto w-full h-full flex flex-col">
                
                {/* Main Grid: Reduced gap from 6 to 4 for compactness */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start h-full">
                    
                    {/* 1. RIGHT SIDEBAR (Operations & Inventory) */}
                    <div className="xl:col-span-3 space-y-3 h-full flex flex-col">
                        
                        {/* A. Quick Actions (Grid 2x2) - Compact padding */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" />
                                عمليات سريعة
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <QuickActionItem label="بيع جديد" icon={Plus} color="bg-emerald-500" link="/sales/create" />
                                <QuickActionItem label="استلام" icon={Truck} color="bg-blue-500" link="/purchases/create" />
                                <QuickActionItem 
                                    label="مصروف" 
                                    icon={Banknote} 
                                    color="bg-red-500" 
                                    onClick={() => setActiveModal('expense')} 
                                />
                                <QuickActionItem label="إغلاق" icon={Clock} color="bg-navy-900" link="/shift/close" />
                                <QuickActionItem label="مبيعات الآبار" icon={Fuel} color="bg-orange-500" link="/reports?tab=sales&subtab=tank_sales" />
                                <QuickActionItem label="كشف حساب" icon={FileText} color="bg-indigo-500" link="/reports?tab=financial&subtab=statement&group=fuel_type" />
                             </div>
                        </div>

                        {/* B. Inventory Widgets - Reduced Height (approx 25% of view or fixed compact) */}
                         <div className="grid grid-cols-2 xl:grid-cols-2 gap-3 h-[25vh] min-h-[180px] shrink-0">
                            <div className="h-full">
                                <InventoryWidget 
                                    type="بنزين" 
                                    current={stock.petrol.current} 
                                    capacity={stock.petrol.capacity} 
                                    color="emerald"
                                />
                            </div>
                            <div className="h-full">
                                <InventoryWidget 
                                    type="ديزل" 
                                    current={stock.diesel.current} 
                                    capacity={stock.diesel.capacity} 
                                    color="blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. LEFT CONTENT (Financials & Compact Table) */}
                    <div className="xl:col-span-9 space-y-3 h-full flex flex-col">
                        
                        {/* Financial Cards - Reduced height/gap */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                            <FinancialCard 
                                title="مبيعات اليوم"
                                value={parseFloat(safeData.todaySales || 0).toLocaleString('en-US')}
                                subtitle="إجمالي مبيعات الوردية"
                                icon={TrendingUp}
                                color="emerald"
                                trend={5.2}
                                minimal={true} 
                            />
                            <FinancialCard 
                                title="المصروفات"
                                value={parseFloat(safeData.todayExpenses || 0).toLocaleString('en-US')}
                                subtitle="نثريات وتشغيل"
                                icon={Wallet}
                                color="red"
                                minimal={true}
                            />
                             <FinancialCard 
                                title="رصيد الخزينة"
                                value={parseFloat(safeData.safeBalance || 0).toLocaleString('en-US')}
                                subtitle="النقدية الحالية"
                                icon={DollarSign}
                                color="amber"
                                minimal={true}
                            />
                        </div>

                        {/* Recent Transactions Table */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0"
                        >
                            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 dark:text-white">سجل العمليات الحديثة</h3>
                                    <p className="text-[10px] text-slate-500">آخر المعاملات المسجلة في النظام</p>
                                </div>
                                <button className="text-[10px] font-medium text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors">
                                    عرض الكل
                                </button>
                            </div>
                            <div className="overflow-auto scrollbar-thin flex-1">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-bold sticky top-0 z-10 text-xs">
                                        <tr>
                                            <th className="p-3 w-[15%]">الوقت</th>
                                            <th className="p-3 w-[15%]">النوع</th>
                                            <th className="p-3 w-[25%]">الموظف</th>
                                            <th className="p-3 w-[25%]">التفاصيل</th>
                                            <th className="p-3 w-[20%] text-left">المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                                        {/* Reduced count to 10 as requested */}
                                        {safeData.recentSales && safeData.recentSales.slice(0, 10).map((sale, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group text-xs sm:text-sm">
                                                <td className="p-3 font-mono text-slate-400">{sale.time}</td>
                                                <td className="p-3">
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                                        <Fuel className="w-3 h-3" /> بيع
                                                    </span>
                                                </td>
                                                <td className="p-3 font-medium truncate max-w-[120px]">{sale.worker_name}</td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                                                    {sale.pump_name} <span className="opacity-50">|</span> {parseFloat(sale.volume_sold).toFixed(2)}L
                                                </td>
                                                <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 dir-ltr text-left">
                                                    {parseFloat(sale.total_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                         {(!safeData.recentSales || safeData.recentSales.length === 0) && (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                                                    لا توجد عمليات مسجلة
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            {/* Modal */}
            <AddTransactionModal 
                isOpen={activeModal === 'expense'}
                onClose={() => setActiveModal(null)}
                type={'expense'}
                categories={categories || []}
                safes={safes || []}
                banks={banks || []}
                suppliers={suppliers || []}
                customers={customers || []}
                baseUrl={window.BASE_URL}
            />
        </div>
    );
}

// Ultra Compact Quick Action Item
function QuickActionItem({ label, icon: Icon, color, link, onClick }) {
    return (
        <motion.button
            onClick={() => onClick ? onClick() : (window.location.href = window.BASE_URL ? window.BASE_URL + link : link)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all group h-[70px]"
        >
            <div className={`p-1.5 rounded-lg ${color} text-white shadow-sm`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs">{label}</span>
        </motion.button>
    );
}
