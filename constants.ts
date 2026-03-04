import { ExpenseReason } from './types';

export const API_BASE_URL = "https://api.company.com/v1";

export const REASON_COLORS: Record<ExpenseReason, string> = {
  [ExpenseReason.PROJECTS]: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20',
  [ExpenseReason.ADMINISTRATION]: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 dark:ring-purple-400/20',
  [ExpenseReason.BRANCHES]: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-700/10 dark:ring-teal-400/20',
  [ExpenseReason.LOGISTICS]: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-700/10 dark:ring-orange-400/20',
  [ExpenseReason.MOVEMENT]: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/20',
  [ExpenseReason.SERVICES]: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 ring-1 ring-inset ring-cyan-700/10 dark:ring-cyan-400/20',
  [ExpenseReason.WAREHOUSES]: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-700/10 dark:ring-amber-400/20',
  [ExpenseReason.MISC]: 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-600/10 dark:ring-slate-400/20',
  [ExpenseReason.COMMUNICATION]: 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 ring-1 ring-inset ring-fuchsia-700/10 dark:ring-fuchsia-400/20',
  [ExpenseReason.FOOD]: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-700/10 dark:ring-rose-400/20',
  [ExpenseReason.ACCOMMODATION]: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-700/10 dark:ring-sky-400/20',
  [ExpenseReason.TECHNICAL]: 'bg-lime-50 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 ring-1 ring-inset ring-lime-700/10 dark:ring-lime-400/20',
  [ExpenseReason.OTHER]: 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 ring-1 ring-inset ring-zinc-700/10 dark:ring-zinc-400/20',
};

export const REASON_OPTIONS = Object.values(ExpenseReason);

export const DEFAULT_USER = {
  id: 'EMP-001',
  name: 'فيصل النتيفي',
  role: 'TeamLead'
} as const;