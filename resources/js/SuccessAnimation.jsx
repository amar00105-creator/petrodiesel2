import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

/**
 * Success Animation Component
 * Shows a beautiful centered success message with confetti-like animation
 */
const SuccessAnimation = ({ isVisible, message, onComplete }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (isVisible) {
            // Generate confetti particles
            const newParticles = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                x: Math.random() * 100 - 50,
                y: Math.random() * -100 - 50,
                rotation: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5,
                color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
            }));
            setParticles(newParticles);

            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex items-center justify-center"
                    >
                        {/* Success Card */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ 
                                scale: 1, 
                                rotate: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20
                                }
                            }}
                            exit={{ 
                                scale: 0, 
                                rotate: 180,
                                transition: { duration: 0.3 }
                            }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 relative overflow-hidden"
                        >
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 opacity-50" />
                            
                            {/* Content */}
                            <div className="relative z-10 text-center">
                                {/* Animated Check Circle */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ 
                                        scale: [0, 1.2, 1],
                                        rotate: [0, 10, -10, 0]
                                    }}
                                    transition={{ 
                                        delay: 0.2,
                                        duration: 0.6,
                                        times: [0, 0.6, 0.8, 1]
                                    }}
                                    className="inline-block mb-4"
                                >
                                    <div className="relative">
                                        {/* Pulse rings */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 2, 2],
                                                opacity: [0.5, 0.3, 0]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeOut"
                                            }}
                                            className="absolute inset-0 rounded-full bg-green-500"
                                        />
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.8, 1.8],
                                                opacity: [0.5, 0.3, 0]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeOut",
                                                delay: 0.3
                                            }}
                                            className="absolute inset-0 rounded-full bg-green-500"
                                        />
                                        
                                        {/* Check icon */}
                                        <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" strokeWidth={2} />
                                    </div>
                                </motion.div>

                                {/* Message */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl font-bold text-slate-800 mb-2"
                                >
                                    نجح! 🎉
                                </motion.h2>
                                
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg text-slate-600"
                                >
                                    {message || 'تمت العملية بنجاح'}
                                </motion.p>
                            </div>
                        </motion.div>

                        {/* Confetti Particles */}
                        {particles.map((particle) => (
                            <motion.div
                                key={particle.id}
                                initial={{ 
                                    x: '50vw',
                                    y: '50vh',
                                    scale: 0,
                                    rotate: 0
                                }}
                                animate={{
                                    x: `calc(50vw + ${particle.x}vw)`,
                                    y: `calc(50vh + ${particle.y}vh)`,
                                    scale: [0, particle.scale, 0],
                                    rotate: particle.rotation,
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeOut",
                                    delay: Math.random() * 0.3
                                }}
                                className="absolute w-3 h-3 rounded-full"
                                style={{ backgroundColor: particle.color }}
                            />
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SuccessAnimation;
