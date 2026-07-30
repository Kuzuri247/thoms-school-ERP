import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Mail,
  MessageSquare,
  MessageCircle,
  Shield,
  Database,
  Save,
  CheckCircle2,
  Download,
  Key,
  Clock,
  Globe,
  Upload,
  RefreshCw,
  Server,
  Smartphone,
  Check
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const INITIAL_BACKUPS = [
  { id: 1, filename: 'thomson_erp_backup_2026_02_08.sql', size: '24.8 MB', date: '2026-02-08 02:00 AM', type: 'Automated Daily', status: 'Completed' },
  { id: 2, filename: 'thomson_erp_backup_2026_02_01.sql', size: '24.2 MB', date: '2026-02-01 02:00 AM', type: 'Automated Weekly', status: 'Completed' },
  { id: 3, filename: 'thomson_erp_backup_2026_01_15.sql', size: '23.5 MB', date: '2026-01-15 11:30 PM', type: 'Manual Admin Export', status: 'Completed' }
];

const SystemSettingsView = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'smtp_twilio', 'whatsapp', 'session', 'backup'
  const [successMessage, setSuccessMessage] = useState('');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    schoolName: 'Thomson Senior Secondary School',
    schoolCode: 'THOMSON-ERP-2026',
    academicYear: '2025-2026',
    email: 'admin@thomsonschool.edu.in',
    phone: '+91 98765 43210',
    address: '123 Academic Enclave, Knowledge Park, City Center',
    currency: '₹ (INR)',
    timezone: 'Asia/Kolkata (GMT+05:30)',
    language: 'English (US)',
    schoolLogo: ''
  });

  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'notifications@thomsonschool.edu.in',
    smtpPass: '••••••••••••',
    smtpEncryption: 'TLS',
    fromName: 'Thomson School ERP',
    fromEmail: 'noreply@thomsonschool.edu.in'
  });

  // Twilio Settings State
  const [twilioSettings, setTwilioSettings] = useState({
    accountSid: 'AC9876543210fedcba98765432101234',
    authToken: '••••••••••••••••••••••••••••••••',
    twilioPhoneNumber: '+1 800 555 0199',
    messagingServiceSid: 'MG1234567890abcdef1234567890abcd'
  });

  // WhatsApp Gateway State
  const [whatsappSettings, setWhatsappSettings] = useState({
    provider: 'Meta WhatsApp Cloud API',
    phoneNumberId: '109876543210987',
    whatsappBusinessId: '987654321098765',
    accessToken: 'EAAG1234567890abcdefghijklmnopqrstuvwxyz',
    webhookSecret: 'whsec_9876543210'
  });

  // Session & Security Settings State
  const [sessionSettings, setSessionSettings] = useState({
    activeSession: '2025-2026',
    sessionTimeout: '30',
    enable2FA: true,
    passwordExpiryDays: '90',
    autoLogoutInactivity: true
  });

  // Backup History State
  const [backups, setBackups] = useState(INITIAL_BACKUPS);
  const [backupSchedule, setBackupSchedule] = useState('Daily at 02:00 AM');

  // General Save Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMessage('System configuration settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Trigger Manual Backup
  const handleTriggerManualBackup = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '_');
    const newBackup = {
      id: Date.now(),
      filename: `thomson_erp_backup_${dateStr}_${Math.floor(100+Math.random()*900)}.sql`,
      size: '25.1 MB',
      date: today.toLocaleString(),
      type: 'Manual Admin Export',
      status: 'Completed'
    };
    setBackups([newBackup, ...backups]);
    setSuccessMessage('Database backup created and saved to system logs!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralSettings({ ...generalSettings, schoolLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
              <Settings className="w-6 h-6" />
            </div>
            System Settings & Administration
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure school profile, SMTP mail server, Twilio SMS gateway, WhatsApp API, session timeouts, and database backups.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Main Settings Layout with Sidebar Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs List */}
        <div className="lg:col-span-1 space-y-1 bg-white p-3 rounded-3xl border border-slate-200/80 h-fit shadow-xs">
          {[
            { id: 'general', label: 'General School Profile', icon: Building2 },
            { id: 'smtp_twilio', label: 'SMTP & Twilio SMS Gateway', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp Gateway API', icon: MessageCircle },
            { id: 'session', label: 'Session & Security', icon: Shield },
            { id: 'backup', label: 'Database Backup & Logs', icon: Database }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-xs transition flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="lg:col-span-3">
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" /> General School & ERP Configuration
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold text-slate-700">
                {/* Logo Upload Preview */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden font-bold text-slate-400 text-xs">
                    {generalSettings.schoolLogo ? (
                      <img src={generalSettings.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      'LOGO'
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">School Official Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">School Official Name *</label>
                    <input
                      type="text"
                      required
                      value={generalSettings.schoolName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, schoolName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">School Registration Code</label>
                    <input
                      type="text"
                      value={generalSettings.schoolCode}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, schoolCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={generalSettings.email}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Contact Helpline Phone *</label>
                    <input
                      type="text"
                      required
                      value={generalSettings.phone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Campus Address</label>
                  <input
                    type="text"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">System Timezone</label>
                    <input
                      type="text"
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Default Portal Language</label>
                    <input
                      type="text"
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save General Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SMTP & TWILIO */}
          {activeTab === 'smtp_twilio' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-600" /> SMTP Mail Server & Twilio SMS Gateway Configuration
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-semibold text-slate-700">
                {/* SMTP Mail Block */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4 text-sky-600" /> SMTP Email Server Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1">SMTP Host Server *</label>
                      <input
                        type="text"
                        value={smtpSettings.smtpHost}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">SMTP Port *</label>
                      <input
                        type="text"
                        value={smtpSettings.smtpPort}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Encryption</label>
                      <select
                        value={smtpSettings.smtpEncryption}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpEncryption: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      >
                        <option value="TLS">TLS</option>
                        <option value="SSL">SSL</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">SMTP Username / Email *</label>
                      <input
                        type="text"
                        value={smtpSettings.smtpUser}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">SMTP Password *</label>
                      <input
                        type="password"
                        value={smtpSettings.smtpPass}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPass: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Twilio SMS Gateway Block */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600" /> Twilio SMS Gateway Settings
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Twilio Account SID *</label>
                      <input
                        type="text"
                        value={twilioSettings.accountSid}
                        onChange={(e) => setTwilioSettings({ ...twilioSettings, accountSid: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Twilio Auth Token *</label>
                      <input
                        type="password"
                        value={twilioSettings.authToken}
                        onChange={(e) => setTwilioSettings({ ...twilioSettings, authToken: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Twilio Registered Phone Number</label>
                      <input
                        type="text"
                        value={twilioSettings.twilioPhoneNumber}
                        onChange={(e) => setTwilioSettings({ ...twilioSettings, twilioPhoneNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Messaging Service SID (Optional)</label>
                      <input
                        type="text"
                        value={twilioSettings.messagingServiceSid}
                        onChange={(e) => setTwilioSettings({ ...twilioSettings, messagingServiceSid: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Gateway Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: WHATSAPP GATEWAY */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" /> WhatsApp Cloud API & Gateway Settings
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1">WhatsApp API Provider *</label>
                  <select
                    value={whatsappSettings.provider}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  >
                    <option value="Meta WhatsApp Cloud API">Meta WhatsApp Official Cloud API</option>
                    <option value="Twilio WhatsApp API">Twilio WhatsApp Sandbox</option>
                    <option value="UltraMsg Gateway">UltraMsg WhatsApp Gateway</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Phone Number ID *</label>
                    <input
                      type="text"
                      value={whatsappSettings.phoneNumberId}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phoneNumberId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">WhatsApp Business Account ID</label>
                    <input
                      type="text"
                      value={whatsappSettings.whatsappBusinessId}
                      onChange={(e) => setWhatsappSettings({ ...whatsappSettings, whatsappBusinessId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Permanent Access Token / API Key *</label>
                  <input
                    type="password"
                    value={whatsappSettings.accessToken}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, accessToken: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1">Webhook Verify Token</label>
                  <input
                    type="text"
                    value={whatsappSettings.webhookSecret}
                    onChange={(e) => setWhatsappSettings({ ...whatsappSettings, webhookSecret: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save WhatsApp API Credentials
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SESSION & SECURITY */}
          {activeTab === 'session' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" /> Academic Session & User Security Policy
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Current Active Academic Session *</label>
                    <select
                      value={sessionSettings.activeSession}
                      onChange={(e) => setSessionSettings({ ...sessionSettings, activeSession: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    >
                      <option value="2025-2026">2025-2026 (Current Active)</option>
                      <option value="2026-2027">2026-2027 (Upcoming)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Idle Session Timeout (Minutes)</label>
                    <input
                      type="number"
                      value={sessionSettings.sessionTimeout}
                      onChange={(e) => setSessionSettings({ ...sessionSettings, sessionTimeout: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sessionSettings.enable2FA}
                      onChange={(e) => setSessionSettings({ ...sessionSettings, enable2FA: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-extrabold text-slate-800 text-xs">Enforce Two-Factor Authentication (2FA) for Admins</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sessionSettings.autoLogoutInactivity}
                      onChange={(e) => setSessionSettings({ ...sessionSettings, autoLogoutInactivity: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-extrabold text-slate-800 text-xs">Automatic Logout on Tab Closure or Inactivity</span>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Security Policies
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: DATABASE BACKUP */}
          {activeTab === 'backup' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" /> Database Backup & Snapshot Manager
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Export full SQL database dump and monitor automated daily snapshots.</p>
                </div>

                <button
                  onClick={handleTriggerManualBackup}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Export Database (.SQL Dump)
                </button>
              </div>

              {/* Automated Schedule Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Automated Backup Frequency</span>
                  <p className="text-xs font-black text-slate-900">{backupSchedule}</p>
                </div>
                <button
                  onClick={() => alert('Backup schedule updated to Daily at Midnight.')}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  Change Schedule
                </button>
              </div>

              {/* Backup History Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Generated Backup Logs</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Filename</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Triggered By</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {backups.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{b.filename}</td>
                          <td className="py-3 px-4 font-extrabold text-slate-600">{b.size}</td>
                          <td className="py-3 px-4 text-slate-500 font-medium">{b.date}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                              {b.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => alert(`Downloading backup file ${b.filename}...`)}
                              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-extrabold text-[10px] rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> Download SQL
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsView;
