import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Success Animation Component
 * Shows a professional, sleek success message with a drawing checkmark
 */
const SuccessAnimation = ({ isVisible, message, onComplete }) => {

    useEffect(() => {
        if (isVisible) {
            // Auto-hide after 2.5 seconds
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center transition-colors"
                    >
                        {/* Success Card */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ 
                                scale: 1, 
                                opacity: 1, 
                                y: 0,
                                transition: { type: "spring", damping: 25, stiffness: 300 }
                            }}
                            exit={{ 
                                scale: 0.95, 
                                opacity: 0,
                                transition: { duration: 0.2 }
                            }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 relative overflow-hidden text-center"
                        >
                            {/* Icon Container */}
                            <div className="relative flex justify-center items-center mb-6">
                                {/* Pulse Effect */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ 
                                        scale: [1, 1.5],
                                        opacity: [0.5, 0]
                                    }}
                                    transition={{ 
                                        duration: 1.5, 
                                        repeat: Infinity,
                                        ease: "easeOut" 
                                    }}
                                    className="absolute w-20 h-20 bg-emerald-100 rounded-full"
                                />
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ 
                                        scale: [1, 1.2],
                                        opacity: [0.8, 0]
                                    }}
                                    transition={{ 
                                        duration: 1.5, 
                                        repeat: Infinity, 
                                        ease: "easeOut",
                                        delay: 0.2
                                    }}
                                    className="absolute w-20 h-20 bg-emerald-200 rounded-full"
                                />
                                
                                {/* Circle Background */}
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-lg shadow-emerald-200"
                                >
                                    {/* Drawing Checkmark */}
                                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <motion.path
                                            d="M20 6L9 17l-5-5"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                        />
                                    </svg>
                                </motion.div>
                            </div>

                            {/* Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-2xl font-black text-slate-800 mb-2 font-cairo">
                                    تم بنجاح
                                </h2>
                                <p className="text-slate-500 font-medium text-lg">
                                    {message || 'تمت العملية بنجاح'}
                                </p>
                            </motion.div>

                            {/* Progress Line */}
                            <motion.div 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 2.5, ease: "linear" }}
                                className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full origin-left"
                            />
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SuccessAnimation;
