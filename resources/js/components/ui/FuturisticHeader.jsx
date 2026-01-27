import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Sun,
  Moon,
  Truck,
  Droplet,
  Users,
  FileText,
  Settings,
  Wallet,
  CreditCard,
  BarChart2,
  Home,
  Activity,
  Fuel,
  Clock,
  User,
  Globe,
} from "lucide-react";

const FuturisticHeader = ({ page, user, stats, allStations }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Theme Toggle State
  const [isDark, setIsDark] = useState(() => {
     if (typeof window !== 'undefined') {
         return localStorage.getItem('theme') === 'dark' || 
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
     }
     return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
        html.classList.add('dark-mode');
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.remove('dark-mode');
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStationSwitch = async (e) => {
    const stationId = e.target.value;
    try {
      const res = await fetch(`${window.BASE_URL}/switchStation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ station_id: stationId }),
      });
      const result = await res.json();
      if (result.success) window.location.reload();
    } catch (err) {
      console.error("Switch failed", err);
    }
  };

  // 1. Configuration Mapping
  const config = {
    default: {
      title: "لوحة التحكم",
      subtitle: "النظرة العامة والإحصائيات",
      icon: Home,
      color: "from-slate-700 to-blue-900",
      glow: "shadow-blue-900/50",
      border: "border-blue-500/30",
      headerBg: "bg-gradient-to-r from-slate-950/95 to-blue-950/95",
      textColor: "text-white",
      subtitleColor: "text-slate-200",
    },
    "sales-create": {
      title: "نقطة البيع",
      subtitle: "تسجيل مبيعات الوقود",
      icon: ShoppingCart,
      color: "from-emerald-600 to-teal-500",
      glow: "shadow-emerald-500/50",
      border: "border-emerald-500/50",
      headerBg: "bg-gradient-to-r from-emerald-900/95 to-teal-900/95",
      textColor: "text-white",
      subtitleColor: "text-emerald-100",
    },
    "purchase-list": {
      title: "سجل المشتريات",
      subtitle: "إدارة وتتبع الطلبات",
      icon: Truck,
      color: "from-blue-600 to-indigo-500",
      glow: "shadow-blue-500/50",
      border: "border-blue-500/50",
      headerBg: "bg-gradient-to-r from-blue-900/95 to-indigo-900/95",
      textColor: "text-white",
      subtitleColor: "text-blue-100",
    },
    "create-purchase": {
      title: "شراء وقود جديد",
      subtitle: "إدخال طلبية جديدة",
      icon: Truck,
      color: "from-indigo-600 to-blue-500",
      glow: "shadow-indigo-500/50",
      border: "border-indigo-500/50",
      headerBg: "bg-gradient-to-r from-indigo-900/95 to-blue-900/95",
      textColor: "text-white",
      subtitleColor: "text-indigo-100",
    },
    "tank-list": {
      title: "مخزون الوقود",
      subtitle: "مراقبة الخزانات",
      icon: Droplet,
      color: "from-amber-600 to-orange-500",
      glow: "shadow-amber-500/50",
      border: "border-amber-500/50",
      headerBg: "bg-gradient-to-r from-amber-900/95 to-orange-900/95",
      textColor: "text-white",
      subtitleColor: "text-amber-100",
    },
    pumps: {
      title: "المكن والعدادات",
      subtitle: "إدارة العمال والطرمبات والعدادات وربطها بالآبار",
      icon: Fuel,
      color: "from-blue-700 to-cyan-600",
      glow: "shadow-blue-600/50",
      border: "border-blue-500/50",
      // Ultra Dark Blue Crystal Background for Maximum Contrast
      headerBg: "bg-gradient-to-r from-slate-900/95 to-blue-900/95",
      textColor: "text-white",
      subtitleColor: "text-blue-100",
    },
    "manage-pump": {
      title: "المكن والعدادات",
      subtitle: "إدارة العمال والطرمبات والعدادات وربطها بالآبار",
      icon: Fuel,
      color: "from-blue-700 to-cyan-600",
      glow: "shadow-blue-600/50",
      border: "border-blue-500/50",
      headerBg: "bg-gradient-to-r from-slate-900/95 to-blue-900/95",
      textColor: "text-white",
      subtitleColor: "text-blue-100",
    },
    "human-resources": {
      title: "الموارد البشرية",
      subtitle: "الموظفين والسائقين",
      icon: Users,
      color: "from-purple-600 to-violet-500",
      glow: "shadow-purple-500/50",
      border: "border-purple-500/50",
      headerBg: "bg-gradient-to-r from-purple-900/95 to-violet-900/95",
      textColor: "text-white",
      subtitleColor: "text-purple-100",
    },
    partners: {
      title: "الشركاء",
      subtitle: "العملاء والموردين",
      icon: Users,
      color: "from-pink-600 to-rose-500",
      glow: "shadow-pink-500/50",
      border: "border-pink-500/50",
      headerBg: "bg-gradient-to-r from-pink-900/95 to-rose-900/95",
      textColor: "text-white",
      subtitleColor: "text-pink-100",
    },
    "accounting-dashboard": {
      title: "الإدارة المالية",
      subtitle: "الخزنات والبنوك",
      icon: Wallet,
      color: "from-teal-600 to-emerald-500",
      glow: "shadow-teal-500/50",
      border: "border-teal-500/50",
      headerBg: "bg-gradient-to-r from-teal-900/95 to-emerald-900/95",
      textColor: "text-white",
      subtitleColor: "text-teal-100",
    },
    "expense-list": {
      title: "المصروفات",
      subtitle: "سجل النفقات",
      icon: CreditCard,
      color: "from-emerald-600 to-green-500",
      glow: "shadow-emerald-500/50",
      border: "border-emerald-500/50",
      headerBg: "bg-gradient-to-r from-emerald-900/95 to-green-900/95",
      textColor: "text-white",
      subtitleColor: "text-emerald-100",
    },
    resources: { // It seems there was a 'reports' key here in previous view, check context. But target 'expense-list'.
      // Keeping context clean.
    },
    reports: {
      title: "التقارير والإحصائيات",
      subtitle: "تحليل الأداء اليومي",
      icon: BarChart2,
      color: "from-violet-600 to-fuchsia-500",
      glow: "shadow-violet-500/50",
      border: "border-violet-500/50",
      headerBg: "bg-gradient-to-r from-violet-900/95 to-fuchsia-900/95",
      textColor: "text-white",
      subtitleColor: "text-violet-100",
    },
    // --- Aliases / Secondary Pages (Ensuring Full Coverage) ---
    "add-pump": {
      title: "إضافة ماكينة",
      subtitle: "إعداد ماكينة جديدة",
      icon: Fuel,
      color: "from-blue-700 to-cyan-600",
      glow: "shadow-blue-600/50",
      border: "border-blue-500/50",
      headerBg: "bg-gradient-to-r from-slate-900/95 to-blue-900/95",
      textColor: "text-white",
      subtitleColor: "text-blue-100",
    },
    "edit-purchase": {
      title: "تعديل فاتورة",
      subtitle: "تصحيح بيانات الشراء",
      icon: Truck,
      color: "from-indigo-600 to-blue-500",
      glow: "shadow-indigo-500/50",
      border: "border-indigo-500/50",
      headerBg: "bg-gradient-to-r from-indigo-900/95 to-blue-900/95",
      textColor: "text-white",
      subtitleColor: "text-indigo-100",
    },
    workers: {
      title: "العمال",
      subtitle: "إدارة العمال والموظفين",
      icon: Users,
      color: "from-purple-600 to-violet-500",
      glow: "shadow-purple-500/50",
      border: "border-purple-500/50",
      headerBg: "bg-gradient-to-r from-purple-900/95 to-violet-900/95",
      textColor: "text-white",
      subtitleColor: "text-purple-100",
    },
    "supplier-list": {
      title: "الموردين",
      subtitle: "قائمة الموردين والشركاء",
      icon: Users,
      color: "from-pink-600 to-rose-500",
      glow: "shadow-pink-500/50",
      border: "border-pink-500/50",
      headerBg: "bg-gradient-to-r from-pink-900/95 to-rose-900/95",
      textColor: "text-white",
      subtitleColor: "text-pink-100",
    },
    expenses: {
      title: "سجل المصروفات",
      subtitle: "متابعة النفقات اليومية",
      icon: CreditCard,
      color: "from-emerald-600 to-green-500",
      glow: "shadow-emerald-500/50",
      border: "border-emerald-500/50",
      headerBg: "bg-gradient-to-r from-emerald-900/95 to-green-900/95",
      textColor: "text-white",
      subtitleColor: "text-emerald-100",
    },
    // --- New Standardized Pages ---
    "sales-list": {
      title: "المبيعات اليومية",
      subtitle: "سجل المبيعات والورديات",
      icon: ShoppingCart,
      color: "from-emerald-600 to-teal-500",
      glow: "shadow-emerald-500/50",
      border: "border-emerald-500/50",
      headerBg: "bg-gradient-to-r from-emerald-900/95 to-teal-900/95",
      textColor: "text-white",
      subtitleColor: "text-emerald-100",
    },
    settings: {
      title: "إعدادات النظام",
      subtitle: "التحكم الكامل في الخصائص",
      icon: Settings,
      color: "from-slate-600 to-yellow-600", // Unique Slate/Gold Mix
      glow: "shadow-yellow-600/50",
      border: "border-yellow-600/50",
      headerBg: "bg-gradient-to-r from-slate-900/95 to-stone-900/95",
      textColor: "text-white",
      subtitleColor: "text-yellow-100",
    },
  };

  const activeConfig = config[page] || config["default"];
  const Icon = activeConfig.icon;

  // Default bg if not set
  const headerBg = activeConfig.headerBg || "bg-white/80";
  // Default text colors
  const titleColor = activeConfig.textColor || "text-slate-800";
  const subtitleClass = activeConfig.subtitleColor
    ? activeConfig.subtitleColor
    : `bg-clip-text text-transparent bg-gradient-to-r ${activeConfig.color}`;

  return (
    <div className="relative sticky top-0 z-50 mb-6 mx-4 mt-2">
      {/* 1. Initial Flash Effect (Appears on open, then disappears) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 0.8, 0], scale: 1.05 }}
        transition={{ duration: 1.5, ease: "easeOut", times: [0, 0.2, 1] }}
        // Increased blur to 3xl to soften edges completely (no rectangle look)
        className={`absolute inset-0 bg-gradient-to-r ${activeConfig.color} rounded-2xl blur-3xl z-0`}
      />

      {/* 3. Main Glass Container */}
      <motion.div
        // "Cinematic Materialize" Animation
        initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // "Luxury" Easing
        className={`relative z-10 px-6 py-8 ${headerBg} backdrop-blur-2xl border-x border-t border-b-4 ${activeConfig.border} rounded-2xl shadow-2xl ${activeConfig.glow} overflow-hidden flex items-center justify-between transition-all duration-500`}
        style={{
          boxShadow: `inset 0 0 20px rgba(255,255,255,0.1)`,
        }}
      >
        {/* CSS Variable for Glow Color - defaulting to a generic blueish if not set, but Tailwind class 'shadow-blue-500/50' handles the main color. 
                   We add a specific style injection to make sure the custom prop works if we want precise control. 
                   Actually, let's just use the Tailwind shadow classes provided in config (e.g., shadow-blue-500/50) which are already applied in className above.
                   The var(--glow-color) is surplus unless we define it dynamically.
                   For simplicity and robustness, removing the confusing manual boxShadow and relying on Tailwind's generous shadows + the new border style.
                */}

        {/* 4. Light Sweep Effect (Very Slow & Subtle) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <div className="absolute top-0 bottom-0 left-[-100%] w-[50%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[shimmer_12s_infinite]" />
        </div>

        {/* Content */}
        <div className="flex items-center gap-4 z-10">
          {/* Icon Container with Glass Effect */}
          <div
            className={`p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg ${activeConfig.glow} text-white`}
          >
            <Icon size={24} strokeWidth={2} />
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <h1
              className={`text-2xl font-black ${titleColor} tracking-tight dark:text-white`}
            >
              {activeConfig.title}
            </h1>
            <span
              className={`text-sm font-bold ${subtitleClass} opacity-90 uppercase tracking-wider`}
            >
              {activeConfig.subtitle}
            </span>
          </div>
        </div>

        {/* Decorative Elements & Info */}
        <div className="hidden md:flex items-center gap-4 z-10">
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md"
            title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Info */}
          {user && (
            <div className="flex flex-col items-end text-sm">
              <span className="font-bold text-white flex items-center gap-1">
                <User size={14} /> {user.name}
              </span>
              <span className="text-xs text-white/70">
                {user.role === "super_admin" ? "Super Admin" : "User"}
              </span>
            </div>
          )}

          {/* Station Switcher or Name */}
          {allStations && allStations.length > 0 ? (
            <div className="relative group">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                <Globe size={14} className="text-blue-300" />
                <select
                  onChange={handleStationSwitch}
                  value={user?.station_id || ""}
                  className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer appearance-none pr-8"
                  style={{ backgroundImage: "none" }}
                >
                  <option className="text-slate-900" value="all">
                    Global View
                  </option>
                  {allStations.map((s) => (
                    <option key={s.id} className="text-slate-900" value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end text-sm">
              <span className="font-bold text-white flex items-center gap-1">
                <Globe size={14} className="text-emerald-300" />
                {user?.station_id
                  ? user.station_name || "Station #" + user.station_id
                  : "Global Access"}
              </span>
            </div>
          )}

          {/* Time & Date - Unified Box */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
            <Clock size={16} className="text-blue-300 self-center" />
            <div className="flex flex-col items-start">
              <div className="text-[10px] text-white/70 font-medium">
                {currentTime.toLocaleDateString("ar-SA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="text-sm text-white font-mono font-bold">
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold border-r border-white/10 pr-4">
            <Activity size={12} />
            {stats?.activeUsers || 1} Active Users
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${activeConfig.color} opacity-75`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r ${activeConfig.color}`}
              ></span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-300">
              SYSTEM ACTIVE
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tailwind Custom Animation for Shimmer (Add to your global CSS if not present, but using style for portability) */}
      <style jsx="true">{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
      `}</style>
    </div>
  );
};

export default FuturisticHeader;
