import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge } from '@tremor/react';
import { Bell, Droplets, AlertTriangle, CreditCard, Fuel, Users, TrendingDown, RefreshCw, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AlertsPanel({ stationId }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState([]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                action: 'get_alerts',
                station_id: stationId || 'all'
            });
            
            const res = await fetch(`${window.BASE_URL || ''}/api/alerts?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            const result = await res.json();
            
            if (result.success) {
                setAlerts(result.alerts || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [stationId]);

    const dismissAlert = (id) => {
        setDismissed([...dismissed, id]);
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'low_stock': return <Droplets className="w-5 h-5" />;
            case 'debt_due': return <CreditCard className="w-5 h-5" />;
            case 'high_loss': return <TrendingDown className="w-5 h-5" />;
            case 'fuel_price': return <Fuel className="w-5 h-5" />;
            case 'payroll': return <Users className="w-5 h-5" />;
            default: return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case 'critical': return { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-500/50', text: 'text-red-600 dark:text-red-400', badge: 'red' };
            case 'warning': return { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-500/50', text: 'text-amber-600 dark:text-amber-400', badge: 'amber' };
            case 'info': return { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-500/50', text: 'text-blue-600 dark:text-blue-400', badge: 'blue' };
            default: return { bg: 'bg-slate-100 dark:bg-slate-900/30', border: 'border-slate-300 dark:border-slate-500/50', text: 'text-slate-600 dark:text-slate-400', badge: 'slate' };
        }
    };

    const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (visibleAlerts.length === 0) {
        return (
            <Card className="rounded-2xl shadow-md border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3 py-4">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <Title className="text-emerald-700 dark:text-emerald-300">لا توجد تنبيهات</Title>
                        <Text className="text-emerald-600 dark:text-emerald-400">جميع الأنظمة تعمل بشكل طبيعي</Text>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <Title className="dark:text-white">التنبيهات الذكية</Title>
                    <Badge color="amber" size="sm">{visibleAlerts.length}</Badge>
                </div>
                <button 
                    onClick={fetchAlerts}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Alerts List */}
            <AnimatePresence>
                {visibleAlerts.map((alert, index) => {
                    const colors = getAlertColor(alert.severity);
                    
                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Text className={`font-bold ${colors.text}`}>{alert.title}</Text>
                                            <Badge color={colors.badge} size="xs">
                                                {alert.severity === 'critical' ? 'حرج' : alert.severity === 'warning' ? 'تحذير' : 'معلومة'}
                                            </Badge>
                                        </div>
                                        <Text className="text-slate-600 dark:text-slate-400 text-sm">
                                            {alert.message}
                                        </Text>
                                        {alert.action && (
                                            <button className={`mt-2 text-sm font-medium ${colors.text} underline hover:no-underline`}>
                                                {alert.action}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => dismissAlert(alert.id)}
                                    className="p-1 rounded hover:bg-white/50 dark:hover:bg-white/10 transition-all"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

/**
 * Mini Alert Badge for header/navbar
 */
export function AlertBadge({ stationId }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch(`${window.BASE_URL || ''}/api/alerts?action=count&station_id=${stationId || 'all'}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                });
                const result = await res.json();
                if (result.success) {
                    setCount(result.count || 0);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [stationId]);

    if (count === 0) return null;

    return (
        <div className="relative">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
            </span>
        </div>
    );
}
