import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  Clock,
  FileText,
  Plus,
  CheckCircle2,
  Sparkles,
  Search,
  Check,
  X,
  Trash2,
  Copy,
  Zap,
  Edit3
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

const RECIPIENT_GROUPS = [
  'All School Parents',
  'All Enrolled Students',
  'All Teachers & Staff',
  'Class 10 (All Sections)',
  'Class 9 (All Sections)',
  'Class 8 (All Sections)',
  'Class 11 & 12 Science Stream',
  'Custom Phone List'
];

const CommunicationCenterView = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('compose'); // 'compose', 'logs', 'templates'

  // Logs State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: 'General',
    subject: '',
    body: ''
  });

  // Compose Message Form State
  const [composeData, setComposeData] = useState({
    channel: 'WhatsApp',
    recipientGroup: 'All School Parents',
    customRecipients: '',
    subject: '',
    messageBody: '',
    isScheduled: false,
    scheduledDateTime: ''
  });

  const [notificationMsg, setNotificationMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await api.get('/communication/templates');
      setTemplates(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch WhatsApp templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get('/communication/logs');
      setLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch WhatsApp logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Handle Quick Template Select
  const handleApplyTemplate = (tpl) => {
    setComposeData({
      ...composeData,
      channel: 'WhatsApp',
      subject: tpl.subject || '',
      messageBody: tpl.body || ''
    });
    setActiveTab('compose');
    setNotificationMsg(`WhatsApp Template "${tpl.title}" applied to compose window!`);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  // Handle Send / Broadcast WhatsApp Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeData.messageBody.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post('/communication/send', {
        recipient_group: composeData.recipientGroup === 'Custom Phone List' && composeData.customRecipients
          ? `Custom (${composeData.customRecipients})`
          : composeData.recipientGroup,
        subject: composeData.subject.trim(),
        message_body: composeData.messageBody.trim(),
        is_scheduled: composeData.isScheduled,
        scheduled_time: composeData.scheduledDateTime,
      });

      setNotificationMsg(
        composeData.isScheduled
          ? `WhatsApp broadcast scheduled successfully for ${composeData.scheduledDateTime}!`
          : `WhatsApp broadcast sent successfully to ${composeData.recipientGroup}!`
      );

      setComposeData({
        channel: 'WhatsApp',
        recipientGroup: 'All School Parents',
        customRecipients: '',
        subject: '',
        messageBody: '',
        isScheduled: false,
        scheduledDateTime: ''
      });

      fetchLogs();
      setTimeout(() => setNotificationMsg(''), 4500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch WhatsApp message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save New WhatsApp Template
  const handleCreateTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!newTemplate.title.trim() || !newTemplate.body.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post('/communication/templates', {
        title: newTemplate.title.trim(),
        category: newTemplate.category.trim() || 'General',
        subject: newTemplate.subject.trim(),
        body: newTemplate.body.trim(),
      });

      setShowCreateTemplateModal(false);
      setNotificationMsg(`WhatsApp template "${newTemplate.title}" saved to database!`);
      setNewTemplate({ title: '', category: 'General', subject: '', body: '' });
      fetchTemplates();
      setTimeout(() => setNotificationMsg(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Template
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/communication/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setNotificationMsg('Template deleted successfully.');
      setTimeout(() => setNotificationMsg(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete template.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <MessageCircle className="w-6 h-6" />
            </div>
            WhatsApp Communication Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Send instant WhatsApp broadcasts, manage scheduled dispatches, and save reusable WhatsApp templates.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'compose'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Compose WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Broadcast Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Saved Templates ({templates.length})
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {notificationMsg}
        </div>
      )}

      {/* --- TAB 1: COMPOSE WHATSAPP BROADCAST --- */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Main Compose Window */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Compose WhatsApp Message / Notice
              </h2>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Channel: WhatsApp Only
              </span>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Target Recipient Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Select Target Recipient Group *
                  </label>
                  <select
                    value={composeData.recipientGroup}
                    onChange={(e) => setComposeData({ ...composeData, recipientGroup: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    {RECIPIENT_GROUPS.map(rg => <option key={rg} value={rg}>{rg}</option>)}
                  </select>
                </div>

                {composeData.recipientGroup === 'Custom Phone List' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Custom Phone Numbers (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210, +91 9123456789"
                      value={composeData.customRecipients}
                      onChange={(e) => setComposeData({ ...composeData, customRecipients: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Subject Header */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subject Header / Topic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Important Announcement regarding Upcoming Examinations"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  WhatsApp Message Body *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type your WhatsApp broadcast message content here..."
                  value={composeData.messageBody}
                  onChange={(e) => setComposeData({ ...composeData, messageBody: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Schedule Checkbox */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={composeData.isScheduled}
                    onChange={(e) => setComposeData({ ...composeData, isScheduled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-extrabold text-slate-800 text-xs">Schedule WhatsApp Broadcast for Future Date & Time</span>
                </label>

                {composeData.isScheduled && (
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      required={composeData.isScheduled}
                      value={composeData.scheduledDateTime}
                      onChange={(e) => setComposeData({ ...composeData, scheduledDateTime: e.target.value })}
                      className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Processing...' : composeData.isScheduled ? 'Schedule WhatsApp' : 'Send WhatsApp Broadcast Now'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Quick Preset Templates */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Quick WhatsApp Templates</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </h3>

              {loadingTemplates ? (
                <p className="text-xs text-slate-400 font-medium text-center py-4">Loading saved templates...</p>
              ) : templates.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium text-center py-4">No saved WhatsApp templates found.</p>
              ) : (
                <div className="space-y-3">
                  {templates.slice(0, 5).map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900">{tpl.title}</span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">
                          {tpl.category || 'General'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{tpl.body}</p>
                      <button
                        onClick={() => handleApplyTemplate(tpl)}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-extrabold text-[10px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" /> Apply Template
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SCHEDULED & SENT LOGS --- */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">WhatsApp Broadcast History & Dispatch Logs</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time database record of dispatched WhatsApp broadcasts and scheduled queues.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl">
              Total Logs: {logs.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient Group</th>
                  <th className="py-3 px-4">Subject / Header</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Dispatch / Scheduled Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loadingLogs ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">
                      Loading broadcast logs from database...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">
                      No WhatsApp broadcast logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {l.channel || 'WhatsApp'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {l.recipient_group || l.recipientGroup} <span className="text-[10px] font-semibold text-slate-400">({l.recipient_count || l.recipientCount || 0} recipients)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {l.subject || '(No Subject Header)'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-600">{l.sender_name || l.sender || 'Admin'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {l.created_at ? new Date(l.created_at).toLocaleString() : l.timestamp || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          l.status === 'Delivered' || l.status === 'Sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: SAVED WHATSAPP TEMPLATES --- */}
      {activeTab === 'templates' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200/80">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">WhatsApp Message Template Library</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Persistent database templates for recurring WhatsApp notices and alerts.</p>
            </div>
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New WhatsApp Template
            </button>
          </div>

          {loadingTemplates ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">Loading templates from database...</p>
          ) : templates.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">No WhatsApp templates stored in the database.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div key={tpl.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3 hover:border-emerald-300 transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900">{tpl.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[10px]">
                          WhatsApp • {tpl.category || 'General'}
                        </span>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {tpl.subject && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Subject Header</span>
                        <p className="text-xs font-bold text-slate-800">{tpl.subject}</p>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Body Content</span>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{tpl.body}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Use in Compose
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create New WhatsApp Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" /> Save New WhatsApp Template
              </h3>
              <button onClick={() => setShowCreateTemplateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplateSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Overdue Fee Reminder Notice"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Finance, Attendance, General"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1">Subject Header / Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Fee Payment Due Reminder"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1">Body Content (Use placeholders like {'{Student_Name}'}) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write WhatsApp template body content..."
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Template to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenterView;
