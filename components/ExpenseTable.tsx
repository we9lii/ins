import React, { useState } from 'react';
import { ExpenseLine, ExpenseReason, Sheet } from '../types';
import { REASON_OPTIONS, REASON_COLORS } from '../constants';
import { generateId } from '../utils';
import { Trash2, Edit3, Plus, ArrowUpCircle, Hash, Building2, FileText, CreditCard, User, Banknote, Calendar, Tag } from 'lucide-react';
import { ToastType } from './Toast';

interface ExpenseTableProps {
  sheet: Sheet;
  onAddLine: (line: ExpenseLine) => void;
  onUpdateLine: (line: ExpenseLine) => void;
  onDeleteLine: (lineId: string) => void;
  reasonFilter: ExpenseReason | 'ALL';
  showToast: (msg: string, type?: ToastType) => void;
}

const EmptyDraftLine: Omit<ExpenseLine, 'id' | 'sheet_id' | 'created_at'> = {
  date: new Date().toISOString().slice(0, 10),
  company: '',
  tax_number: '',
  invoice_number: '',
  description: '',
  reason: ExpenseReason.PROJECTS,
  amount: 0,
  bank_fees: 0,
  buyer_name: '',
  notes: ''
};

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  sheet,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  reasonFilter,
  showToast
}) => {
  const [draft, setDraft] = useState(EmptyDraftLine);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  // Filter lines
  const visibleLines = reasonFilter === 'ALL' 
    ? sheet.lines 
    : sheet.lines.filter(l => l.reason === reasonFilter);

  const handleDraftChange = (field: keyof typeof draft, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitDraft = () => {
    if (!draft.company || !draft.description || draft.amount <= 0) {
      showToast("يرجى تعبئة: الشركة، البيان، المبلغ", 'error');
      return;
    }

    if (isEditingId) {
        const originalLine = sheet.lines.find(l => l.id === isEditingId);
        const newLine: ExpenseLine = {
            ...draft,
            id: isEditingId,
            sheet_id: sheet.id,
            created_at: originalLine?.created_at || new Date().toISOString()
        };
        onUpdateLine(newLine);
        setIsEditingId(null);
    } else {
        const newLine: ExpenseLine = {
            ...draft,
            id: generateId(),
            sheet_id: sheet.id,
            created_at: new Date().toISOString()
        };
        onAddLine(newLine);
    }
    
    // Preserve Date and Buyer for faster entry flow
    setDraft({
      ...EmptyDraftLine,
      date: draft.date,
      buyer_name: draft.buyer_name
    });
    
    // Focus back on company or just scroll if needed
    if (window.innerWidth < 768) {
       document.getElementById('draft-area')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEditClick = (line: ExpenseLine) => {
    setDraft({
      date: line.date,
      company: line.company,
      tax_number: line.tax_number || '',
      invoice_number: line.invoice_number || '',
      description: line.description,
      reason: line.reason,
      amount: line.amount,
      bank_fees: line.bank_fees || 0,
      buyer_name: line.buyer_name || '',
      notes: line.notes || ''
    });
    setIsEditingId(line.id);
    setTimeout(() => {
        document.getElementById('draft-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setDraft({
        ...EmptyDraftLine,
        date: draft.date,
        buyer_name: draft.buyer_name
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitDraft();
    }
  };

  // Shared input class for consistency - Light Theme
  const inputClass = "w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition-all shadow-sm";
  const iconClass = "absolute top-2.5 right-2.5 text-slate-400 pointer-events-none";

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full overflow-hidden">
      {/* Table Area (Scrollable) */}
      <div className="overflow-x-auto flex-1 custom-scrollbar relative">
        <table className="w-full text-sm text-right border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-[10px] md:text-[11px] font-bold text-slate-500 whitespace-nowrap w-[90px]">التاريخ</th>
              <th className="p-3 text-[10px] md:text-[11px] font-bold text-slate-500 whitespace-nowrap min-w-[120px]">الجهة المستفيدة</th>
              <th className="hidden md:table-cell p-3 text-[11px] font-bold text-slate-500 w-[100px]">الرقم الضريبي</th>
              <th className="hidden md:table-cell p-3 text-[11px] font-bold text-slate-500 w-[90px]">الفاتورة</th>
              <th className="p-3 text-[10px] md:text-[11px] font-bold text-slate-500 whitespace-nowrap min-w-[150px]">البيان</th>
              <th className="p-3 text-[10px] md:text-[11px] font-bold text-slate-500 whitespace-nowrap w-[130px]">التصنيف</th>
              <th className="hidden md:table-cell p-3 text-[11px] font-bold text-slate-500 w-[80px]">المبلغ</th>
              <th className="hidden md:table-cell p-3 text-[11px] font-bold text-slate-500 w-[70px]">رسوم</th>
              <th className="p-3 text-[10px] md:text-[11px] font-bold text-slate-500 whitespace-nowrap w-[90px]">الإجمالي</th>
              <th className="hidden md:table-cell p-3 text-[11px] font-bold text-slate-500 w-[100px]">المشتري</th>
              <th className="hidden md:table-cell p-3 text-[11px] font-bold text-slate-500 min-w-[120px]">ملاحظات</th>
              <th className="p-3 text-[10px] md:text-[11px] font-bold text-slate-500 text-center w-[70px]">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visibleLines.length === 0 ? (
                <tr>
                    <td colSpan={12} className="text-center py-10 md:py-20">
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <FileText size={40} className="mb-2 opacity-50"/>
                          <p className="text-sm font-medium">لا توجد مصروفات مسجلة</p>
                          <p className="text-xs mt-1 opacity-70">ابدأ بإضافة بنود جديدة من الأسفل</p>
                        </div>
                    </td>
                </tr>
            ) : (
                visibleLines.map((line) => (
                <tr key={line.id} className={`group hover:bg-slate-50 transition-colors ${isEditingId === line.id ? 'bg-blue-50/40' : ''}`}>
                    <td className="p-3 text-slate-500 font-mono text-[10px] md:text-xs whitespace-nowrap">{line.date}</td>
                    
                    <td className="p-3 font-medium text-slate-700 text-[10px] md:text-xs">
                        <div className="truncate max-w-[120px] md:max-w-[150px]" title={line.company}>{line.company}</div>
                        {line.tax_number && <div className="text-[9px] text-slate-400 font-mono mt-0.5 md:hidden"># {line.tax_number}</div>}
                    </td>
                    
                    <td className="hidden md:table-cell p-3 text-slate-500 font-mono text-xs">{line.tax_number || '-'}</td>
                    <td className="hidden md:table-cell p-3 text-slate-500 font-mono text-xs">{line.invoice_number || '-'}</td>
                    
                    <td className="p-3 text-slate-600 text-[10px] md:text-xs">
                        <div className="truncate max-w-[150px] md:max-w-xs" title={line.description}>{line.description}</div>
                    </td>
                    
                    <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] md:text-[10px] font-medium whitespace-nowrap ${REASON_COLORS[line.reason]}`}>
                            {line.reason.split(' ').slice(1).join(' ')}
                        </span>
                    </td>
                    
                    <td className="hidden md:table-cell p-3 font-medium text-slate-700 font-mono text-xs">{line.amount.toFixed(2)}</td>
                    <td className="hidden md:table-cell p-3 text-slate-400 font-mono text-xs">{line.bank_fees ? line.bank_fees.toFixed(2) : '-'}</td>
                    
                    <td className="p-3 font-bold text-blue-600 font-mono text-[10px] md:text-xs whitespace-nowrap">
                        {(line.amount + (line.bank_fees || 0)).toFixed(2)}
                    </td>
                    
                    <td className="hidden md:table-cell p-3 text-slate-500 text-xs">{line.buyer_name || '-'}</td>
                    <td className="hidden md:table-cell p-3 text-slate-400 text-xs truncate max-w-[150px]">{line.notes || '-'}</td>
                    
                    <td className="p-3 text-center">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEditClick(line)}
                                disabled={!!isEditingId} 
                                className="text-blue-500 hover:text-blue-700 disabled:opacity-30 transition-colors"
                                title="تعديل"
                            >
                                <Edit3 size={14} />
                            </button>
                            <button 
                                onClick={() => onDeleteLine(line.id)}
                                disabled={!!isEditingId}
                                className="text-rose-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                                title="حذف"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Input Form Area - Clean Dashboard Style */}
      <div id="draft-area" className="border-t border-slate-100 bg-white p-3 md:p-5 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.05)] z-20 flex-shrink-0 relative">
        {/* Header Indicator */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-0.5 rounded-t-lg border-t border-x border-slate-100 shadow-sm hidden md:block">
            <span className={`text-[10px] font-bold ${isEditingId ? 'text-orange-500' : 'text-emerald-600'}`}>
                {isEditingId ? '• جاري تعديل السطر •' : '• إضافة سطر جديد •'}
            </span>
        </div>
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-3 md:hidden">
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isEditingId ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                <h3 className="text-xs font-bold text-slate-700">
                    {isEditingId ? 'تعديل السطر' : 'إضافة سطر جديد'}
                </h3>
            </div>
             {isEditingId && (
                <button onClick={handleCancelEdit} className="text-[10px] text-rose-500 font-medium px-2 py-1 bg-rose-50 rounded-md">إلغاء التعديل</button>
            )}
        </div>

        <div className="space-y-3 md:space-y-3" onKeyDown={handleKeyDown}>
            
            {/* --- DESKTOP LAYOUT (2 Rows) --- */}
            <div className="hidden md:grid grid-cols-12 gap-3">
                {/* Row 1: The Core Data */}
                <div className="col-span-2">
                    <div className="relative group">
                        <Calendar size={13} className={iconClass} />
                        <input type="date" className={`${inputClass} pl-2 pr-8`} value={draft.date} onChange={e => handleDraftChange('date', e.target.value)} />
                    </div>
                </div>
                
                <div className="col-span-2">
                    <div className="relative group">
                        <Tag size={13} className={iconClass} />
                         <select className={`${inputClass} pl-2 pr-8 appearance-none`} value={draft.reason} onChange={e => handleDraftChange('reason', e.target.value as ExpenseReason)}>
                            {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                <div className="col-span-3">
                    <div className="relative group">
                        <Building2 size={13} className={iconClass} />
                        <input type="text" placeholder="الشركة / المورد *" className={`${inputClass} pl-2 pr-8`} value={draft.company} onChange={e => handleDraftChange('company', e.target.value)} />
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="relative group">
                        <Hash size={13} className={iconClass} />
                        <input type="text" placeholder="الرقم الضريبي" className={`${inputClass} pl-2 pr-8 font-mono`} value={draft.tax_number} onChange={e => handleDraftChange('tax_number', e.target.value)} />
                    </div>
                </div>

                <div className="col-span-2">
                    <div className="relative group">
                        <Hash size={13} className={iconClass} />
                        <input type="text" placeholder="رقم الفاتورة" className={`${inputClass} pl-2 pr-8 font-mono`} value={draft.invoice_number} onChange={e => handleDraftChange('invoice_number', e.target.value)} />
                    </div>
                </div>
                 
                 {/* Empty Col to fill grid if needed, or Button location? */}
                 <div className="col-span-1 flex items-end">
                      {isEditingId && (
                        <button onClick={handleCancelEdit} className="w-full h-9 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">إلغاء</button>
                      )}
                 </div>

                 {/* Row 2: Details & Amount & Action */}
                 <div className="col-span-4">
                    <div className="relative group">
                        <FileText size={13} className={iconClass} />
                        <input type="text" placeholder="البيان (شرح المصروف) *" className={`${inputClass} pl-2 pr-8`} value={draft.description} onChange={e => handleDraftChange('description', e.target.value)} />
                    </div>
                 </div>

                 <div className="col-span-2">
                    <div className="relative group">
                        <User size={13} className={iconClass} />
                        <input type="text" placeholder="اسم المشتري" className={`${inputClass} pl-2 pr-8`} value={draft.buyer_name} onChange={e => handleDraftChange('buyer_name', e.target.value)} />
                    </div>
                 </div>

                 <div className="col-span-1">
                    <div className="relative group">
                        <CreditCard size={13} className={iconClass} />
                        <input type="number" placeholder="رسوم" className={`${inputClass} pl-1 pr-7`} value={draft.bank_fees || ''} onChange={e => handleDraftChange('bank_fees', parseFloat(e.target.value))} />
                    </div>
                 </div>

                 <div className="col-span-2">
                     <input type="text" placeholder="ملاحظات..." className={inputClass} value={draft.notes} onChange={e => handleDraftChange('notes', e.target.value)} />
                 </div>

                 <div className="col-span-2">
                    <div className="relative group">
                        <span className="absolute top-2 left-2 text-[10px] text-slate-400 font-bold">ر.س</span>
                        <input type="number" placeholder="المبلغ *" className={`${inputClass} pl-8 text-blue-700 font-bold`} value={draft.amount || ''} onChange={e => handleDraftChange('amount', parseFloat(e.target.value))} />
                    </div>
                 </div>

                 <div className="col-span-1">
                    <button 
                        onClick={handleSubmitDraft}
                        className={`w-full h-9 rounded-lg text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center active:scale-95 ${
                            isEditingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        title={isEditingId ? 'حفظ التعديلات' : 'إضافة'}
                    >
                        {isEditingId ? <ArrowUpCircle size={18}/> : <Plus size={20}/>}
                    </button>
                 </div>
            </div>

            {/* --- MOBILE LAYOUT (Compact Grid) --- */}
            <div className="md:hidden grid grid-cols-12 gap-2">
                {/* Row 1: Amount & Reason */}
                <div className="col-span-5">
                    <div className="relative">
                         <span className="absolute top-2.5 left-2.5 text-[10px] text-slate-400 font-bold">ر.س</span>
                        <input type="number" placeholder="المبلغ" className={`${inputClass} h-10 pl-8 font-bold text-blue-700`} value={draft.amount || ''} onChange={e => handleDraftChange('amount', parseFloat(e.target.value))} />
                    </div>
                </div>
                <div className="col-span-7">
                    <select className={`${inputClass} h-10`} value={draft.reason} onChange={e => handleDraftChange('reason', e.target.value as ExpenseReason)}>
                        {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {/* Row 2: Company & Date */}
                <div className="col-span-8">
                    <input type="text" placeholder="الشركة / المورد *" className={inputClass} value={draft.company} onChange={e => handleDraftChange('company', e.target.value)} />
                </div>
                 <div className="col-span-4">
                     <input type="date" className={`${inputClass} px-1 text-[10px] text-center`} value={draft.date} onChange={e => handleDraftChange('date', e.target.value)} />
                 </div>

                {/* Row 3: Tax & Invoice */}
                <div className="col-span-6">
                    <input type="text" placeholder="الرقم الضريبي" className={`${inputClass} font-mono`} value={draft.tax_number} onChange={e => handleDraftChange('tax_number', e.target.value)} />
                </div>
                <div className="col-span-6">
                    <input type="text" placeholder="رقم الفاتورة" className={`${inputClass} font-mono`} value={draft.invoice_number} onChange={e => handleDraftChange('invoice_number', e.target.value)} />
                </div>

                {/* Row 4: Description */}
                <div className="col-span-12">
                    <input type="text" placeholder="البيان (شرح المصروف) *" className={inputClass} value={draft.description} onChange={e => handleDraftChange('description', e.target.value)} />
                </div>

                {/* Row 5: Extras (Buyer, Fees, Notes) */}
                <div className="col-span-5">
                    <input type="text" placeholder="المشتري" className={inputClass} value={draft.buyer_name} onChange={e => handleDraftChange('buyer_name', e.target.value)} />
                </div>
                 <div className="col-span-3">
                    <input type="number" placeholder="رسوم" className={`${inputClass} px-2 text-center`} value={draft.bank_fees || ''} onChange={e => handleDraftChange('bank_fees', parseFloat(e.target.value))} />
                </div>
                <div className="col-span-4">
                     <input type="text" placeholder="ملاحظات" className={inputClass} value={draft.notes} onChange={e => handleDraftChange('notes', e.target.value)} />
                </div>

                {/* Row 6: Submit */}
                <div className="col-span-12 mt-1">
                     <button 
                        onClick={handleSubmitDraft}
                        className={`w-full h-10 rounded-lg text-white font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all ${
                            isEditingId ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                    >
                        {isEditingId ? <ArrowUpCircle size={18}/> : <Plus size={18}/>}
                        {isEditingId ? 'تحديث السطر' : 'إضافة سطر جديد'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};