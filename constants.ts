import { ExpenseReason } from './types';

export const API_BASE_URL = "https://api.company.com/v1";

export const REASON_COLORS: Record<ExpenseReason, string> = {
  [ExpenseReason.PROJECTS]: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  [ExpenseReason.ADMINISTRATION]: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
  [ExpenseReason.BRANCHES]: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-700/10',
  [ExpenseReason.LOGISTICS]: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-700/10',
  [ExpenseReason.MOVEMENT]: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
  [ExpenseReason.SERVICES]: 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-700/10',
  [ExpenseReason.WAREHOUSES]: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-700/10',
  [ExpenseReason.MISC]: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/10',
  [ExpenseReason.COMMUNICATION]: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-700/10',
  [ExpenseReason.FOOD]: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-700/10',
  [ExpenseReason.ACCOMMODATION]: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-700/10',
  [ExpenseReason.TECHNICAL]: 'bg-lime-50 text-lime-700 ring-1 ring-inset ring-lime-700/10',
  [ExpenseReason.OTHER]: 'bg-zinc-50 text-zinc-700 ring-1 ring-inset ring-zinc-700/10',
};

export const REASON_OPTIONS = Object.values(ExpenseReason);

export const DEFAULT_USER = {
  id: 'EMP-001',
  name: 'فيصل النتيفي',
  role: 'TeamLead'
} as const;