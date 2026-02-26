export enum SheetStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum ExpenseReason {
  PROJECTS = 'مصاريف المشاريع',
  ADMINISTRATION = 'مصاريف الإدارة وأقسامها',
  BRANCHES = 'مصاريف الفروع',
  LOGISTICS = 'مصاريف الخدمات اللوجستية',
  MOVEMENT = 'مصاريف حركة الشركة',
  SERVICES = 'مصاريف الخدمات',
  WAREHOUSES = 'مصاريف المستودعات',
  MISC = 'مصاريف متنوعة',
  COMMUNICATION = 'مصاريف قسم الاتصال',
  FOOD = 'مصاريف مأكل ومشرب',
  ACCOMMODATION = 'مصاريف السكن',
  TECHNICAL = 'مصاريف فنية',
  OTHER = 'آخر'
}

export interface ExpenseLine {
  id: string;
  sheet_id: string;
  date: string; // YYYY-MM-DD
  company: string;
  tax_number?: string; // Added Tax Number
  invoice_number?: string;
  description: string;
  reason: ExpenseReason;
  amount: number;
  bank_fees?: number;
  buyer_name?: string;
  notes?: string;
  created_at: string;
}

export interface Sheet {
  id: string;
  custody_number: string;
  custody_amount: number;
  employee_id: string;
  status: SheetStatus;
  lines: ExpenseLine[];
  created_at: string;
  last_modified: string;
  notes?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  role: 'Admin' | 'Employee' | 'TeamLead';
}