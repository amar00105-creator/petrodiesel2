import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Button, NumberInput } from '@tremor/react';
import { AlertTriangle, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import TransferSuccessAnimation from './TransferSuccessAnimation';

export default function TransferAndDeleteModal({ isOpen, onClose, tank, tanks, onConfirm }) {
    // If 'tank' prop is null, we are in "Standalone Transfer" mode (Source Selection)
    // If 'tank' prop is provided, we are in "Delete & Transfer" mode (or forced source)
    
    const isDeleteMode = !!tank; 
    const [sourceTankId, setSourceTankId] = useState(tank ? tank.id : '');
    const [transfers, setTransfers] = useState([{ tankId: '', amount: '' }]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && tank) {
            setSourceTankId(tank.id);
            setTransfers([{ tankId: '', amount: '' }]);
        } else if (isOpen && !tank) {
            setSourceTankId('');
            setTransfers([{ tankId: '', amount: '' }]);
        }
        setError('');
        setShowSuccess(false);
    }, [isOpen, tank]);

    // --- Derived State & Helpers ---
    const sourceTank = tanks.find(t => t.id == sourceTankId);
    
    // Eligible targets: Same fuel type, not source, not deleted
    const eligibleTargets = tanks.filter(t => 
        sourceTank && 
        t.id != sourceTank.id && 
        t.fuel_type_id == sourceTank.fuel_type_id
    );

    const totalTransferred = transfers.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const sourceVolume = sourceTank ? Number(sourceTank.current_volume) : 0;
    const remaining = Math.max(0, sourceVolume - totalTransferred);

    const addRow = () => {
        setTransfers([...transfers, { tankId: '', amount: '' }]);
    };

    const removeRow = (index) => {
        const newTransfers = [...transfers];
        newTransfers.splice(index, 1);
        setTransfers(newTransfers);
    };

    const updateRow = (index, field, value) => {
        const newTransfers = [...transfers];
        newTransfers[index][field] = value;
        setTransfers(newTransfers);
        setError('');
    };

    const handleConfirm = async () => {
        if (!sourceTankId) {
            setError('يرجى اختيار الخزان المصدر');
            return;
        }

        // Validation
        if (isDeleteMode && Math.abs(remaining) > 0.1) { 
            setError(`يجب توزيع كامل الكمية لحذف الخزان! المتبقي: ${remaining.toLocaleString()} لتر`);
            return;
        }

        if (transfers.some(t => !t.tankId || !t.amount || Number(t.amount) <= 0)) {
            setError('يرجى تعبئة جميع الحقول بشكل صحيح');
            return;
        }

        setIsSubmitting(true);
        try {
            // Transform to backend format
            const transferPayload = transfers.map(t => ({
                tank_id: t.tankId,
                amount: t.amount
            }));

            if (isDeleteMode) {
                // Use the delete callback provided by parent
                await onConfirm(sourceTankId, transferPayload);
                setShowSuccess(true);
            } else {
                // Standalone Transfer Logic
                const baseUrl = window.BASE_URL || '/PETRODIESEL2/public';
                const response = await fetch(`${baseUrl}/tanks/transfer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ 
                        id: sourceTankId, 
                        transfers: transferPayload 
                    })
                });

                const text = await response.text();
                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    console.error("Invalid JSON:", text);
                    throw new Error("خطأ في الخادم (استجابة غير صالحة)");
                }
                
                if (result.success) {
                    // Show success animation instead of immediate close
                    setShowSuccess(true);
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'فشل في الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <TransferSuccessAnimation 
                isVisible={true} 
                mode={isDeleteMode ? 'delete' : 'transfer'}
                onComplete={() => {
                    onClose();
                    window.location.reload(); 
                }} 
            />
        );
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-slate-200">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className={`p-3 rounded-full mb-4 ${isDeleteMode ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isDeleteMode ? <AlertTriangle className="w-8 h-8" /> : <div className="text-2xl font-bold">⇄</div>}
                    </div>
                    <Title className="text-xl font-bold text-slate-900">
                        {isDeleteMode ? 'تفريغ الخزان قبل الحذف' : 'نقل وقود بين الخزانات'}
                    </Title>
                    {isDeleteMode && (
                        <Text className="text-amber-600 font-medium">
                            الكمية المطلوب نقلها: <span className="font-bold font-mono text-lg">{sourceVolume.toLocaleString()}</span> لتر
                        </Text>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Source Selection (Only if standalone transfer) */}
                    {!isDeleteMode && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2">الخزان المصدر (من)</label>
                            <select 
                                className="w-full p-2 rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500"
                                value={sourceTankId}
                                onChange={(e) => setSourceTankId(e.target.value)}
                            >
                                <option value="">اختر الخزان...</option>
                                {tanks.filter(t => t.current_volume > 0).map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} (متاح: {Number(t.current_volume).toLocaleString()} لتر) - {t.product}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Transfers List */}
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                        {transfers.map((item, index) => (
                            <div key={index} className="flex flex-row items-end gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 relative">
                                <div className="flex-[2] w-full">
                                    <label className="text-xs font-bold text-slate-500 mb-1.5 block">الخزان المستقبل (إلى)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full text-right p-2.5 pl-8 h-11 text-sm rounded-lg border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                                            value={item.tankId}
                                            onChange={(e) => updateRow(index, 'tankId', e.target.value)}
                                            disabled={!sourceTankId}
                                        >
                                            <option value="">اختر خزان وجهة...</option>
                                            {eligibleTargets.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} (متاح: {(t.capacity_liters - t.current_volume).toLocaleString()} L)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-3.5 pointer-events-none text-slate-400">▼</div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 w-full relative">
                                     <label className="text-xs font-bold text-slate-500 mb-1.5 block">الكمية (لتر)</label>
                                     <input 
                                        type="number"
                                        className="w-full p-2.5 h-11 text-sm font-mono font-bold text-center rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        value={item.amount}
                                        onChange={(e) => updateRow(index, 'amount', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        max={sourceVolume}
                                     />
                                </div>

                                {transfers.length > 1 && (
                                    <button 
                                        onClick={() => removeRow(index)}
                                        className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        title="إزالة"
                                    >
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
                        <button onClick={addRow} className="flex items-center gap-1.5 text-blue-600 font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> إضافة وجهة أخرى
                        </button>
                        <div className="text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                            الإجمالي المحدد: <span className="font-bold text-slate-900 mx-1">{totalTransferred.toLocaleString()}</span> / {sourceVolume.toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <Button 
                        size="md" 
                        variant="secondary" 
                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={onClose}
                    >
                        إلغاء
                    </Button>
                    <Button 
                        size="md" 
                        variant="primary"
                        className={`flex-[2] text-white border-none shadow-md ${isDeleteMode ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                        onClick={handleConfirm}
                        loading={isSubmitting}
                    >
                        {isDeleteMode ? 'تأكيد النقل والحذف' : 'تنفيذ النقل'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
