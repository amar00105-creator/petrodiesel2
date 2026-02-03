import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="relative w-16 h-16">
                <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-slate-200" 
                />
                <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <p className="text-slate-500 font-medium animate-pulse">جاري التحميل...</p>
        </div>
    );
}
