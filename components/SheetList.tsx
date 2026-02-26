import React, { useState } from 'react';
import { Sheet, SheetStatus } from '../types';
import { Search, FileText, PlusCircle, RefreshCw, FolderOpen } from 'lucide-react';
import { formatCurrency } from '../utils';

interface SheetListProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSelectSheet: (sheet: Sheet) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export const SheetList: React.FC<SheetListProps> = ({ 
  sheets, 
  activeSheetId, 
  onSelectSheet, 
  onRefresh,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSheets = sheets.filter(sheet => 
    sheet.custody_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-50 bg-white">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
            <FolderOpen size={18} className="text-blue-600" />
            العهد السابقة
          </h2>
          <div className="flex gap-1">
             <button onClick={onRefresh} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors" title="تحديث">
              <RefreshCw size={16} />
            </button>
            <button onClick={onCreateNew} className="p-1.5 hover:bg-blue-50 rounded-md text-blue-500 hover:text-blue-600 transition-colors" title="عهدة جديدة">
              <PlusCircle size={16} />
            </button>
          </div>
        </div>
        
        <div className="relative group">
          <input
            type="text"
            placeholder="بحث برقم العهدة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-400"
          />
          <Search className="absolute right-3 top-2.5 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={14} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white">
        {filteredSheets.length === 0 ? (
          <div className="text-center py-10 text-slate-300 text-xs">
            لا توجد عهد محفوظة
          </div>
        ) : (
          filteredSheets.map(sheet => (
            <div
              key={sheet.id}
              onClick={() => onSelectSheet(sheet)}
              className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                activeSheetId === sheet.id 
                  ? 'bg-blue-50 border-blue-100 ring-1 ring-blue-500/10' 
                  : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className={`font-semibold text-sm truncate transition-colors ${activeSheetId === sheet.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>{sheet.custody_number}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  sheet.status === SheetStatus.OPEN ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {sheet.status === SheetStatus.OPEN ? 'مفتوحة' : 'مغلقة'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1">
                  <FileText size={12} />
                  <span>{sheet.lines.length}</span>
                </div>
                <span className={`font-mono font-medium ${activeSheetId === sheet.id ? 'text-blue-600' : 'text-slate-500'}`}>
                  {formatCurrency(sheet.custody_amount)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};