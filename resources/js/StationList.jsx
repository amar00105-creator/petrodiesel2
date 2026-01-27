import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Title, Text, Button, Badge } from '@tremor/react';
import { Plus, Building2, MapPin, Phone, Edit, Trash2, Users, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const SuccessPopup = ({ message, onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 relative z-10 min-w-[300px] border-4 border-emerald-50"
        >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                 <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                 >
                    <CheckCircle className="w-10 h-10 text-emerald-600" strokeWidth={3} />
                 </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900 font-cairo">تمت العملية بنجاح</h3>
            <p className="text-slate-500 font-medium text-lg">{message}</p>
        </motion.div>
    </div>
);

export default function StationList({ stations = [], users = [] }) {
    const [userList, setUserList] = useState(users);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    
    // User Management Modal
    const [managingStation, setManagingStation] = useState(null);
    const [assignSearch, setAssignSearch] = useState('');

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    // Success Popup
    const [successMessage, setSuccessMessage] = useState(null);

    const filteredStations = stations.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.address?.toLowerCase().includes(searchTerm.toLowerCase()) // Optional chaining if address null
    );

    const handleSave = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd);
        if (editingStation) data.id = editingStation.id;

        try {
            const res = await fetch('/PETRODIESEL2/public/stations/save_ajax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                toast.success(editingStation ? 'تم تحديث المحطة' : 'تم إضافة المحطة');
                window.location.reload();
            } else {
                toast.error(result.message || 'Error occurred');
            }
        } catch (err) {
            toast.error('Connection error');
        }
    };

    const confirmDelete = async () => {
        if(!itemToDelete) return;
        try {
            const res = await fetch('/PETRODIESEL2/public/stations/delete_ajax', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemToDelete.id })
            });
            const result = await res.json();
            if (result.success) {
                toast.success('تم حذف المحطة');
                window.location.reload();
            } else {
                toast.error(result.message || 'Cannot delete station');
            }
        } catch (err) {
            toast.error('Connection error');
        } finally {
            setDeleteModalOpen(false);
        }
    };

    const handleAssignUser = async (userId, stationId, action = 'add') => {
        try {
            const res = await fetch('/PETRODIESEL2/public/stations/assign_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, station_id: stationId, action })
            });
            const result = await res.json();
            if (result.success) {
                // Trigger Popup
                setSuccessMessage(action === 'add' ? 'تم تعيين المستخدم' : 'تم إلغاء التعيين');
                setTimeout(() => setSuccessMessage(null), 1500);

                // Optimistic Update
                setUserList(prev => prev.map(u => {
                    if (u.id === userId) {
                        const currentStations = u.stations || (u.station_id ? [{ id: u.station_id }] : []);
                        let newStations = [...currentStations];

                        if (action === 'add') {
                            if (!newStations.some(s => s.id == stationId)) {
                                newStations.push({ id: stationId });
                            }
                        } else {
                            newStations = newStations.filter(s => s.id != stationId);
                        }
                        
                        // Update legacy station_id as well (just take first or null)
                        const newLegacyId = newStations.length > 0 ? newStations[0].id : null;

                        return { ...u, stations: newStations, station_id: newLegacyId };
                    }
                    return u;
                }));
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error('Connection error');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-7xl mx-auto space-y-6">
            <DeleteConfirmationModal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف المحطة"
                message={`هل أنت متأكد من حذف محطة "${itemToDelete?.name}"؟`}
            />

            <AnimatePresence>
                {successMessage && <SuccessPopup message={successMessage} onClose={() => setSuccessMessage(null)} />}
            </AnimatePresence>

            {/* Header */}
            {/* Header - Simplified for Tab View */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 {/* Only show title if not embedded or make it smaller */}
                 {/* actually, inside a tab, a secondary title is fine but let's make it cleaner */}
                 
                <Button 
                    icon={Plus} 
                    onClick={() => { setEditingStation(null); setIsCreateOpen(true); }}
                    className="bg-navy-900 hover:bg-navy-800 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-navy-200"
                >
                    إضافة محطة
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute right-3 top-3 text-slate-400 w-5 h-5"/>
                <input 
                    type="text" 
                    placeholder="بحث عن محطة..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStations.map(station => {
                     // Find users assigned to this station
                     const stationUsers = userList.filter(u => 
                        u.stations && u.stations.length > 0 
                        ? u.stations.some(s => s.id == station.id) 
                        : u.station_id == station.id
                     );

                     return (
                        <motion.div 
                            key={station.id}
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-lg transition-shadow relative group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <Building2 className="w-8 h-8 text-blue-600"/>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingStation(station); setIsCreateOpen(true); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => { setItemToDelete(station); setDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-navy-900 mb-2">{station.name}</h3>
                            
                            <div className="space-y-2 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400"/>
                                    {station.address || 'لا يوجد عنوان'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400"/>
                                    {station.phone || 'لا يوجد هاتف'}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">المستخدمين</span>
                                    <button onClick={() => setManagingStation(station)} className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                                        <Users className="w-3 h-3"/> إدارة
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {stationUsers.length > 0 ? stationUsers.map(u => (
                                        <Badge key={u.id} size="xs" color="emerald">{u.name}</Badge>
                                    )) : (
                                        <span className="text-xs text-slate-400 italic">لا يوجد مستخدمين</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                     );
                })}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-navy-900 mb-4">{editingStation ? 'تعديل المحطة' : 'إضافة محطة جديدة'}</h3>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">اسم المحطة</label>
                                    <input name="name" defaultValue={editingStation?.name} className="w-full p-2 border rounded-xl" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">العنوان</label>
                                    <input name="address" defaultValue={editingStation?.address} className="w-full p-2 border rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">الهاتف</label>
                                    <input name="phone" defaultValue={editingStation?.phone} className="w-full p-2 border rounded-xl" />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                                    <Button type="submit">حفظ</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Users Modal */}
            <AnimatePresence>
                {managingStation && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl h-[600px] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-navy-900">مستخدمي {managingStation.name}</h3>
                                    <p className="text-sm text-slate-500">تعيين أو إلغاء تعيين المستخدمين لهذه المحطة</p>
                                </div>
                                <button onClick={() => setManagingStation(null)}><XCircle className="w-6 h-6 text-slate-300 hover:text-red-500"/></button>
                            </div>
                            
                            <input 
                                placeholder="بحث عن مستخدم..." 
                                value={assignSearch} onChange={e => setAssignSearch(e.target.value)}
                                className="w-full p-2 border rounded-xl mb-4"
                            />

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {userList.filter(u => u.name.toLowerCase().includes(assignSearch.toLowerCase())).map(user => {
                                    const isAssigned = user.stations 
                                        ? user.stations.some(s => s.id == managingStation.id)
                                        : user.station_id == managingStation.id;

                                    // Check if assigned elsewhere (any other station)
                                    const otherStations = user.stations 
                                        ? user.stations.filter(s => s.id != managingStation.id)
                                        : (user.station_id && user.station_id != managingStation.id ? [{id: user.station_id}] : []);
                                        
                                    const isAssignedElsewhere = otherStations.length > 0;
                                    
                                    // Find station name if assigned elsewhere (show count or first one)
                                    const otherStationText = isAssignedElsewhere 
                                        ? `مسجل في ${otherStations.length} محطات أخرى`
                                        : null;

                                    return (
                                        <div key={user.id} className={`flex justify-between items-center p-3 rounded-xl border ${isAssigned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100'}`}>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email} - {user.role}</div>
                                                {isAssignedElsewhere && <div className="text-xs text-amber-600 mt-1">{otherStationText}</div>}
                                            </div>
                                            {isAssigned ? (
                                                 <button onClick={() => handleAssignUser(user.id, managingStation.id, 'remove')} className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">إلغاء</button>
                                            ) : (
                                                 <button onClick={() => handleAssignUser(user.id, managingStation.id, 'add')} className="px-3 py-1 bg-navy-900 text-white rounded-lg text-xs font-bold hover:bg-navy-800">تعيين</button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
