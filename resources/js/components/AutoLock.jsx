import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AutoLock() {
    const [isLocked, setIsLocked] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    
    // Read timeout from global config (in minutes)
    const timeoutMinutes = window.AUTO_LOCK_MINUTES || 0;
    const timeoutEncoded = parseInt(timeoutMinutes, 10);
    
    // Convert to milliseconds
    const TIMEOUT_MS = timeoutEncoded * 60 * 1000;
    
    const activityRef = useRef(Date.now());
    const intervalRef = useRef(null);

    // Activity Listener
    useEffect(() => {
        if (TIMEOUT_MS <= 0) return; // Disabled

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        
        const resetTimer = () => {
            activityRef.current = Date.now();
        };

        events.forEach(event => document.addEventListener(event, resetTimer));

        // Start checking loop
        intervalRef.current = setInterval(() => {
            if (isLocked) return;

            if (Date.now() - activityRef.current > TIMEOUT_MS) {
                lockScreen();
            }
        }, 5000); // Check every 5 seconds

        return () => {
            events.forEach(event => document.removeEventListener(event, resetTimer));
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [TIMEOUT_MS, isLocked]);

    const lockScreen = () => {
        setIsLocked(true);
        // Clear any sensitive data from view if possible? No, overlay is enough.
        // We could blur the background effectively with CSS.
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setError('');
        setVerifying(true);

        try {
            const formData = new FormData();
            formData.append('password', password);

            const res = await fetch(`${window.BASE_URL}/auth/verify_password`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setIsLocked(false);
                setPassword('');
                activityRef.current = Date.now();
            } else {
                setError('كلمة المرور غير صحيحة');
                toast.error('كلمة المرور غير صحيحة');
            }
        } catch (err) {
            console.error(err);
            setError('خطأ في الاتصال');
        } finally {
            setVerifying(false);
        }
    };

    if (!isLocked) return null;

    return (
        <AnimatePresence>
            {isLocked && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }} 
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center backdrop-blur-xl"
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                            <Lock className="w-10 h-10 text-white" />
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-2">النظام مقفل</h2>
                        <p className="text-slate-300 mb-8">الرجاء إدخال كلمة المرور للمتابعة</p>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="كلمة المرور"
                                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-lg tracking-widest transition-all"
                                    autoFocus
                                />
                            </div>
                            
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm font-bold">
                                    {error}
                                </motion.div>
                            )}

                            <button 
                                type="submit" 
                                disabled={verifying}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {verifying ? 'جاري التحقق...' : <>فتح القفل <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
