import React, { useMemo } from 'react';
import { Sheet, ExpenseReason } from '../types';
import { formatCurrency } from '../utils';
import { Save, Lock, Download, PieChart, MoreVertical } from 'lucide-react';
import { REASON_COLORS } from '../constants';

interface SheetHeaderProps {
  sheet: Sheet;
  onUpdateSheet: (updated: Sheet) => void;
  onSave: () => void;
  onExport: () => void;
  isSaving: boolean;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  sheet,
  onUpdateSheet,
  onSave,
  onExport,
  isSaving
}) => {
  const totalSpent = sheet.lines.reduce((sum, line) => sum + line.amount + (line.bank_fees || 0), 0);
  const remaining = sheet.custody_amount - totalSpent;
  const progress = sheet.custody_amount > 0 ? (totalSpent / sheet.custody_amount) * 100 : 0;

  // Calculate analytics
  const analytics = useMemo(() => {
    const breakdown: Record<string, number> = {};
    sheet.lines.forEach(line => {
      breakdown[line.reason] = (breakdown[line.reason] || 0) + line.amount + (line.bank_fees || 0);
    });

    // Sort by amount desc
    return Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, amount]) => ({
        reason: reason as ExpenseReason,
        amount,
        percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      }));
  }, [sheet.lines, totalSpent]);

  const handleChange = (field: keyof Sheet, value: any) => {
    onUpdateSheet({ ...sheet, [field]: value });
  };

  const remainingColor = remaining < 0
    ? 'text-rose-600 bg-rose-50 border-rose-100'
    : remaining < (sheet.custody_amount * 0.2)
      ? 'text-amber-600 bg-amber-50 border-amber-100'
      : 'text-emerald-600 bg-emerald-50 border-emerald-100';

  const getBgColor = (reason: ExpenseReason) => {
    const classes = REASON_COLORS[reason] || '';
    const bgClass = classes.split(' ').find(c => c.startsWith('bg-'));
    return bgClass ? bgClass.replace('bg-', 'bg-').replace('-50', '-500') : 'bg-slate-400';
  };

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 p-2 md:p-3 mb-1.5 md:mb-2 transition-all relative overflow-hidden">

      {/* Mobile Design: Very Compact */}
      <div className="md:hidden">
        {/* Row 1: Title Input + Action Icons */}
        <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-50">
          <input
            type="text"
            value={sheet.custody_number}
            onChange={(e) => handleChange('custody_number', e.target.value)}
            className="flex-1 bg-transparent border-none p-0 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:ring-0"
            placeholder="اسم العهدة..."
          />
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              className="p-1 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"
              title="تصدير"
            >
              <Download size={13} />
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`p-1 rounded-full text-white shadow-sm transition-all ${isSaving ? 'bg-slate-300' : 'bg-blue-600 active:scale-90'}`}
              title="حفظ"
            >
              {isSaving ? <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" /> : <Save size={13} />}
            </button>
          </div>
        </div>

        {/* Row 2: The "Scoreboard" Grid - 3 Columns */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {/* Col 1: Limit (Editable) */}
          <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100 flex flex-col justify-center text-center">
            <span className="text-[8px] text-slate-400 font-medium mb-0.5 whitespace-nowrap">مبلغ العهدة</span>
            <input
              type="number"
              value={sheet.custody_amount || ''}
              onChange={(e) => handleChange('custody_amount', parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent border-none p-0 text-center font-mono font-bold text-[10px] text-slate-700 focus:ring-0 placeholder:text-slate-300"
              placeholder="0"
            />
          </div>

          {/* Col 2: Spent (Readonly) */}
          <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100 flex flex-col justify-center text-center">
            <span className="text-[8px] text-slate-400 font-medium mb-0.5 whitespace-nowrap">المنصرف</span>
            <span className="font-mono font-bold text-[10px] text-slate-600">
              {formatCurrency(totalSpent).replace('ر.س', '')}
            </span>
          </div>

          {/* Col 3: Remaining (Readonly - Highlighted) */}
          <div className={`rounded-lg p-1.5 border flex flex-col justify-center text-center ${remainingColor}`}>
            <span className="text-[8px] opacity-80 font-medium mb-0.5 whitespace-nowrap">المتبقي</span>
            <span className="font-mono font-bold text-[10px]">
              {formatCurrency(remaining).replace('ر.س', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Design (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-start">
        {/* Form Inputs */}
        <div className="col-span-5 grid grid-cols-2 gap-2">
          <div className="col-span-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">العهدة</label>
            <input
              type="text"
              value={sheet.custody_number}
              onChange={(e) => handleChange('custody_number', e.target.value)}
              className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm"
              placeholder="اسم العهدة"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">المبلغ</label>
            <input
              type="number"
              value={sheet.custody_amount || ''}
              onChange={(e) => handleChange('custody_amount', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-2 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono font-medium text-slate-700 placeholder:text-slate-300 text-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="col-span-4 grid grid-cols-2 gap-2">
          <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-[11px] font-medium text-slate-400 mb-0.5">المنصرف</p>
            <p className="text-lg font-bold text-slate-700 font-mono tracking-tight">{formatCurrency(totalSpent)}</p>
          </div>
          <div className={`p-2 rounded-lg border shadow-sm flex flex-col justify-center ${remainingColor}`}>
            <div className="flex justify-between items-center mb-0.5">
              <p className="text-[11px] font-medium opacity-80">المتبقي</p>
            </div>
            <p className="text-lg font-bold font-mono tracking-tight">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-3 flex justify-between h-full gap-2">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 px-3 rounded-lg shadow-sm transition-all text-sm font-semibold disabled:opacity-70"
          >
            {isSaving ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
            <span>حفظ</span>
          </button>

          <div className="flex gap-2 flex-1">
            <button
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-1.5 px-2 rounded-lg text-xs font-medium transition-all"
            >
              <Download size={14} />
              <span>تصدير</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1 bg-white border border-slate-200 text-slate-400 py-1.5 px-2 rounded-lg text-xs font-medium cursor-not-allowed"
            >
              <Lock size={14} />
              <span>إغلاق</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Bar - Ultra Thin */}
      <div className="mt-1">
        <div className="h-1 md:h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {analytics.length > 0 ? (
            analytics.map((item) => (
              <div
                key={item.reason}
                className={`h-full ${getBgColor(item.reason)}`}
                style={{ width: `${item.percent}%` }}
              />
            ))
          ) : (
            <div className="w-0" />
          )}
        </div>
      </div>
    </div>
  );
};