import React, { useState } from 'react';
import {
  Send,
  Mail,
  MessageSquare,
  MessageCircle,
  Clock,
  FileText,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Trash2,
  Copy,
  Zap,
  Edit3
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Initial Mock Scheduled / Sent Message Logs
const INITIAL_LOGS = [
  {
    id: 1,
    channel: 'WhatsApp',
    recipientGroup: 'Class 10 (Parents & Students)',
    subject: 'Mid-Term Examination Datesheet Announced',
    sender: 'Super Admin',
    timestamp: '2026-02-08 09:30 AM',
    scheduledTime: 'Instant',
    status: 'Delivered',
    recipientCount: 62
  },
  {
    id: 2,
    channel: 'Email',
    recipientGroup: 'All School Parents',
    subject: 'Annual Fee Payment Due Reminder - Term 2',
    sender: 'Accounts Office',
    timestamp: '2026-02-07 04:15 PM',
    scheduledTime: 'Instant',
    status: 'Sent',
    recipientCount: 450
  },
  {
    id: 3,
    channel: 'SMS',
    recipientGroup: 'Class 9 Section A',
    subject: 'Emergency Parent-Teacher Meeting tomorrow at 10 AM',
    sender: 'Class Teacher',
    timestamp: '2026-02-06 02:00 PM',
    scheduledTime: 'Instant',
    status: 'Delivered',
    recipientCount: 35
  },
  {
    id: 4,
    channel: 'Email',
    recipientGroup: 'All Faculty & Staff',
    subject: 'Staff General Assembly Meeting Notice',
    sender: 'Principal Office',
    timestamp: '2026-02-12 08:00 AM',
    scheduledTime: '2026-02-12 08:00 AM',
    status: 'Scheduled',
    recipientCount: 54
  }
];

// Pre-defined Email & SMS Templates
const INITIAL_TEMPLATES = [
  {
    id: 1,
    title: 'Fee Payment Due Reminder',
    category: 'Finance & Fees',
    channel: 'Email',
    subject: 'Reminder: Pending School Fee Payment for {Student_Name}',
    body: 'Dear Parent, This is a gentle reminder that the Term 2 school fee for your ward {Student_Name} (Class {Class_Name}) is due on {Due_Date}. Please log into the parent portal to pay online or visit the cashier desk.'
  },
  {
    id: 2,
    title: 'Attendance Alert (Absent Notice)',
    category: 'Attendance',
    channel: 'SMS',
    subject: 'Student Absence Notice',
    body: 'Notice: Your ward {Student_Name} of Class {Class_Name} is marked ABSENT today ({Date}). Please inform class teacher if this was unannounced.'
  },
  {
    id: 3,
    title: 'Emergency School Holiday Declaration',
    category: 'Announcements',
    channel: 'WhatsApp',
    subject: 'School Holiday Announcement',
    body: 'Dear Parents & Students, Thomson School will remain CLOSED on {Date} due to heavy weather conditions. Online revision material will be uploaded on the student portal.'
  },
  {
    id: 4,
    title: 'Parent-Teacher Meeting (PTM) Invitation',
    category: 'Events',
    channel: 'Email',
    subject: 'Invitation: Parent-Teacher Interactive Session',
    body: 'Respected Parent, You are cordially invited to attend the PTM scheduled for {Date} from 09:00 AM to 01:00 PM to discuss the mid-term academic progress of {Student_Name}.'
  }
];

const RECIPIENT_GROUPS = [
  'All School Parents',
  'All Enrolled Students',
  'All Teachers & Staff',
  'Class 10 (All Sections)',
  'Class 9 (All Sections)',
  'Class 8 (All Sections)',
  'Class 11 & 12 Science Stream',
  'Custom Phone / Email List'
];

const CommunicationCenterView = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('compose'); // 'compose', 'logs', 'templates'

  // Logs State
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [logFilterChannel, setLogFilterChannel] = useState('All');

  // Templates State
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: 'General',
    channel: 'Email',
    subject: '',
    body: ''
  });

  // Compose Message Form State
  const [composeData, setComposeData] = useState({
    channel: 'WhatsApp', // 'WhatsApp', 'Email', 'SMS'
    recipientGroup: 'All School Parents',
    customRecipients: '',
    subject: '',
    messageBody: '',
    isScheduled: false,
    scheduledDateTime: ''
  });

  const [notificationMsg, setNotificationMsg] = useState('');

  // Handle Quick Template Select
  const handleApplyTemplate = (tpl) => {
    setComposeData({
      ...composeData,
      channel: tpl.channel,
      subject: tpl.subject,
      messageBody: tpl.body
    });
    setActiveTab('compose');
    setNotificationMsg(`Template "${tpl.title}" applied to compose window!`);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  // Handle Send / Broadcast Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!composeData.messageBody.trim()) return;

    const newLog = {
      id: Date.now(),
      channel: composeData.channel,
      recipientGroup: composeData.recipientGroup,
      subject: composeData.subject || '(No Subject Header)',
      sender: user?.full_name || 'School Admin',
      timestamp: new Date().toLocaleString(),
      scheduledTime: composeData.isScheduled ? composeData.scheduledDateTime : 'Instant',
      status: composeData.isScheduled ? 'Scheduled' : 'Delivered',
      recipientCount: composeData.recipientGroup.includes('All') ? 450 : 35
    };

    setLogs([newLog, ...logs]);
    setNotificationMsg(
      composeData.isScheduled
        ? `Broadcast message scheduled successfully for ${composeData.scheduledDateTime}!`
        : `${composeData.channel} message sent successfully to ${composeData.recipientGroup}!`
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

    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Handle Save Template
  const handleCreateTemplateSubmit = (e) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.body) return;

    const tpl = {
      id: Date.now(),
      ...newTemplate
    };

    setTemplates([tpl, ...templates]);
    setShowCreateTemplateModal(false);
    setNotificationMsg(`New template "${newTemplate.title}" saved successfully!`);
    setNewTemplate({ title: '', category: 'General', channel: 'Email', subject: '', body: '' });
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  const filteredLogs = logs.filter(l => logFilterChannel === 'All' || l.channel === logFilterChannel);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Send className="w-6 h-6" />
            </div>
            Unified Communication Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Send instant WhatsApp broadcasts, email newsletters, SMS alerts, and manage scheduled templates.
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
            <Send className="w-3.5 h-3.5" /> Compose Broadcast
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Scheduled & Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Message Templates ({templates.length})
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {notificationMsg}
        </div>
      )}

      {/* --- TAB 1: COMPOSE BROADCAST --- */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Main Compose Window */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Dispatch New Message / Notice
            </h2>

            <form onSubmit={handleSendMessage} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Channel Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Choose Communication Channel *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { id: 'Email', icon: Mail, color: 'text-sky-600 bg-sky-50 border-sky-200' },
                    { id: 'SMS', icon: MessageSquare, color: 'text-purple-600 bg-purple-50 border-purple-200' }
                  ].map((ch) => {
                    const IconComp = ch.icon;
                    const isSelected = composeData.channel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setComposeData({ ...composeData, channel: ch.id })}
                        className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold transition cursor-pointer ${
                          isSelected
                            ? `${ch.color} ring-2 ring-emerald-500/20 shadow-xs`
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4" /> {ch.id}
                      </button>
                    );
                  })}
                </div>
              </div>

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

                {composeData.recipientGroup === 'Custom Phone / Email List' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Custom Recipients (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. parent1@gmail.com, 9876543210"
                      value={composeData.customRecipients}
                      onChange={(e) => setComposeData({ ...composeData, customRecipients: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Subject Header (for Email/WhatsApp) */}
              {composeData.channel !== 'SMS' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subject Header / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Important Announcement regarding Upcoming Examinations"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Message Content / Body *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your broadcast text here..."
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
                  <span className="font-extrabold text-slate-800 text-xs">Schedule Message for Future Date & Time</span>
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
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {composeData.isScheduled ? 'Schedule Broadcast' : `Send ${composeData.channel} Now`}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar: Quick Templates & Shortcut */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Quick Preset Templates</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </h3>

              <div className="space-y-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{tpl.title}</span>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {tpl.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{tpl.body}</p>
                    <button
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-extrabold text-[10px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" /> Use Preset Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SCHEDULED & SENT LOGS --- */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Communication History & Dispatch Logs</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time status of sent emails, SMS broadcasts, and scheduled queues.</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Filter Channel:</span>
              <select
                value={logFilterChannel}
                onChange={(e) => setLogFilterChannel(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
              >
                <option value="All">All Channels</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Recipient Group</th>
                  <th className="py-3 px-4">Subject / Message Summary</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Dispatch / Scheduled Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                        l.channel === 'WhatsApp'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : l.channel === 'Email'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {l.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {l.recipientGroup} <span className="text-[10px] font-semibold text-slate-400">({l.recipientCount} recipients)</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {l.subject}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-600">{l.sender}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.timestamp}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: EMAIL & SMS TEMPLATES --- */}
      {activeTab === 'templates' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200/80">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Email, SMS & WhatsApp Template Library</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Pre-formatted message layouts for recurring notices.</p>
            </div>
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-3 hover:border-emerald-300 transition">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900">{tpl.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px]">
                    {tpl.channel} • {tpl.category}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Subject Header</span>
                  <p className="text-xs font-bold text-slate-800">{tpl.subject}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Body Content</span>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">{tpl.body}</p>
                </div>

                <div className="flex justify-end gap-2 pt-1">
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
        </div>
      )}

      {/* Create New Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" /> Create Custom Message Template
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
                  placeholder="e.g. Sports Day Announcement"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Channel *</label>
                  <select
                    value={newTemplate.channel}
                    onChange={(e) => setNewTemplate({ ...newTemplate, channel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. General, Fees, Exams"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Subject Header</label>
                <input
                  type="text"
                  placeholder="e.g. Important Notice from Thomson School"
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
                  placeholder="Write template body content..."
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
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-md cursor-pointer"
                >
                  Save Template
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
