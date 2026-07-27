import React, { useState } from 'react';
import {
  Award,
  FileCheck,
  Printer,
  Download,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  Eye,
  Check
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Initial Mock Issued Certificates
const INITIAL_CERTIFICATES = [
  {
    id: 'TC-2026-089',
    certificateType: 'School Transfer Certificate (TC)',
    studentName: 'Aarav Patel',
    rollNo: '1001',
    className: 'Class 10',
    sectionName: 'Section A',
    fatherName: 'Rajesh Patel',
    motherName: 'Sunita Patel',
    admissionNo: 'ADM-2021-450',
    dob: '2010-05-14',
    issueDate: '2026-02-24',
    reasonForLeaving: 'Parent relocation to another state',
    conduct: 'Good & Exemplary',
    issuedBy: 'Principal Dr. S. K. Roy'
  },
  {
    id: 'BON-2026-042',
    certificateType: 'Student Bonafide Certificate',
    studentName: 'Ananya Sharma',
    rollNo: '1002',
    className: 'Class 10',
    sectionName: 'Section A',
    fatherName: 'Mukesh Sharma',
    motherName: 'Kavita Sharma',
    admissionNo: 'ADM-2021-452',
    dob: '2010-08-22',
    issueDate: '2026-02-20',
    reasonForLeaving: 'N/A (Current Active Student)',
    conduct: 'Excellent',
    issuedBy: 'Admin Desk'
  },
  {
    id: 'MER-2026-015',
    certificateType: 'Academic Excellence Certificate',
    studentName: 'Rohan Gupta',
    rollNo: '1003',
    className: 'Class 10',
    sectionName: 'Section B',
    fatherName: 'Sanjay Gupta',
    motherName: 'Meena Gupta',
    admissionNo: 'ADM-2022-108',
    dob: '2010-03-10',
    issueDate: '2026-01-26',
    reasonForLeaving: 'N/A (Award Certificate)',
    conduct: 'Outstanding',
    issuedBy: 'Academic Director'
  }
];

const CLASSES_LIST = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SECTIONS_LIST = ['Section A', 'Section B', 'Section C'];
const CERTIFICATE_TYPES = [
  'School Transfer Certificate (TC)',
  'Student Bonafide Certificate',
  'Student Character Certificate',
  'Academic Excellence Certificate',
  'Sports & Extra-Curricular Certificate'
];

const CertificateDeskView = () => {
  const { user } = useAuthStore();
  const isAuthorizedToGenerate = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const [certificatesList, setCertificatesList] = useState(INITIAL_CERTIFICATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modals & Certificate Viewer
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewCert, setPreviewCert] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // New Certificate Form State
  const [newCertForm, setNewCertForm] = useState({
    certificateType: 'School Transfer Certificate (TC)',
    studentName: '',
    rollNo: '',
    className: 'Class 10',
    sectionName: 'Section A',
    fatherName: '',
    motherName: '',
    admissionNo: '',
    dob: '',
    issueDate: new Date().toISOString().split('T')[0],
    reasonForLeaving: 'Completed Academic Session',
    conduct: 'Good & Satisfactory'
  });

  // Handle Certificate Generation Submit
  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    if (!newCertForm.studentName.trim() || !newCertForm.rollNo.trim()) return;

    const prefix = newCertForm.certificateType.includes('Transfer') ? 'TC' : newCertForm.certificateType.includes('Bonafide') ? 'BON' : 'CERT';
    const generatedCert = {
      id: `${prefix}-2026-${Math.floor(100 + Math.random() * 900)}`,
      certificateType: newCertForm.certificateType,
      studentName: newCertForm.studentName,
      rollNo: newCertForm.rollNo,
      className: newCertForm.className,
      sectionName: newCertForm.sectionName,
      fatherName: newCertForm.fatherName || 'Parent / Guardian',
      motherName: newCertForm.motherName || 'Mother Name',
      admissionNo: newCertForm.admissionNo || `ADM-2024-${Math.floor(100 + Math.random() * 900)}`,
      dob: newCertForm.dob || '2010-01-01',
      issueDate: newCertForm.issueDate,
      reasonForLeaving: newCertForm.reasonForLeaving,
      conduct: newCertForm.conduct,
      issuedBy: user?.name || 'School Principal & Administrative Desk'
    };

    setCertificatesList([generatedCert, ...certificatesList]);
    setShowGenerateModal(false);
    setSuccessMessage(`Official "${generatedCert.certificateType}" generated for ${generatedCert.studentName}!`);
    setPreviewCert(generatedCert);

    setNewCertForm({
      certificateType: 'School Transfer Certificate (TC)',
      studentName: '',
      rollNo: '',
      className: 'Class 10',
      sectionName: 'Section A',
      fatherName: '',
      motherName: '',
      admissionNo: '',
      dob: '',
      issueDate: new Date().toISOString().split('T')[0],
      reasonForLeaving: 'Completed Academic Session',
      conduct: 'Good & Satisfactory'
    });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filtered Certificates
  const filteredCertificates = certificatesList.filter(cert => {
    const matchClass = selectedClass === 'All' || cert.className === selectedClass;
    const matchType = selectedType === 'All' || cert.certificateType === selectedType;
    const matchSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cert.rollNo.includes(searchTerm) ||
                        cert.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchClass && matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Award className="w-6 h-6" />
            </div>
            Certificates & Document Generation Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generate, preview, print, and download official Transfer Certificates (TC), Bonafide, Character, and Merit Certificates.
          </p>
        </div>

        {isAuthorizedToGenerate && (
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Issue / Generate New Certificate
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Search & Filter Certificates:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Student Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Student Name / Roll / Cert ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Certificate Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="All">All Certificate Formats</option>
              {CERTIFICATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Filter Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="All">All Classes</option>
              {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Issued Certificates Directory */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Issued Official Certificates ({filteredCertificates.length} Records)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Certificate ID</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Class & Roll No</th>
                <th className="py-3.5 px-4">Certificate Type</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 text-center">Verification Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-black text-indigo-900">
                      {cert.id}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {cert.studentName.charAt(0)}
                      </div>
                      {cert.studentName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {cert.className} ({cert.sectionName}) • #{cert.rollNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                        {cert.certificateType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-600">{cert.issueDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 flex items-center justify-center gap-1 w-max mx-auto">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Document
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right flex justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-extrabold text-[11px] rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View & Print
                      </button>
                      <button
                        onClick={() => alert(`Downloading official PDF for ${cert.studentName} (${cert.id})...`)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium text-xs">
                    No certificate records match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL: ISSUE NEW CERTIFICATE --- */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Issue / Generate Certificate
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Select Certificate Format *</label>
                <select
                  value={newCertForm.certificateType}
                  onChange={(e) => setNewCertForm({ ...newCertForm, certificateType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  {CERTIFICATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={newCertForm.studentName}
                    onChange={(e) => setNewCertForm({ ...newCertForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1005"
                    value={newCertForm.rollNo}
                    onChange={(e) => setNewCertForm({ ...newCertForm, rollNo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Class *</label>
                  <select
                    value={newCertForm.className}
                    onChange={(e) => setNewCertForm({ ...newCertForm, className: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Section *</label>
                  <select
                    value={newCertForm.sectionName}
                    onChange={(e) => setNewCertForm({ ...newCertForm, sectionName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Father's Name</label>
                  <input
                    type="text"
                    placeholder="Father Name"
                    value={newCertForm.fatherName}
                    onChange={(e) => setNewCertForm({ ...newCertForm, fatherName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">Admission Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ADM-2023-880"
                    value={newCertForm.admissionNo}
                    onChange={(e) => setNewCertForm({ ...newCertForm, admissionNo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newCertForm.dob}
                    onChange={(e) => setNewCertForm({ ...newCertForm, dob: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newCertForm.issueDate}
                    onChange={(e) => setNewCertForm({ ...newCertForm, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Reason for Leaving / Certification Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Parent Relocation / Academic session completion"
                  value={newCertForm.reasonForLeaving}
                  onChange={(e) => setNewCertForm({ ...newCertForm, reasonForLeaving: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Generate Official Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- OFFICIAL CERTIFICATE TEMPLATE & PREVIEW LIGHTBOX --- */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 border-4 border-amber-500/20 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 relative">
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Certificate Header Stamp */}
            <div className="text-center space-y-2 border-b-2 border-slate-900/10 pb-6">
              <div className="w-16 h-16 bg-amber-500/10 text-amber-700 rounded-full flex items-center justify-center mx-auto font-black text-2xl border-2 border-amber-400">
                TS
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">THOMSON INTERNATIONAL SCHOOL</h2>
              <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Affiliated to CBSE • Reg No: TS-88294/2026</p>
              <div className="inline-block px-6 py-1 bg-slate-900 text-amber-400 text-xs font-black uppercase tracking-widest rounded-full mt-2">
                {previewCert.certificateType}
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="space-y-6 text-sm text-slate-800 font-medium leading-relaxed px-4">
              <div className="flex justify-between text-xs font-bold text-slate-500 font-mono">
                <span>Certificate No: {previewCert.id}</span>
                <span>Issue Date: {previewCert.issueDate}</span>
              </div>

              <p className="text-center text-slate-900 font-serif italic text-base">
                " This is to officially certify that <strong className="font-sans font-black text-indigo-900 underline underline-offset-4">{previewCert.studentName}</strong>, 
                Son/Daughter of Shri <strong className="font-sans font-bold text-slate-900">{previewCert.fatherName}</strong>, bearing Roll No <strong className="font-sans font-bold text-slate-900">{previewCert.rollNo}</strong> and 
                Admission No <strong className="font-sans font-bold text-slate-900">{previewCert.admissionNo}</strong>, was a bonafide student of <strong className="font-sans font-bold text-indigo-900">{previewCert.className} ({previewCert.sectionName})</strong> of this institution. "
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Date of Birth</span>
                  <span className="font-black text-slate-800">{previewCert.dob}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Conduct & Character</span>
                  <span className="font-black text-emerald-800">{previewCert.conduct}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Reason for Certificate / Leaving</span>
                  <span className="font-black text-slate-800">{previewCert.reasonForLeaving}</span>
                </div>
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div className="pt-8 border-t-2 border-slate-900/10 flex justify-between items-end px-4">
              <div className="text-center">
                <div className="w-24 h-12 border-b-2 border-slate-400 mb-1 flex items-end justify-center pb-1 text-[10px] font-bold text-slate-400">
                  [ Institutional Seal ]
                </div>
                <span className="text-xs font-bold text-slate-600 block">School Office Seal</span>
              </div>

              <div className="text-center space-y-1">
                <div className="font-serif italic font-extrabold text-indigo-900 text-lg">Dr. S. K. Roy</div>
                <div className="w-36 border-b-2 border-slate-900"></div>
                <span className="text-xs font-black text-slate-900 block">Principal Signature</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Official Certificate
              </button>
              <button
                onClick={() => alert(`Downloading PDF for Certificate #${previewCert.id}...`)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDeskView;
