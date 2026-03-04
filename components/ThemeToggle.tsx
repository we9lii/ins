import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-1.5 rounded-md hover:bg-white/10 transition-all duration-300 group"
            title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
            aria-label="تبديل الوضع"
        >
            <div className="relative w-4 h-4 md:w-[18px] md:h-[18px]">
                {/* Sun icon */}
                <Sun
                    size={16}
                    className={`absolute inset-0 text-amber-300 transition-all duration-500 md:w-[18px] md:h-[18px] ${isDark
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100'
                        }`}
                />
                {/* Moon icon */}
                <Moon
                    size={16}
                    className={`absolute inset-0 text-blue-300 transition-all duration-500 md:w-[18px] md:h-[18px] ${isDark
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    );
};
