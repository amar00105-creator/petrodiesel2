import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Ruler, Edit, Trash2 } from 'lucide-react';

const FuelTankCard = ({ 
  tank, 
  onEdit, 
  onDelete, 
  onCalibrate 
}) => {
  const { name, product, percentage, total_cap, current } = tank;

  // Color Theme Logic
  const isDiesel = product && (product.includes('Diesel') || product.includes('ديزل') || product.includes('جاز'));
  
  const theme = isDiesel ? {
     primary: "blue",
     liquid: "bg-blue-600",
     border: "border-blue-500/20",
     shadow: "rgba(59, 130, 246, 0.5)",
     text: "text-blue-400"
  } : {
     primary: "orange",
     liquid: "bg-orange-600",
     border: "border-orange-500/20",
     shadow: "rgba(249, 115, 22, 0.5)", 
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
      className={`relative w-full h-80 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden group flex flex-col justify-between p-4 ${theme.border}`}
    >
      
      {/* Neon Side Lines */}
      <motion.div 
        variants={neonPulse}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-y-0 left-0 w-1 bg-${theme.primary}-500 z-20`}
      />
      <motion.div 
        variants={neonPulse}
        initial="initial"
        animate="animate"
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute inset-y-0 right-0 w-1 bg-${theme.primary}-500 z-20`}
      />

      {/* Background Liquid Animation */}
      <div className="absolute inset-0 w-full h-full z-0">
          <motion.div 
            className={`absolute bottom-0 left-0 w-full ${theme.liquid} opacity-20`}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
           <motion.div 
            className={`absolute bottom-0 left-0 w-full ${theme.liquid} opacity-40 blur-md`}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
          />
      </div>

      {/* Header */}
      <div className="w-full flex justify-between items-start z-10">
         <div className="flex flex-col items-start">
             <div className="flex items-center gap-2">
                 <Droplet className={`w-6 h-6 ${theme.text}`} />
                 <h3 className={`font-black text-xl text-white drop-shadow-md whitespace-nowrap`}>{name}</h3>
             </div>
             <span className={`text-sm font-bold ${theme.text} uppercase bg-black/40 px-2 py-0.5 rounded mt-1 border border-white/5`}>{product}</span>
         </div>
         
         {/* Actions */}
         <div className="flex flex-col gap-2">
             <button onClick={onCalibrate} className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all" title="معايرة">
                <Ruler className="w-4 h-4" />
             </button>
             <button onClick={onEdit} className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all" title="تعديل">
                <Edit className="w-4 h-4" />
             </button>
             <button onClick={onDelete} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all" title="حذف">
                <Trash2 className="w-4 h-4" />
             </button>
         </div>
      </div>

      {/* Main Stats (Center) */}
      <div className="flex-1 flex flex-col justify-center items-center z-10">
          <div className="text-5xl font-black text-white drop-shadow-lg tracking-tighter">
              {percentage}%
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">Full</span>
      </div>

      {/* Footer Details */}
      <div className="w-full z-10 grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex flex-col items-center border-r border-white/10">
              <span className="text-[10px] text-gray-500 uppercase">Current</span>
              <span className="text-lg font-mono font-bold text-white">{parseFloat(current).toLocaleString()} <span className="text-[10px] text-gray-400">L</span></span>
          </div>
          <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-500 uppercase">Capacity</span>
              <span className="text-lg font-mono font-bold text-gray-300">{parseFloat(total_cap).toLocaleString()} <span className="text-[10px] text-gray-500">L</span></span>
          </div>
      </div>

    </motion.div>
  );
};

export default FuelTankCard;
