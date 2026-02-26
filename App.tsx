import React, { useState, useEffect, useRef } from 'react';
import { Sheet, ExpenseLine, ExpenseReason } from './types';
import { getSheets, saveSheet, createNewSheet, checkHealth } from './services/expenseService';
import { DEFAULT_USER, REASON_OPTIONS } from './constants';
import { exportToCSV } from './utils';

import { ConnectionBar } from './components/ConnectionBar';
import { SheetList } from './components/SheetList';
import { SheetHeader } from './components/SheetHeader';
import { ExpenseTable } from './components/ExpenseTable';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { Filter, GripHorizontal, FileText, Menu, X, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterReason, setFilterReason] = useState<ExpenseReason | 'ALL'>('ALL');
  
  // Mobile UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Resizable Notes State
  const [notesHeight, setNotesHeight] = useState(100); 
  const isResizing = useRef(false);

  // Initial Load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSheets();
      const interval = setInterval(async () => {
          const status = await checkHealth();
          setIsOnline(status);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadSheets = async () => {
    const data = await getSheets();
    setSheets(data);
    if (activeSheet) {
        const updated = data.find(s => s.id === activeSheet.id);
        if (updated) setActiveSheet(updated);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setIsAuthenticated(false);
    setSheets([]);
    setActiveSheet(null);
  };

  // Toast Helpers
  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleCreateSheet = () => {
    const userInfoStr = localStorage.getItem('user_info');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : DEFAULT_USER;
    
    const newSheet = createNewSheet(`عهدة جديدة ${sheets.length + 1}`, 0, userInfo.id);
    setActiveSheet(newSheet);
    showToast('تم إنشاء مسودة عهدة جديدة', 'success');
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleSelectSheet = (sheet: Sheet) => {
    setActiveSheet(sheet);
    setFilterReason('ALL');
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleUpdateSheetHeader = (updated: Sheet) => {
    setActiveSheet(updated);
  };

  const handleSaveSheet = async () => {
    if (!activeSheet) return;
    setIsSaving(true);
    try {
        const saved = await saveSheet(activeSheet);
        await loadSheets();
        setActiveSheet(saved);
        showToast('تم حفظ العهدة بنجاح');
    } catch (error) {
        console.error("Save failed", error);
        showToast('فشل الحفظ. يرجى التحقق من الاتصال.', 'error');
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddLine = async (line: ExpenseLine) => {
      if (!activeSheet) return;
      const updatedSheet = {
          ...activeSheet,
          lines: [...activeSheet.lines, line]
      };
      setActiveSheet(updatedSheet);
      await saveSheet(updatedSheet);
      loadSheets();
      showToast('تم إضافة البند بنجاح');
  };

  const handleUpdateLine = async (updatedLine: ExpenseLine) => {
      if (!activeSheet) return;
      const updatedSheet = {
          ...activeSheet,
          lines: activeSheet.lines.map(l => l.id === updatedLine.id ? updatedLine : l)
      };
      setActiveSheet(updatedSheet);
      await saveSheet(updatedSheet);
      loadSheets();
      showToast('تم تحديث البند');
  };

  const handleDeleteLine = async (lineId: string) => {
      if (!activeSheet) return;
      if (!window.confirm("هل أنت متأكد من حذف هذا السطر؟")) return;
      
      const updatedSheet = {
          ...activeSheet,
          lines: activeSheet.lines.filter(l => l.id !== lineId)
      };
      setActiveSheet(updatedSheet);
      await saveSheet(updatedSheet);
      loadSheets();
      showToast('تم حذف البند', 'success');
  };

  // Resize Handler Logic
  const startResizing = (e: React.MouseEvent) => {
    isResizing.current = true;
    const startY = e.clientY;
    const startHeight = notesHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const newHeight = startHeight + (moveEvent.clientY - startY);
      if (newHeight >= 40 && newHeight <= 400) {
        setNotesHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'row-resize';
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
      {/* Header with Mobile Menu Toggle */}
      <div className="flex-shrink-0 relative z-20">
         <ConnectionBar isOnline={isOnline} />
         <div className="absolute top-1.5 left-3 flex items-center gap-2">
           <button 
              onClick={handleLogout}
              className="text-white p-1.5 rounded-md hover:bg-white/10 flex items-center gap-1 text-xs font-medium"
              title="تسجيل الخروج"
           >
              <LogOut size={16} />
              <span className="hidden md:inline">تسجيل الخروج</span>
           </button>
         </div>
         <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden absolute top-1.5 right-3 text-white p-1.5 rounded-md hover:bg-white/10"
         >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
         </button>
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Container - Adjusted Padding */}
      <main className="flex-1 flex overflow-hidden p-1.5 md:p-5 gap-2 md:gap-5 relative">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
            fixed inset-y-0 right-0 z-40 w-72 transform transition-transform duration-300 ease-in-out bg-white shadow-2xl md:translate-x-0 md:static md:w-64 md:shadow-none md:bg-transparent md:block
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full pt-14 md:pt-0"> {/* Padding top for mobile header */}
             <SheetList 
                sheets={sheets} 
                activeSheetId={activeSheet?.id || null} 
                onSelectSheet={handleSelectSheet}
                onRefresh={loadSheets}
                onCreateNew={handleCreateSheet}
             />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          {!activeSheet ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 m-2">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-inner">
                <Filter size={28} className="text-slate-300" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-600">اختر عهدة للبدء</h2>
              <p className="mt-2 text-xs md:text-sm text-slate-400 text-center px-4">أو افتح القائمة لاختيار عهدة سابقة</p>
              <button 
                onClick={handleCreateSheet}
                className="mt-6 md:mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-xs md:text-sm font-semibold"
              >
                إنشاء عهدة جديدة
              </button>
            </div>
          ) : (
            <>
              {/* Top Header (Compact on mobile) */}
              <div className="flex-shrink-0">
                <SheetHeader 
                    sheet={activeSheet}
                    onUpdateSheet={handleUpdateSheetHeader}
                    onSave={handleSaveSheet}
                    onExport={() => exportToCSV(activeSheet)}
                    isSaving={isSaving}
                />
                
                {/* Filter Tabs - Ultra Compact */}
                <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 custom-scrollbar px-1 min-h-[28px]">
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-1 uppercase tracking-wide">تصفية:</span>
                    <button
                        onClick={() => setFilterReason('ALL')}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
                            filterReason === 'ALL' 
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'bg-white border border-slate-200 text-slate-500'
                        }`}
                    >
                        الكل
                    </button>
                    {REASON_OPTIONS.map(reason => (
                        <button
                            key={reason}
                            onClick={() => setFilterReason(reason)}
                            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all whitespace-nowrap ${
                                filterReason === reason
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-500'
                            }`}
                        >
                            {reason}
                        </button>
                    ))}
                </div>
              </div>

              {/* Resizable Container (Flex Column) */}
              <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative">
                  
                  {/* Notes Pane (Hidden on Mobile) */}
                  <div 
                    style={{ height: notesHeight }} 
                    className="relative bg-slate-50/30 flex flex-col border-b border-slate-100 transition-colors hover:bg-slate-50/50 hidden md:flex"
                  >
                     <div className="absolute top-2 right-3 flex items-center gap-1.5 text-slate-400 pointer-events-none">
                        <FileText size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">ملاحظات العهدة العامة</span>
                     </div>
                     <textarea
                        value={activeSheet.notes || ''}
                        onChange={(e) => setActiveSheet({ ...activeSheet, notes: e.target.value })}
                        className="w-full h-full p-3 pt-8 bg-transparent text-sm text-slate-700 placeholder:text-slate-400/60 resize-none focus:outline-none focus:bg-white transition-colors"
                        placeholder="سجل هنا أي ملاحظات عامة تتعلق بالعهدة..."
                     />
                  </div>

                  {/* Resizer Handle (Desktop only) */}
                  <div 
                    onMouseDown={startResizing}
                    className="hidden md:flex h-3 bg-slate-50 border-y border-slate-100 cursor-row-resize items-center justify-center hover:bg-slate-200 transition-colors group z-10 flex-shrink-0 select-none"
                    title="سحب لتغيير الحجم"
                  >
                    <GripHorizontal size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>

                  {/* Table Pane */}
                  <div className="flex-1 min-h-0 bg-white flex flex-col">
                      <ExpenseTable 
                        sheet={activeSheet}
                        onAddLine={handleAddLine}
                        onUpdateLine={handleUpdateLine}
                        onDeleteLine={handleDeleteLine}
                        reasonFilter={filterReason}
                        showToast={showToast}
                      />
                  </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;