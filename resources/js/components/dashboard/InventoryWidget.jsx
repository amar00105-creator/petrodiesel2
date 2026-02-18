import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

export default function InventoryWidget({ type, current, capacity, color = 'emerald', isDark = true }) {
    const percentage = Math.min(100, Math.max(0, (current / capacity) * 100)) || 0;
    
    const colors = {
        emerald: {
            main: '#10b981', light: '#34d399', dark: '#059669',
            gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
            glow: 'rgba(16,185,129,0.4)',
        },
        blue: {
            main: '#3b82f6', light: '#60a5fa', dark: '#2563eb',
            gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            glow: 'rgba(59,130,246,0.4)',
        },
        amber: {
            main: '#f59e0b', light: '#fbbf24', dark: '#d97706',
            gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
            glow: 'rgba(245,158,11,0.4)',
        }
    };

    const theme = colors[color] || colors.emerald;

    // Determine warning level
    const isLow = percentage < 20;
    const isCritical = percentage < 10;

    return (
        <div className="relative group h-full min-h-[180px]">
            <div 
                className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:scale-[1.02]"
                style={{ 
                    background: isDark ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.8)',
                    border: `1px solid ${isDark ? theme.main + '30' : theme.main + '25'}`,
                    boxShadow: isDark 
                        ? `0 4px 24px -4px rgba(0,0,0,0.4), 0 0 0 1px ${theme.main}15`
                        : `0 4px 20px -4px rgba(0,0,0,0.08), 0 0 0 1px ${theme.main}15`,
                }}
            >
                {/* Header - with background for readability */}
                <div 
                    className="absolute top-0 left-0 right-0 z-30 p-4"
                    style={{
                        background: isDark
                            ? 'linear-gradient(to bottom, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.8) 60%, transparent 100%)'
                            : 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 60%, transparent 100%)',
                    }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div 
                                className="p-1.5 rounded-lg"
                                style={{ background: theme.gradient, boxShadow: `0 4px 12px -4px ${theme.glow}` }}
                            >
                                <Droplets className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 
                                    className="text-base font-black"
                                    style={{ 
                                        color: isDark ? '#f1f5f9' : '#1e293b',
                                        textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.8)' : 'none',
                                    }}
                                >
                                    {type}
                                </h3>
                            </div>
                        </div>
                        <div 
                            className="px-2.5 py-1 rounded-full text-xs font-black"
                            style={{ 
                                background: isCritical 
                                    ? 'rgba(239,68,68,0.2)' 
                                    : isLow 
                                        ? 'rgba(245,158,11,0.2)' 
                                        : `${theme.main}20`,
                                color: isCritical ? '#f87171' : isLow ? '#fbbf24' : (isDark ? theme.light : theme.dark),
                                border: `1px solid ${isCritical ? 'rgba(239,68,68,0.3)' : isLow ? 'rgba(245,158,11,0.3)' : theme.main + '30'}`,
                                textShadow: isDark ? `0 0 12px ${isCritical ? 'rgba(239,68,68,0.5)' : theme.glow}` : 'none',
                            }}
                        >
                            {percentage.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Center - Volume numbers */}
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div 
                            className="text-lg font-black font-mono"
                            style={{ 
                                color: isDark ? '#f8fafc' : '#1e293b',
                                textShadow: isDark
                                    ? `0 0 20px ${theme.glow}, 0 2px 10px rgba(0,0,0,0.8)`
                                    : `0 1px 3px rgba(255,255,255,0.9)`,
                            }}
                        >
                            {parseFloat(current).toLocaleString()}
                        </div>
                        <div 
                            className="text-[10px] font-bold"
                            style={{ 
                                color: isDark ? '#94a3b8' : '#64748b',
                                textShadow: isDark ? '0 2px 6px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)',
                            }}
                        >
                            من {parseFloat(capacity).toLocaleString()} لتر
                        </div>
                    </div>
                </div>

                {/* Liquid Wave Animation */}
                <div className="absolute inset-0 flex items-end justify-center">
                    <motion.div 
                        initial={{ height: '0%' }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-full relative"
                        style={{ 
                            background: isDark
                                ? `linear-gradient(to top, ${theme.dark}, ${theme.main}cc)`
                                : `linear-gradient(to top, ${theme.main}90, ${theme.light}70)`,
                            opacity: isDark ? 0.85 : 0.7,
                        }}
                    >
                        {/* Wave SVG */}
                        <div className="absolute -top-4 left-0 right-0 w-[200%] h-8 flex animate-wave">
                             <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                <path fill={theme.main} fillOpacity={isDark ? "0.8" : "0.5"} d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
                             </svg>
                             <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                                <path fill={theme.main} fillOpacity={isDark ? "0.8" : "0.5"} d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
                             </svg>
                        </div>
                        
                        {/* Depth effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </motion.div>
                </div>

                {/* Glass Overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none rounded-2xl z-10"
                    style={{
                        background: isDark
                            ? 'linear-gradient(to tr, transparent, rgba(255,255,255,0.03), rgba(255,255,255,0.08))'
                            : 'linear-gradient(to tr, transparent, rgba(255,255,255,0.15), rgba(255,255,255,0.3))',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)'}`,
                    }}
                />

                {/* Low fuel warning pulse */}
                {isLow && (
                    <motion.div 
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-2 left-0 right-0 z-30 text-center"
                    >
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ 
                                background: isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                                color: isCritical ? '#f87171' : '#fbbf24',
                            }}
                        >
                            {isCritical ? '⚠ مخزون حرج' : '⚠ مخزون منخفض'}
                        </span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
