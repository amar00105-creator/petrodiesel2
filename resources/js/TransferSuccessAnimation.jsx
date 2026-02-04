import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Droplet, ArrowLeft, X, Trash2 } from 'lucide-react';

const TransferSuccessAnimation = ({ isVisible, onComplete, mode = 'transfer' }) => {
    const [step, setStep] = useState('transferring'); // transferring, success

    useEffect(() => {
        if (isVisible) {
            setStep('transferring');
            // Show Success after 2s
            setTimeout(() => setStep('success'), 2000);
            
            // Finish after 4s total
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    const isDelete = mode === 'delete';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center"
                >
                    <div className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center max-w-sm w-full relative overflow-hidden">
                        
                        {/* Animation Area */}
                        <div className="h-32 w-full flex items-center justify-center relative mb-6">
                            
                            {/* Success State */}
                            <AnimatePresence>
                                {step === 'success' && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute inset-0 flex items-center justify-center z-20 bg-white"
                                    >
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDelete ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${isDelete ? 'bg-red-500 shadow-red-300' : 'bg-emerald-500 shadow-emerald-300'}`}>
                                                {isDelete ? (
                                                     <X className="w-8 h-8 text-white stroke-3" />
                                                ) : (
                                                     <Check className="w-8 h-8 text-white stroke-3" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Transfer Animation */}
                            <div className="flex items-center justify-between w-full px-4 relative">
                                {/* Source Tank */}
                                <div className="flex flex-col items-center z-10">
                                    <div className="w-12 h-16 bg-slate-100 border-2 border-slate-300 rounded-lg relative overflow-hidden">
                                        <motion.div 
                                            initial={{ height: '80%' }}
                                            animate={{ height: isDelete ? '0%' : '20%' }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            className="absolute bottom-0 w-full bg-amber-500 opacity-80"
                                        />
                                        {/* Cross Overlay for Delete Mode (enters at end of transfer) */}
                                        {isDelete && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: step === 'transferring' ? 0 : 1, scale: step === 'transferring' ? 0.5 : 1 }}
                                                transition={{ duration: 0.3, delay: 0.2 }}
                                                className="absolute inset-0 flex items-center justify-center bg-red-50/30 backdrop-blur-[1px]"
                                            >
                                                <X className="w-10 h-10 text-red-600 stroke-[3px]" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 mt-2">المصدر</span>
                                </div>

                                {/* Flow Path */}
                                <div className="flex-1 h-2 bg-slate-100 rounded-full mx-2 relative overflow-hidden">
                                     <motion.div 
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 1, repeat: 2, ease: "linear" }}
                                        className="absolute top-0 left-0 w-1/2 h-full bg-blue-400 blur-sm"
                                     />
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="p-2 bg-white rounded-full shadow-lg border border-slate-100">
                                        <ArrowLeft className="w-5 h-5 text-blue-500" />
                                    </div>
                                </div>

                                {/* Target Tank */}
                                <div className="flex flex-col items-center z-10">
                                    <div className="w-12 h-16 bg-slate-100 border-2 border-slate-300 rounded-lg relative overflow-hidden">
                                         <motion.div 
                                            initial={{ height: '20%' }}
                                            animate={{ height: '80%' }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                            className="absolute bottom-0 w-full bg-blue-500 opacity-80"
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 mt-2">المستقبل</span>
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="text-center z-20">
                            <motion.h3 
                                key={step}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`text-2xl font-black font-cairo ${step === 'success' && isDelete ? 'text-red-600' : 'text-slate-800'}`}
                            >
                                {step === 'transferring' ? 'جاري نقل الوقود...' : (isDelete ? 'تم النقل والحذف!' : 'تم النقل بنجاح!')}
                            </motion.h3>
                            <p className="text-slate-500 font-medium mt-2">
                                {step === 'transferring' ? 'يرجى الانتظار قليلاً' : (isDelete ? 'تم تفريغ وحذف الخزان المصدر' : 'تم تحديث الكميات في النظام')}
                            </p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 4, ease: "linear" }}
                                className={`h-full ${step === 'success' ? (isDelete ? 'bg-red-500' : 'bg-emerald-500') : 'bg-blue-500'}`}
                            />
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TransferSuccessAnimation;
