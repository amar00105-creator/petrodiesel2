import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Title, Text, TextInput, Select, SelectItem, Badge, Button, Avatar } from '@tremor/react';
import { Search, Plus, Trash2, Edit, ChevronLeft, ChevronRight, User, Shield, Mail } from 'lucide-react';

// Mock Data
const MOCK_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@system.com', role: 'Super Admin', status: 'Active' },
    { id: 2, name: 'Mohammed Ali', email: 'mohammed@station.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Ahmed Saleh', email: 'ahmed.s@station.com', role: 'Accountant', status: 'Active' },
    { id: 4, name: 'Worker 1', email: 'w1@station.com', role: 'Worker', status: 'Suspended' },
];

export default function UserList() {
    const [search, setSearch] = useState('');

    const filteredUsers = MOCK_USERS.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-6 max-w-[1800px] mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title className="text-3xl font-bold text-navy-900 font-cairo">إدارة المستخدمين</Title>
                    <Text className="text-slate-500">حسابات الموظفين والصلاحيات</Text>
                </div>
                <Button icon={Plus} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 border-none">إضافة مستخدم</Button>
            </div>

            {/* Filters */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
                <div className="relative max-w-md">
                    <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                    <TextInput 
                        placeholder="بحث بالاسم أو البريد..." 
                        className="pl-4 pr-10 py-2 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-bold text-slate-600">المستخدم</th>
                                <th className="p-4 text-sm font-bold text-slate-600">البريد الإلكتروني</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الدور الوظيفي</th>
                                <th className="p-4 text-sm font-bold text-slate-600">الحالة</th>
                                <th className="p-4 text-sm font-bold text-slate-600 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy-900">{user.name}</p>
                                            <p className="text-xs text-slate-400">ID: {user.id}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 font-mono text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-emerald-600" />
                                            <span className="font-bold text-slate-700">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge 
                                            size="xs" 
                                            color={user.status === 'Active' ? 'emerald' : 'red'}
                                        >
                                            {user.status === 'Active' ? 'نشط' : 'موثوف'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4"/></button>
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
}
