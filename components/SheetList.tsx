import React, { useState } from 'react';
import { Sheet, SheetStatus } from '../types';
import { Search, FileText, PlusCircle, RefreshCw, FolderOpen, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';

interface SheetListProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSelectSheet: (sheet: Sheet) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  onDeleteSheet: (sheetId: string) => void;
  isAdmin: boolean;
}

export const SheetList: React.FC<SheetListProps> = ({
  sheets,
  activeSheetId,
  onSelectSheet,
  onRefresh,
  onCreateNew,
  onDeleteSheet,
  isAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSheets = sheets.filter(sheet =>
    sheet.custody_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="p-3 md:p-4 border-b border-slate-50 bg-white">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <h2 className="font-bold text-slate-700 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
            <FolderOpen size={16} className="text-blue-600 md:w-[18px] md:h-[18px]" />
            العهد السابقة
          </h2>
          <div className="flex gap-1">
            <button onClick={onRefresh} className="p-1 md:p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors" title="تحديث">
              <RefreshCw size={14} className="md:w-[16px] md:h-[16px]" />
            </button>
            <button onClick={onCreateNew} className="p-1 md:p-1.5 hover:bg-blue-50 rounded-md text-blue-500 hover:text-blue-600 transition-colors" title="عهدة جديدة">
              <PlusCircle size={14} className="md:w-[16px] md:h-[16px]" />
            </button>
          </div>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="بحث برقم العهدة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-2.5 pr-8 py-1.5 md:pl-3 md:pr-9 md:py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] md:text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-400"
          />
          <Search className="absolute right-2.5 md:right-3 top-2 md:top-2.5 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={13} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 md:p-3 space-y-1.5 md:space-y-2 bg-white">
        {filteredSheets.length === 0 ? (
          <div className="text-center py-10 text-slate-300 text-xs">
            لا توجد عهد محفوظة
          </div>
        ) : (
          filteredSheets.map(sheet => {
            const totalSpent = sheet.lines.reduce((sum, line) => sum + line.amount + (line.bank_fees || 0), 0);
            const remaining = sheet.custody_amount - totalSpent;

            return (
              <div
                key={sheet.id}
                onClick={() => onSelectSheet(sheet)}
                className={`p-2.5 md:p-3 rounded-lg border cursor-pointer transition-all group relative ${activeSheetId === sheet.id
                  ? 'bg-blue-50 border-blue-100 ring-1 ring-blue-500/10'
                  : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm'
                  }`}
              >
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('هل أنت متأكد من حذف هذه العهدة؟ ستفقد جميع البيانات والفواتير المدخلة فيها ولا يمكن التراجع عن هذا الإجراء.')) {
                        onDeleteSheet(sheet.id);
                      }
                    }}
                    className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition duration-200 opacity-0 group-hover:opacity-100"
                    title="حذف العهدة بالكامل"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="flex justify-between items-start mb-1 md:mb-1.5">
                  <span className={`font-semibold text-xs md:text-sm truncate transition-colors ${activeSheetId === sheet.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'} ${isAdmin ? 'pl-6' : ''}`}>{sheet.custody_number}</span>
                  <span className={`text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full font-medium ${sheet.status === SheetStatus.OPEN ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {sheet.status === SheetStatus.OPEN ? 'مفتوحة' : 'مغلقة'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">
                  <div className="flex items-center gap-1">
                    <FileText size={11} className="md:w-[12px] md:h-[12px]" />
                    <span>{sheet.lines.length}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] md:text-[9px] text-slate-400 mb-0 md:mb-0.5 font-bold">المتبقي:</span>
                    <span className={`font-mono font-medium ${remaining < 0 ? 'text-rose-600' :
                      remaining === 0 ? 'text-slate-500' :
                        (activeSheetId === sheet.id ? 'text-emerald-600' : 'text-emerald-500')
                      }`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};