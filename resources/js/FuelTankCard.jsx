import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Ruler, Edit, Trash2, Fuel, Gauge } from 'lucide-react';

const FuelTankCard = ({ 
  tank, 
  onEdit, 
  onDelete, 
  onCalibrate,
  generalSettings = {},
  index = 0
}) => {
  const { name, product, percentage, total_cap, current } = tank;
  const mode = generalSettings.volume_display_mode || 'liters';

  // Dynamic color theming based on fuel type
  const getTheme = () => {
    const p = (product || '').toLowerCase();
    if (p.includes('diesel') || p.includes('ديزل') || p.includes('جاز') || p.includes('سولار')) {
      return {
        gradient: 'from-amber-500 to-orange-600',
        glow: 'rgba(245, 158, 11, 0.4)',
        wave: '#f59e0b',
        waveLight: '#fbbf24',
        accent: 'text-amber-400',
        accentBg: 'bg-amber-500/10 border-amber-500/20',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
        ring: 'ring-amber-500/20',
      };
    }
    if (p.includes('95') || p.includes('ممتاز') || p.includes('super')) {
      return {
        gradient: 'from-rose-500 to-pink-600',
        glow: 'rgba(244, 63, 94, 0.4)',
        wave: '#f43f5e',
        waveLight: '#fb7185',
        accent: 'text-rose-400',
        accentBg: 'bg-rose-500/10 border-rose-500/20',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
        ring: 'ring-rose-500/20',
      };
    }
    if (p.includes('91') || p.includes('عادي')) {
      return {
        gradient: 'from-emerald-500 to-teal-600',
        glow: 'rgba(16, 185, 129, 0.4)',
        wave: '#10b981',
        waveLight: '#34d399',
        accent: 'text-emerald-400',
        accentBg: 'bg-emerald-500/10 border-emerald-500/20',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        ring: 'ring-emerald-500/20',
      };
    }
    if (p.includes('غاز') || p.includes('gas') || p.includes('سودا')) {
      return {
        gradient: 'from-violet-500 to-purple-600',
        glow: 'rgba(139, 92, 246, 0.4)',
        wave: '#8b5cf6',
        waveLight: '#a78bfa',
        accent: 'text-violet-400',
        accentBg: 'bg-violet-500/10 border-violet-500/20',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
        ring: 'ring-violet-500/20',
      };
    }
    // Default: Blue
    return {
      gradient: 'from-blue-500 to-cyan-600',
      glow: 'rgba(59, 130, 246, 0.4)',
      wave: '#3b82f6',
      waveLight: '#60a5fa',
      accent: 'text-blue-400',
      accentBg: 'bg-blue-500/10 border-blue-500/20',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      ring: 'ring-blue-500/20',
    };
  };

  const theme = getTheme();

  // Status
  const isLow = percentage < 20;
  const isCritical = percentage < 10;

  // Numeric formatters
  const fmtLiters = (v) => parseFloat(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const fmtGallons = (v) => (v / 4.5).toLocaleString(undefined, { maximumFractionDigits: 0 });

  // Wave SVG for liquid surface
  const WaveSurface = () => (
    <svg className="absolute top-0 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" style={{ height: '12px', transform: 'translateY(-6px)' }}>
      <motion.path
        d="M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z"
        fill={theme.wave}
        initial={{ d: "M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z" }}
        animate={{ 
          d: [
            "M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z",
            "M0 6 Q25 12 50 6 T100 6 T150 6 T200 6 V12 H0 Z",
            "M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        opacity={0.8}
      />
      <motion.path
        d="M0 6 Q25 12 50 6 T100 6 T150 6 T200 6 V12 H0 Z"
        fill={theme.waveLight}
        initial={{ d: "M0 6 Q25 12 50 6 T100 6 T150 6 T200 6 V12 H0 Z" }}
        animate={{ 
          d: [
            "M0 6 Q25 12 50 6 T100 6 T150 6 T200 6 V12 H0 Z",
            "M0 6 Q25 0 50 6 T100 6 T150 6 T200 6 V12 H0 Z",
            "M0 6 Q25 12 50 6 T100 6 T150 6 T200 6 V12 H0 Z"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        opacity={0.3}
      />
    </svg>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl overflow-hidden ring-1 ${theme.ring} group`}
      style={{
        background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px -4px rgba(0,0,0,0.3), 0 0 20px -5px ${theme.glow}, 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Glassmorphism colored border overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ 
        background: `linear-gradient(135deg, ${theme.wave}22 0%, transparent 40%, transparent 60%, ${theme.wave}15 100%)`,
        border: `1px solid ${theme.wave}30`,
      }} />
      {/* Glassmorphism light overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full" style={{ minHeight: '320px' }}>
        
        {/* === TOP: Tank Name + Product Badge === */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`p-2 rounded-xl ${theme.accentBg} border backdrop-blur-sm shrink-0`}>
              <Droplet className={`w-4 h-4 ${theme.accent}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm leading-tight truncate">{name}</h3>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${theme.badge} border mt-0.5`}>
                {product}
              </span>
            </div>
          </div>

          {/* Percentage Badge (small, top-right) */}
          <div className={`shrink-0 px-3 py-1.5 rounded-xl text-base font-black ${
            isCritical ? 'bg-red-500/25 text-red-300 border border-red-500/40' :
            isLow ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
            'bg-white/15 text-white border border-white/20'
          }`}>
            {percentage}%
          </div>
        </div>

        {/* === CENTER: Tank Visual with Fuel Level === */}
        <div className="flex-1 flex items-center justify-center px-4 py-2">
          <div className="relative w-full max-w-[112px] mx-auto" style={{ aspectRatio: '1/1.3' }}>

            {/* Tank body */}
            <div 
              className="absolute inset-0 rounded-2xl border-2 border-white/15 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
                boxShadow: `inset 0 0 30px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {/* Ruler/gauge marks on the side */}
              <div className="absolute left-1.5 top-2 bottom-2 w-px flex flex-col justify-between pointer-events-none z-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-px bg-white/30" />
                  </div>
                ))}
              </div>

              {/* Liquid fill */}
              <motion.div
                className="absolute bottom-0 left-0 w-full"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(2, percentage)}%` }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 + 0.2 }}
                style={{ 
                  background: `linear-gradient(180deg, ${theme.waveLight}cc, ${theme.wave})`,
                }}
              >
                {/* Wave on top */}
                <WaveSurface />
                
                {/* Shimmer effect inside liquid */}
                <motion.div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`,
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['200% 200%', '-200% -200%'],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Bubble particles */}
                {percentage > 5 && (
                  <>
                    <motion.div
                      className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
                      style={{ left: '30%', bottom: '20%' }}
                      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.div
                      className="absolute w-1 h-1 rounded-full bg-white/20"
                      style={{ left: '60%', bottom: '40%' }}
                      animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
                    />
                    <motion.div
                      className="absolute w-0.5 h-0.5 rounded-full bg-white/25"
                      style={{ left: '45%', bottom: '10%' }}
                      animate={{ y: [0, -25, 0], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                    />
                  </>
                )}
              </motion.div>

              {/* Glass reflection overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
                }}
              />
            </div>

            {/* Tank cap/top */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 rounded-t-lg bg-white/10 border border-white/10 border-b-0" />
          </div>
        </div>

        {/* === VOLUME INFO (Table layout) === */}
        <div className="px-4 pb-2">
          <div className="bg-white/[0.07] rounded-xl p-3 border border-white/[0.1] backdrop-blur-sm">
            {/* Column headers - centered above number columns */}
            <div className="flex items-center mb-2">
              <span className="shrink-0" style={{ width: '72px' }}></span>
              <div className="flex-1 flex">
                {(mode === 'both' || mode === 'gallons') && (
                  <span className="flex-1 text-xs text-lime-400 font-bold text-center border-b border-lime-500/20 pb-1">جالون</span>
                )}
                {(mode === 'both' || mode === 'liters') && (
                  <span className="flex-1 text-xs text-blue-400 font-bold text-center border-b border-blue-500/20 pb-1">لتر</span>
                )}
              </div>
            </div>

            {/* Current Volume Row */}
            <div className="flex items-center py-1.5">
              <span className="shrink-0 text-[11px] text-cyan-300 font-bold whitespace-nowrap" style={{ width: '72px' }}>الكمية الحالية</span>
              <div className="flex-1 flex">
                {(mode === 'both' || mode === 'gallons') && (
                  <span className={`flex-1 text-xl font-black text-center ${isCritical ? 'text-red-300' : isLow ? 'text-amber-300' : 'text-white'}`}>
                    {fmtGallons(current)}
                  </span>
                )}
                {(mode === 'both' || mode === 'liters') && (
                  <span className={`flex-1 text-xl font-black text-center ${isCritical ? 'text-red-300' : isLow ? 'text-amber-300' : 'text-white'}`}>
                    {fmtLiters(current)}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.1] my-0.5" />

            {/* Capacity Row */}
            <div className="flex items-center py-1.5">
              <span className="shrink-0 text-[11px] text-slate-200 font-medium whitespace-nowrap" style={{ width: '72px' }}>السعة الكلية</span>
              <div className="flex-1 flex">
                {(mode === 'both' || mode === 'gallons') && (
                  <span className="flex-1 text-xl font-black text-white/90 text-center">{fmtGallons(total_cap)}</span>
                )}
                {(mode === 'both' || mode === 'liters') && (
                  <span className="flex-1 text-xl font-black text-white/90 text-center">{fmtLiters(total_cap)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === BOTTOM: Actions Bar === */}
        <div className="px-4 pb-3 pt-1 flex items-center justify-center gap-1.5">
          <button 
            onClick={onCalibrate}
            className="flex-[1.4] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all duration-300 active:scale-95 hover:scale-[1.03] hover:-translate-y-0.5"
            title="معايرة"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #7c3aed)',
              boxShadow: '0 4px 15px -3px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>معايرة</span>
          </button>
          {onEdit && (
          <button 
            onClick={onEdit}
            className="flex-[0.6] flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all duration-300 active:scale-95 hover:scale-[1.03] hover:-translate-y-0.5"
            title="تعديل"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #2563eb)',
              boxShadow: '0 4px 15px -3px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          )}
          {onDelete && (
          <button 
            onClick={onDelete}
            className="py-2.5 px-3 rounded-xl text-[11px] font-bold text-white transition-all duration-300 active:scale-95 hover:scale-[1.03] hover:-translate-y-0.5"
            title="حذف"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #f87171, #dc2626)',
              boxShadow: '0 4px 15px -3px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          )}
        </div>

      </div>

      {/* Ambient glow at bottom */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.glow }}
        initial={{ opacity: 0 }}
        animate={{ opacity: percentage > 10 ? 0.15 : 0.05 }}
        transition={{ duration: 1, delay: index * 0.08 + 0.5 }}
      />
    </motion.div>
  );
};

export default FuelTankCard;
