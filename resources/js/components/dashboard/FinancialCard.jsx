import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function FinancialCard({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = 'emerald',
    delay = 0 
}) {
    const colors = {
        emerald: {
            text: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            icon: 'text-emerald-500',
            border: 'border-emerald-100 dark:border-emerald-500/20'
        },
        red: {
            text: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-500/10',
            icon: 'text-red-500',
            border: 'border-red-100 dark:border-red-500/20'
        },
        blue: {
            text: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            icon: 'text-blue-500',
            border: 'border-blue-100 dark:border-blue-500/20'
        },
        amber: {
            text: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            icon: 'text-amber-500',
            border: 'border-amber-100 dark:border-amber-500/20'
        },
         slate: {
            text: 'text-slate-600 dark:text-slate-400',
            bg: 'bg-slate-50 dark:bg-slate-500/10',
            icon: 'text-slate-500',
            border: 'border-slate-100 dark:border-slate-500/20'
        }
    };

    const theme = colors[color] || colors.emerald;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5 }}
            className={`
                relative overflow-hidden rounded-2xl p-6
                bg-white dark:bg-slate-800
                border ${theme.border}
                shadow-sm hover:shadow-md transition-all duration-300
                group
            `}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                    <h3 className={`text-2xl font-bold font-mono ${theme.text}`}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${theme.bg} ${theme.icon} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {trend && (
                <div className={`mt-4 flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{Math.abs(trend)}%</span>
                    <span className="text-slate-400 font-normal ml-1">من الأمس</span>
                </div>
            )}
        </motion.div>
    );
}
