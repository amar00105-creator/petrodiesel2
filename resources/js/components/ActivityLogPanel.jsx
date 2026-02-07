import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge } from '@tremor/react';
import { Activity, User, LogIn, LogOut, Edit, Trash2, Plus, RefreshCw, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const actionIcons = {
    login: LogIn,
    logout: LogOut,
    create: Plus,
    update: Edit,
    delete: Trash2
};

const actionColors = {
    login: 'emerald',
    logout: 'slate',
    create: 'blue',
    update: 'amber',
    delete: 'red'
};

const actionLabels = {
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
    create: 'إضافة',
    update: 'تعديل',
    delete: 'حذف'
};

const entityLabels = {
    session: 'جلسة',
    sale: 'عملية بيع',
    purchase: 'عملية شراء',
    transaction: 'معاملة مالية',
    user: 'مستخدم',
    tank: 'خزان',
    pump: 'ماكينة',
    fuel_type: 'نوع وقود',
    role: 'صلاحية',
    supplier: 'مورد',
    customer: 'عميل'
};

export default function ActivityLogPanel() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${window.BASE_URL || ''}/api/activity-logs?limit=100`);
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs || []);
            }
        } catch (e) {
            console.error('Failed to fetch logs', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Title className="dark:text-white">سجل العمليات</Title>
                    <Badge color="blue">{logs.length} سجل</Badge>
                </div>
                <button 
                    onClick={fetchLogs}
                    disabled={loading}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 transition-all"
                >
                    <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text"
                    placeholder="بحث في السجلات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-right"
                />
            </div>

            {/* Logs List */}
            <Card className="rounded-2xl shadow-md ring-1 ring-slate-100 dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10 dark:ring-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Activity className="w-12 h-12 mb-3 opacity-50" />
                        <Text>لا توجد سجلات</Text>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/10 max-h-[500px] overflow-y-auto">
                        {filteredLogs.map((log, index) => {
                            const Icon = actionIcons[log.action] || Activity;
                            const color = actionColors[log.action] || 'slate';
                            
                            return (
                                <motion.div 
                                    key={log.id || index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
                                            <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge color={color} size="sm">
                                                    {actionLabels[log.action] || log.action}
                                                </Badge>
                                                <Badge color="slate" size="sm">
                                                    {entityLabels[log.entity_type] || log.entity_type}
                                                </Badge>
                                            </div>
                                            <Text className="text-slate-700 dark:text-slate-200 font-medium text-right">
                                                {log.description}
                                            </Text>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {log.user_name || log.user_display_name || 'مجهول'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(log.created_at)}
                                                </span>
                                                {log.ip_address && (
                                                    <span className="font-mono text-xs">
                                                        {log.ip_address}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
