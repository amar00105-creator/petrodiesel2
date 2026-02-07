import React from 'react';
import { motion } from 'framer-motion';

export default function InventoryWidget({ type, current, capacity, color = 'emerald' }) {
    const percentage = Math.min(100, Math.max(0, (current / capacity) * 100)) || 0;
    
    const colors = {
        emerald: {
            bg: 'bg-emerald-500',
            light: 'bg-emerald-400',
            dark: 'bg-emerald-600',
            gradient: 'from-emerald-500 to-emerald-600',
            text: 'text-emerald-500'
        },
        blue: {
            bg: 'bg-blue-500',
            light: 'bg-blue-400',
            dark: 'bg-blue-600',
            gradient: 'from-blue-500 to-blue-600',
            text: 'text-blue-500'
        },
        amber: {
            bg: 'bg-amber-500',
            light: 'bg-amber-400',
            dark: 'bg-amber-600',
            gradient: 'from-amber-500 to-amber-600',
            text: 'text-amber-500'
        }
    };

    const theme = colors[color] || colors.emerald;

    return (
        <div className="relative group perspective-1000 h-full min-h-[180px]">
            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 transform group-hover:scale-[1.02]">
                
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{type}</h3>
                        <p className="text-sm text-slate-400 font-mono mt-1">
                            {parseFloat(current).toLocaleString()} / {parseFloat(capacity).toLocaleString()} L
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${theme.bg} bg-opacity-10 ${theme.text}`}>
                        {percentage.toFixed(1)}%
                    </div>
                </div>

                {/* 3D Tank Content */}
                <div className="absolute inset-0 flex items-end justify-center">
                    
                    {/* Liquid Wave Animation */}
                    <motion.div 
                        initial={{ height: '0%' }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`w-full relative ${theme.bg} opacity-90`}
                    >
                        {/* Wave SVG */}
                        <div className="absolute -top-4 left-0 right-0 w-[200%] h-8 flex animate-wave">
                             <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                <path fill="currentColor" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z" className={theme.text}></path>
                             </svg>
                             <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                <path fill="currentColor" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z" className={theme.text}></path>
                             </svg>
                        </div>
                        
                        {/* Bubbles */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </motion.div>
                </div>

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none rounded-3xl z-10 box-border border-2 border-white/20"></div>
            </div>
        </div>
    );
}
