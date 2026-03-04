import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRole, createUser, updateUser, deleteUser, UserRow } from '../services/userService';
import { Shield, User, Clock, Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

interface UserManagementProps {
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onShowToast }) => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Employee', password: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { setLoading(true); const data = await getUsers(); setUsers(data); }
    catch { onShowToast('حدث خطأ أثناء جلب المستخدمين', 'error'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try { setUpdatingId(userId); await updateUserRole(userId, newRole); onShowToast('تم تحديث الصلاحية بنجاح', 'success'); await loadUsers(); }
    catch { onShowToast('فشل تحديث الصلاحية', 'error'); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try { setUpdatingId(userId); await deleteUser(userId); onShowToast('تم حذف المستخدم بنجاح', 'success'); await loadUsers(); }
    catch (error: any) { onShowToast(error.message || 'فشل حذف المستخدم', 'error'); }
    finally { setUpdatingId(null); }
  };

  const openAddModal = () => { setEditingUser(null); setFormData({ name: '', email: '', role: 'Employee', password: '' }); setIsModalOpen(true); };
  const openEditModal = (user: UserRow) => { setEditingUser(user); setFormData({ name: user.name, email: user.email, role: user.role, password: '' }); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) { await updateUser(editingUser.id, formData); onShowToast('تم تحديث بيانات المستخدم', 'success'); }
      else { if (!formData.password) return onShowToast('كلمة المرور مطلوبة', 'error'); await createUser(formData); onShowToast('تم إضافة المستخدم بنجاح', 'success'); }
      setIsModalOpen(false); await loadUsers();
    } catch (error: any) { onShowToast(error.message || 'حدث خطأ أثناء حفظ البيانات', 'error'); }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-700 m-2">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  const inputCls = "w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg p-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden relative m-2">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">إدارة الصلاحيات والمستخدمين</h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">التحكم في وصول الموظفين والمدراء للنظام</p>
          </div>
        </div>
        <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus size={16} /> إضافة مستخدم
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 sticky top-0 z-10 shadow-sm dark:shadow-none">
            <tr>
              <th className="px-4 md:px-6 py-3 font-semibold">الاسم</th>
              <th className="px-4 md:px-6 py-3 font-semibold">اسم المستخدم</th>
              <th className="px-4 md:px-6 py-3 font-semibold">تاريخ الانضمام</th>
              <th className="px-4 md:px-6 py-3 font-semibold">الصلاحية</th>
              <th className="px-4 md:px-6 py-3 font-semibold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 md:px-6 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap" dir="ltr">{user.email}</td>
                <td className="px-4 md:px-6 py-3 text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Clock size={14} className="shrink-0" />
                    <span className="text-xs">{new Date(user.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} disabled={updatingId === user.id}
                      className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none transition disabled:opacity-50">
                      <option value="Employee">موظف عادي</option>
                      <option value="TeamLead">رئيس قسم</option>
                      <option value="Admin">مدير نظام</option>
                    </select>
                    {updatingId === user.id && <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEditModal(user)} className="p-1.5 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition" title="تعديل">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} disabled={updatingId === user.id} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">الاسم</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">اسم المستخدم (للدخول)</label>
                <input type="text" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">الصلاحية</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className={inputCls}>
                  <option value="Employee">موظف عادي</option>
                  <option value="TeamLead">رئيس قسم</option>
                  <option value="Admin">مدير نظام</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  كلمة المرور
                  {editingUser && <span className="text-slate-400 dark:text-slate-500 font-normal pr-2">(اتركه فارغاً إذا لم ترد تغييره)</span>}
                </label>
                <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={inputCls} dir="ltr" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition">
                  {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
