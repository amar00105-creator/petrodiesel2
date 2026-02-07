import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Truck, Banknote, Clock, ArrowRight, Fuel, FileText } from 'lucide-react';

export default function QuickActions() {
    
    // In a real app, these would be Links or useNavigate
    const actions = [
        { 
            label: 'عملية بيع جديدة', 
            icon: Plus, 
            color: 'bg-emerald-500', 
            hover: 'hover:bg-emerald-600',
            link: '/sales/create',
            desc: 'تسجيل بيع وقود'
        },
        { 
            label: 'استلام وقود', 
            icon: Truck, 
            color: 'bg-blue-500', 
            hover: 'hover:bg-blue-600',
            link: '/purchases/create',
            desc: 'إضافة مخزون جديد'
        },
        { 
            label: 'تسجيل مصروف', 
            icon: Banknote, 
            color: 'bg-red-500', 
            hover: 'hover:bg-red-600',
            link: '/expenses/create',
            desc: 'صرف نثريات'
        },
        { 
            label: 'إغلاق الوردية', 
            icon: Clock, 
            color: 'bg-navy-900', 
            hover: 'hover:bg-navy-800',
            link: '/shift/close',
            desc: 'تقرير نهاية اليوم'
        },
        { 
            label: 'مبيعات الآبار', 
            icon: Fuel, 
            color: 'bg-orange-500', 
            hover: 'hover:bg-orange-600',
            link: '/reports?tab=sales&subtab=tank_sales',
            desc: 'تقرير تفصيلي للمبيعات'
        },
        { 
            label: 'كشف حساب', 
            icon: FileText, 
            color: 'bg-indigo-500', 
            hover: 'hover:bg-indigo-600',
            link: '/reports?tab=financial&subtab=statement',
            desc: 'خزنة / بنك'
        }
    ];

    const handleNavigation = (url) => {
        window.location.href = window.BASE_URL ? window.BASE_URL + url : url;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <motion.button
                    key={index}
                    onClick={() => handleNavigation(action.link)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                        relative group overflow-hidden rounded-2xl p-1 text-right w-full
                        bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700
                    `}
                >   
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50 dark:to-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-4 p-4 relative z-10">
                        <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg shadow-${action.color}/30 transform group-hover:rotate-6 transition-transform`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{action.label}</h3>
                            <p className="text-xs text-slate-400 mt-1">{action.desc}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
                             <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </motion.button>
            ))}
        </div>
    );
}
