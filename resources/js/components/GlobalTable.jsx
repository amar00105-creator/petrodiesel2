import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, TextInput, Button } from '@tremor/react';
import { Search, Download, Printer, Plus, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function GlobalTable({
    title,
    subtitle,
    data = [],
    columns = [],
    actions,
    onAdd,
    addButtonLabel = 'إضافة جديد',
    searchPlaceholder = 'بحث...',
    filters,
    stats,
    exportName = 'export'
}) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    // Default Pagination
    const itemsPerPage = 10;

    // Filter Logic
    const filteredData = data.filter(item => {
        // Generic Search Implementation
        const matchesSearch = Object.values(item).some(val => 
            String(val).toLowerCase().includes(search.toLowerCase())
        );
        return matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExport = (type) => {
        if (type === 'csv') {
            // Simple generic CSV export
            const headers = columns.map(c => c.header).join(',');
            const rows = filteredData.map(item => 
                columns.map(c => {
                    const val = c.accessor ? (typeof c.accessor === 'function' ? c.accessor(item) : item[c.accessor]) : '';
                    return `"${val}"`;
                }).join(',')
            );
            const csvContent = [headers, ...rows].join('\n');
            const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${exportName}_${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
        } else if (type === 'print') {
            window.print();
        }
        setShowExportMenu(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <Title className="text-2xl font-bold text-navy-900 font-cairo">{title}</Title>
                    {subtitle && <Text className="text-slate-500">{subtitle}</Text>}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Export / Print */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            <Download className="w-4 h-4" /> تصدير
                        </button>
                        {showExportMenu && (
                            <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                                <button onClick={() => handleExport('csv')} className="w-full text-right px-4 py-2 hover:bg-slate-50 text-sm font-medium">Excel (CSV)</button>
                                <button onClick={() => handleExport('print')} className="w-full text-right px-4 py-2 hover:bg-slate-50 text-sm font-medium">PDF / Print</button>
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        <Printer className="w-4 h-4" /> طباعة
                    </button>

                    {onAdd && (
                        <button 
                            onClick={onAdd}
                            className="flex items-center gap-2 px-6 py-2 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-colors shadow-lg shadow-navy-900/20"
                        >
                            <Plus className="w-5 h-5" /> {addButtonLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Bar (Optional) */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
                    {stats}
                </div>
            )}

            {/* Filters Bar */}
            <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200 print:hidden">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                        <TextInput 
                            placeholder={searchPlaceholder}
                            className="pl-4 pr-10 py-2 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {filters}
                </div>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl shadow-lg ring-1 ring-slate-200 overflow-hidden p-0 print:shadow-none print:ring-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200 print:bg-white">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={idx} className={`p-4 text-sm font-bold text-slate-600 ${col.className || ''}`}>
                                        {col.header}
                                    </th>
                                ))}
                                {actions && <th className="p-4 text-sm font-bold text-slate-600 text-center print:hidden">إجراءات</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIndex) => (
                                    <tr key={item.id || rowIndex} className="hover:bg-blue-50/30 transition-colors group">
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className={`p-4 ${col.className || ''}`}>
                                                {col.render ? col.render(item) : (col.accessor ? item[col.accessor] : '')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="p-4 print:hidden">
                                                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {actions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="p-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Search className="w-6 h-6 text-slate-300"/>
                                            </div>
                                            <p>لا توجد نتائج مطابقة</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
                    <Text className="text-sm text-slate-500">
                        عرض {paginatedData.length} من أصل {filteredData.length} سجل
                    </Text>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4"/>
                        </button>
                        <span className="flex items-center px-4 font-mono font-bold text-slate-600">{currentPage} / {totalPages || 1}</span>
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
