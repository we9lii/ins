import React from 'react';
import { WifiOff, User, Wallet } from 'lucide-react';
import { UserInfo } from '../types';

interface ConnectionBarProps {
  isOnline: boolean;
  user: UserInfo;
}

export const ConnectionBar: React.FC<ConnectionBarProps> = ({ isOnline, user }) => {
  return (
    <div className="bg-slate-900 text-white text-[10px] md:text-xs py-1.5 px-3 flex justify-between items-center shadow-md min-h-[40px] md:min-h-[50px]">
      <div className="flex items-center gap-3 md:gap-4">
        {/* App Logo */}
        <div className="flex items-center gap-2 select-none pt-1 shrink-0">
          <img
            src="https://i.postimg.cc/jq8ngP2f/An.png"
            alt="Logo"
            className="h-6 md:h-8 object-contain"
          />
          <span className="hidden sm:inline font-bold text-xs md:text-sm text-white tracking-wider">نظام المصروفات العمومية و الإدارية</span>
        </div>

        {!isOnline && (
          <div className="flex items-center gap-1.5 text-rose-300 bg-rose-950/50 px-2 py-1 rounded-md border border-rose-900/50 animate-pulse">
            <WifiOff size={12} />
            <span className="font-medium">غير متصل</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-300">
        <div className="text-right leading-tight">
          <p className="font-bold text-white text-[11px] md:text-xs">{user.name}</p>
          <p className="text-[9px] md:text-[10px] text-slate-400 opacity-80 hidden md:block">{user.role}</p>
        </div>
        <div className="bg-slate-800 p-1.5 md:p-2 rounded-full border border-slate-700 shadow-sm">
          <User size={14} className="text-slate-200" />
        </div>
      </div>
    </div>
  );
};