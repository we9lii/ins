import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password || (!isLogin && !name)) {
      setError('يرجى إدخال جميع الحقول المطلوبة');
      return;
    }
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email: username, password } : { name, email: username, password };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'حدث خطأ ما');
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full pl-3 md:pl-4 pr-10 md:pr-12 py-2.5 md:py-4 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-400/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm md:text-base";
  const iconCls = "absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-4 left-4 z-30 bg-slate-800 dark:bg-slate-700 rounded-lg p-0.5 shadow-lg">
        <ThemeToggle />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm md:max-w-md bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-4 sm:p-6 md:p-8 relative z-10">

        <div className="flex flex-col items-center mb-4 md:mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-12 mb-2 sm:w-32 sm:h-16 md:w-48 md:h-24 md:mb-6 relative">
            <img src="https://i.postimg.cc/jq8ngP2f/An.png" alt="شعار النظام" className="w-full h-full object-contain relative z-10 drop-shadow-md p-2" referrerPolicy="no-referrer" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2 font-sans text-center">
            نظام المصروفات العمومية و الإدارية
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-slate-500 dark:text-slate-400 text-xs md:text-sm text-center">
            {isLogin ? 'مرحباً بك مجدداً، يرجى تسجيل الدخول للمتابعة' : 'قم بإنشاء حساب جديد للبدء'}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs md:text-sm p-2 md:p-3 rounded-xl border border-red-100 dark:border-red-800 text-center">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 md:space-y-4">
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0, overflow: 'hidden' }} animate={{ opacity: 1, height: 'auto', overflow: 'visible' }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className="relative group">
                  <div className={iconCls}><User size={18} className="md:w-5 md:h-5" /></div>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="الاسم الكامل" dir="rtl" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="relative group">
              <div className={iconCls}><User size={18} className="md:w-5 md:h-5" /></div>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="اسم المستخدم" dir="ltr" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="relative group">
              <div className={iconCls}><Lock size={18} className="md:w-5 md:h-5" /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="كلمة المرور" dir="rtl" />
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center justify-between text-xs md:text-sm px-1">
            {isLogin ? (
              <>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600/20 transition-colors cursor-pointer" />
                  <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">تذكرني</span>
                </label>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">نسيت كلمة المرور؟</a>
              </>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">لديك حساب بالفعل؟</span>
            )}
          </motion.div>

          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} type="submit" disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg shadow-lg shadow-blue-600/30 dark:shadow-blue-900/40 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <><span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</span><ArrowRight size={18} className="rotate-180 md:w-5 md:h-5" /></>
            )}
          </motion.button>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-center">
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors">
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول لحساب موجود'}
            </button>
          </motion.div>
        </form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-4 md:mt-8 text-center text-[10px] md:text-sm text-slate-400 dark:text-slate-500">
          <p>نظام داخلي لإدارة العهد والمصروفات © 2026</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
