import React from 'react';
import { motion } from 'framer-motion';
import { Fuel } from 'lucide-react';

const FuelPumpCard = ({ 
  pumpName = "مضخة رقم 1",
  fuelType = "ديزل ممتاز",
  counters = [],
  sourceWell = "البير رقم 3",
  onEdit,
  onDelete
}) => {

  // Color Theme Logic
  const isDiesel = fuelType && (fuelType.includes('ديزل') || fuelType.includes('Diesel') || fuelType.includes('جاز'));
  
  const theme = isDiesel ? {
     primary: "blue",
     border: "border-blue-500/20",
     shadow: "rgba(59, 130, 246, 0.5)",
     gradient: "from-blue-600 to-cyan-600",
     text: "text-blue-400"
  } : {
     primary: "orange",
     border: "border-orange-500/20",
     shadow: "rgba(249, 115, 22, 0.5)", 
     gradient: "from-orange-600 to-amber-600",
     text: "text-orange-400"
  };

  const neonPulse = {
    initial: { opacity: 0.6, shadowBlur: "10px" },
    animate: { 
      opacity: [0.6, 1, 0.6], 
      boxShadow: [
        `0 0 10px ${theme.shadow}`, 
        `0 0 20px ${theme.shadow}`, 
        `0 0 10px ${theme.shadow}`
      ] 
    },
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      // Increased height by ~10% (h-80 -> h-[22rem] or h-96)
      className={`relative w-full h-[24rem] p-4 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl flex flex-col justify-between overflow-hidden group ${theme.border}`}
    >
      
      {/* Dynamic Side Lines */}
      <motion.div 
        variants={neonPulse}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-y-0 left-0 w-1 bg-${theme.primary}-500`}
      />
      <motion.div 
        variants={neonPulse}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute inset-y-0 right-0 w-1 bg-${theme.primary}-500`}
      />

      {/* Header */}
      <div className="w-full flex justify-between items-start z-10 mb-2">
        
        {/* Left Side: Pump Name & Fuel Type */}
        <div className="flex flex-col items-start gap-1">
             <div className="flex items-center gap-2">
                 <Fuel className={`w-6 h-6 ${theme.text}`} />
                 <h3 className={`font-black text-xl ${theme.text} drop-shadow-md whitespace-nowrap`}>{pumpName}</h3>
             </div>
             {/* Increased Fuel Type Size significantly (text-xl) */}
             <span className={`text-xl font-bold ${theme.text} uppercase bg-white/5 px-3 py-1 rounded mt-1`}>{fuelType}</span>
        </div>

        {/* Right Side: Source Well & Actions */}
        <div className="flex flex-col items-end gap-2">
            <div className="flex flex-col items-end bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                <span className="text-[9px] text-gray-400">المصدر</span>
                <span className="text-xs font-bold text-gray-200">{sourceWell}</span>
            </div>
            
            <div className="flex gap-1">
                 <button 
                    onClick={onEdit}
                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all border border-blue-500/20"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                 </button>
                 <button 
                    onClick={onDelete}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/20"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                 </button>
            </div>
        </div>
      </div>

      {/* Counters List (Black Rows) */}
      <div className="w-full flex-1 overflow-y-auto space-y-2 mt-2 custom-scrollbar pr-1">
        {counters && counters.length > 0 ? (
            counters.map((counter, idx) => (
                <div key={idx} className="w-full bg-black border border-white/10 rounded-lg p-3 flex justify-between items-center shadow-lg relative overflow-hidden group/row h-16">
                    {/* Subtle gradient line on left of row */}
                    <div className={`absolute inset-y-0 left-0 w-0.5 bg-${theme.primary}-500 opacity-50`}></div>
                    
                    {/* Worker Name (NOW LEFT) - Large */}
                    <div className="text-left flex-1 border-r border-white/10 pr-2 mr-2">
                         <span className="text-lg font-bold text-gray-200 block leading-tight">{counter.worker_name || "عامل غير مخصص"}</span>
                         <span className="text-[9px] text-gray-500">اسم العامل</span>
                    </div>

                    {/* Meter Reading (NOW RIGHT) */}
                    <div className="font-mono text-xl text-white tracking-wider drop-shadow-sm flex flex-col items-end leading-none">
                        <span>{parseFloat(counter.current_reading || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-gray-500 font-sans mt-0.5">Liters</span>
                    </div>
                </div>
            ))
        ) : (
             <div className="w-full h-full flex items-center justify-center border border-white/5 rounded-xl bg-white/5 border-dashed">
                <span className="text-xs text-gray-500">لا توجد عدادات</span>
             </div>
        )}
      </div>

      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,${isDiesel ? 'rgba(59,130,246,0.15)' : 'rgba(249,115,22,0.15)'},transparent)] pointer-events-none`}></div>

    </motion.div>
  );
};

export default FuelPumpCard;
