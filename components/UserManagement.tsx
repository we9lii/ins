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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Employee', password: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      onShowToast('حدث خطأ أثناء جلب المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      await updateUserRole(userId, newRole);
      onShowToast('تم تحديث الصلاحية بنجاح', 'success');
      await loadUsers();
    } catch (error) {
      onShowToast('فشل تحديث الصلاحية', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      setUpdatingId(userId);
      await deleteUser(userId);
      onShowToast('تم حذف المستخدم بنجاح', 'success');
      await loadUsers();
    } catch (error: any) {
      onShowToast(error.message || 'فشل حذف المستخدم', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Employee', password: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        onShowToast('تم تحديث بيانات المستخدم', 'success');
      } else {
        if (!formData.password) return onShowToast('كلمة المرور مطلوبة', 'error');
        await createUser(formData);
        onShowToast('تم إضافة المستخدم بنجاح', 'success');
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (error: any) {
      onShowToast(error.message || 'حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 m-2">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative m-2">
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">إدارة الصلاحيات والمستخدمين</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">التحكم في وصول الموظفين والمدراء للنظام</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          إضافة مستخدم
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 md:px-6 py-3 font-semibold">الاسم</th>
              <th className="px-4 md:px-6 py-3 font-semibold">اسم المستخدم</th>
              <th className="px-4 md:px-6 py-3 font-semibold">تاريخ الانضمام</th>
              <th className="px-4 md:px-6 py-3 font-semibold">الصلاحية</th>
              <th className="px-4 md:px-6 py-3 font-semibold text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 md:px-6 py-3">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700 whitespace-nowrap">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3 text-slate-500 whitespace-nowrap" dir="ltr">
                  {user.email}
                </td>
                <td className="px-4 md:px-6 py-3 text-slate-500">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Clock size={14} className="shrink-0" />
                    <span className="text-xs">{new Date(user.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none transition disabled:opacity-50"
                    >
                      <option value="Employee">موظف عادي</option>
                      <option value="TeamLead">رئيس قسم</option>
                      <option value="Admin">مدير نظام</option>
                    </select>
                    {updatingId === user.id && <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" />}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition"
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={updatingId === user.id}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">الاسم</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">اسم المستخدم (للدخول)</label>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">الصلاحية</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="Employee">موظف عادي</option>
                  <option value="TeamLead">رئيس قسم</option>
                  <option value="Admin">مدير نظام</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  كلمة المرور
                  {editingUser && <span className="text-slate-400 font-normal pr-2">(اتركه فارغاً إذا لم ترد تغييره)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  dir="ltr"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition"
                >
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
