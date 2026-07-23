import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { isAdmin as checkIsAdmin } from '../../utils/roleUtils';
import {
  Megaphone,
  PlusCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  useGetNotices,
  useGetAdminNotices,
  useCreateNotice,
  useUpdateNotice,
  useTogglePublishNotice,
  useDeleteNotice
} from '../notices/useNotices';

const Noticeboard = () => {
  const { user } = useAuthStore();
  const isAdmin = checkIsAdmin(user);

  // Queries
  const { data: publicNoticesData, isLoading: publicLoading } = useGetNotices();
  const { data: adminNoticesData, isLoading: adminLoading } = useGetAdminNotices();

  // Mutations
  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const togglePublishMutation = useTogglePublishNotice();
  const deleteNoticeMutation = useDeleteNotice();

  // State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    notice_type: 'general',
    type: 'global',
    target_role: '',
    publish_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    is_published: 1,
  });

  const notices = isAdmin ? (adminNoticesData?.data || []) : (publicNoticesData?.data || []);
  const isLoading = isAdmin ? adminLoading : publicLoading;

  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      notice_type: 'general',
      type: 'global',
      target_role: '',
      publish_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      is_published: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title || '',
      content: notice.content || '',
      notice_type: notice.notice_type || 'general',
      type: notice.type || 'global',
      target_role: notice.target_role || '',
      publish_date: notice.publish_date ? notice.publish_date.split('T')[0] : new Date().toISOString().split('T')[0],
      expiry_date: notice.expiry_date ? notice.expiry_date.split('T')[0] : '',
      is_published: notice.is_published ? 1 : 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await updateNoticeMutation.mutateAsync({ id: editingNotice.id, payload: formData });
      } else {
        await createNoticeMutation.mutateAsync(formData);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save notice:', err);
    }
  };

  const handleTogglePublish = async (notice) => {
    try {
      await togglePublishMutation.mutateAsync({ id: notice.id, is_published: notice.is_published ? 0 : 1 });
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNoticeMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete notice:', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-xs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notice Board</h2>
            <p className="text-xs text-slate-500 font-semibold">Official announcements & academic updates</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20"
          >
            <PlusCircle className="w-4 h-4" /> New Notice
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm font-semibold animate-pulse">
          Loading notices...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`group p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                notice.is_published === 0
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {notice.notice_type || 'General'}
                    </span>
                    {notice.type === 'work' && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                        Work Notice
                      </span>
                    )}
                    {isAdmin && (
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                          notice.is_published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {notice.is_published ? 'Published' : 'Draft'}
                      </span>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleTogglePublish(notice)}
                        className={`p-1.5 rounded-lg border transition ${
                          notice.is_published
                            ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-100'
                            : 'text-slate-400 hover:bg-slate-100 border-slate-200'
                        }`}
                        title={notice.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {notice.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(notice)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition"
                        title="Edit Notice"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title & Body */}
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-4 whitespace-pre-wrap leading-relaxed mb-4">
                  {notice.content}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {notice.publish_date ? new Date(notice.publish_date).toLocaleDateString() : 'Today'}
                </span>
                {notice.published_by_name && (
                  <span className="truncate max-w-[120px]">By {notice.published_by_name}</span>
                )}
              </div>
            </div>
          ))}

          {notices.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No active notices available on the board.
            </div>
          )}
        </div>
      )}

      {/* Admin Notice Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual Sports Day Announcement"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter notice content details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.notice_type}
                    onChange={(e) => setFormData({ ...formData, notice_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="fee">Fee Notice</option>
                    <option value="exam">Exam Notice</option>
                    <option value="transport">Transport</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notice Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="global">Global (Notice Board)</option>
                    <option value="work">Work Notice (Student Feed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Role (Optional)</label>
                  <select
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="cashier">Cashier</option>
                    <option value="busstaff">Bus Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Publish Immediately</option>
                    <option value={0}>Save as Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNoticeMutation.isPending || updateNoticeMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {editingNotice ? 'Update Notice' : 'Create Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticeboard;
