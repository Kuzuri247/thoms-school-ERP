import React, { useState } from 'react';
import {
  Download,
  Video,
  FileText,
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle2,
  Play,
  Eye,
  Sparkles,
  BookOpen,
  User,
  Calendar,
  Share2,
  FileCheck
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// Initial Mock Download Resources
const INITIAL_RESOURCES = [
  {
    id: 1,
    title: 'Calculus & Derivatives Complete Video Masterclass',
    type: 'video', // 'video', 'pdf', 'image'
    subject: 'Mathematics',
    targetClass: 'Class 10',
    targetSection: 'Section A',
    uploadedBy: 'Dr. Ramesh Verma',
    uploadDate: '2026-02-20',
    fileSize: '450 MB',
    fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60',
    description: 'Detailed video explanation covering limits, continuity, and differential calculus with solved examples.'
  },
  {
    id: 2,
    title: 'Electromagnetic Induction Notes & Formulas PDF',
    type: 'pdf',
    subject: 'Physics',
    targetClass: 'Class 10',
    targetSection: 'All Sections',
    uploadedBy: 'Prof. Sunita Rao',
    uploadDate: '2026-02-18',
    fileSize: '8.4 MB',
    fileUrl: '#',
    thumbnail: null,
    description: 'Comprehensive handwritten physics revision notes for Faraday laws, Lenz law, and transformers.'
  },
  {
    id: 3,
    title: 'Human Heart Anatomic Structure & Blood Flow Chart',
    type: 'image',
    subject: 'Biology',
    targetClass: 'Class 9',
    targetSection: 'Section B',
    uploadedBy: 'Anjali Sharma',
    uploadDate: '2026-02-15',
    fileSize: '3.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop&q=60',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=60',
    description: 'High-resolution labeled anatomy diagram of human heart ventricles and circulatory pathway.'
  },
  {
    id: 4,
    title: 'Python Data Structures & OOP Practice Sheets',
    type: 'pdf',
    subject: 'Computer Science',
    targetClass: 'Class 12',
    targetSection: 'Section A',
    uploadedBy: 'Vikramaditya Tech',
    uploadDate: '2026-02-10',
    fileSize: '4.1 MB',
    fileUrl: '#',
    thumbnail: null,
    description: 'Solved laboratory practical problems on stacks, queues, and object-oriented programming.'
  },
  {
    id: 5,
    title: 'Organic Chemistry Reactions Mechanism Video',
    type: 'video',
    subject: 'Chemistry',
    targetClass: 'Class 11',
    targetSection: 'All Sections',
    uploadedBy: 'Dr. K. N. Gupta',
    uploadDate: '2026-02-05',
    fileSize: '380 MB',
    fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=60',
    description: 'Step-by-step chemical reaction pathways for alkanes, alkenes, and aromatic compounds.'
  }
];

const CLASSES_LIST = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SECTIONS_LIST = ['All Sections', 'Section A', 'Section B', 'Section C'];
const SUBJECTS_LIST = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

const DownloadCenterView = () => {
  const { user } = useAuthStore();
  const isAuthorizedToUpload = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [activeTypeTab, setActiveTypeTab] = useState('all'); // 'all', 'video', 'pdf', 'image'

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Modals & Previews
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null); // For video / image lightbox
  const [successMessage, setSuccessMessage] = useState('');

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'video',
    subject: 'Mathematics',
    targetClass: 'Class 10',
    targetSection: 'Section A',
    description: '',
    fileUrl: '',
    thumbnail: ''
  });

  // Handle New Upload Submission
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;

    const newResource = {
      id: Date.now(),
      title: uploadForm.title,
      type: uploadForm.type,
      subject: uploadForm.subject,
      targetClass: uploadForm.targetClass,
      targetSection: uploadForm.targetSection,
      uploadedBy: user?.name || 'Staff Faculty',
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: uploadForm.type === 'video' ? '250 MB' : uploadForm.type === 'pdf' ? '5.2 MB' : '2.1 MB',
      fileUrl: uploadForm.fileUrl || (uploadForm.type === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : '#'),
      thumbnail: uploadForm.thumbnail || (uploadForm.type === 'video' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60' : uploadForm.type === 'image' ? uploadForm.fileUrl : null),
      description: uploadForm.description || 'Uploaded academic study resource for students.'
    };

    setResources([newResource, ...resources]);
    setShowUploadModal(false);
    setSuccessMessage(`Resource "${newResource.title}" uploaded & assigned to ${newResource.targetClass} (${newResource.targetSection})!`);
    setUploadForm({
      title: '',
      type: 'video',
      subject: 'Mathematics',
      targetClass: 'Class 10',
      targetSection: 'Section A',
      description: '',
      fileUrl: '',
      thumbnail: ''
    });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filtered Resources
  const filteredResources = resources.filter(res => {
    const matchType = activeTypeTab === 'all' || res.type === activeTypeTab;
    const matchClass = selectedClass === 'All' || res.targetClass === selectedClass;
    const matchSection = selectedSection === 'All' || res.targetSection === 'All Sections' || res.targetSection === selectedSection;
    const matchSubject = selectedSubject === 'All' || res.subject === selectedSubject;
    const matchSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        res.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        res.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchType && matchClass && matchSection && matchSubject && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Download className="w-6 h-6" />
            </div>
            Digital Library & Download Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Access class & section-wise video lectures, PDF study materials, chapter notes, and visual diagrams.
          </p>
        </div>

        {isAuthorizedToUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Study Material / Video
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter Materials by Class, Section & Subject:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Title, Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="All">All Classes</option>
              {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="All">All Sections</option>
              {SECTIONS_LIST.filter(s => s !== 'All Sections').map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
            >
              <option value="All">All Subjects</option>
              {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Type Category Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-extrabold">
        <button
          onClick={() => setActiveTypeTab('all')}
          className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTypeTab === 'all' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> All Resources ({resources.length})
        </button>
        <button
          onClick={() => setActiveTypeTab('video')}
          className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTypeTab === 'video' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video className="w-4 h-4 text-purple-600" /> Video Lectures ({resources.filter(r => r.type === 'video').length})
        </button>
        <button
          onClick={() => setActiveTypeTab('pdf')}
          className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTypeTab === 'pdf' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" /> PDF Notes & E-Books ({resources.filter(r => r.type === 'pdf').length})
        </button>
        <button
          onClick={() => setActiveTypeTab('image')}
          className={`pb-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTypeTab === 'image' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" /> Images & Diagrams ({resources.filter(r => r.type === 'image').length})
        </button>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.length > 0 ? (
          filteredResources.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Media Preview Header */}
                {item.type === 'video' ? (
                  <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => setPreviewMedia(item)}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                      VIDEO
                    </span>
                  </div>
                ) : item.type === 'image' ? (
                  <div className="relative aspect-video bg-slate-100 overflow-hidden group">
                    <img
                      src={item.thumbnail || item.fileUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => setPreviewMedia(item)}
                      className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-900/70 text-white flex items-center justify-center shadow-lg hover:scale-110 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-mono font-bold">
                      IMAGE
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">PDF DOCUMENT</span>
                      <span className="text-xs font-bold text-slate-500">{item.fileSize}</span>
                    </div>
                  </div>
                )}

                {/* Card Content Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                      {item.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black">
                      {item.targetClass} ({item.targetSection})
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">{item.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-500" /> {item.uploadedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.uploadDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-2">
                {item.type === 'video' ? (
                  <button
                    onClick={() => setPreviewMedia(item)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Play Video Lecture
                  </button>
                ) : (
                  <a
                    href={item.fileUrl}
                    download
                    onClick={() => alert(`Downloading "${item.title}" (${item.fileSize})...`)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download File ({item.fileSize})
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-black text-slate-700">No Study Resources Found</h3>
            <p className="text-xs text-slate-400 font-medium">Try broadening your search term or selecting a different class filter.</p>
          </div>
        )}
      </div>

      {/* --- MODAL: UPLOAD NEW RESOURCE --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Upload Study Resource
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Motion Laws & Problems"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Resource Format *</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="video">Video Lecture MP4</option>
                    <option value="pdf">PDF Document / Notes</option>
                    <option value="image">Diagram / Image</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Subject *</label>
                  <select
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Class *</label>
                  <select
                    value={uploadForm.targetClass}
                    onChange={(e) => setUploadForm({ ...uploadForm, targetClass: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {CLASSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Target Section *</label>
                  <select
                    value={uploadForm.targetSection}
                    onChange={(e) => setUploadForm({ ...uploadForm, targetSection: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                  >
                    {SECTIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Media / Video File URL</label>
                <input
                  type="text"
                  placeholder="https://... (or leave default MP4 test player)"
                  value={uploadForm.fileUrl}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of topics covered in this resource..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX / MEDIA PLAYER PREVIEW MODAL --- */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                  {previewMedia.subject} • {previewMedia.targetClass}
                </span>
                <h3 className="text-sm font-bold text-white leading-tight">{previewMedia.title}</h3>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex justify-center items-center">
              {previewMedia.type === 'video' ? (
                <video controls autoPlay className="w-full rounded-2xl max-h-[60vh]">
                  <source src={previewMedia.fileUrl} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              ) : (
                <img
                  src={previewMedia.thumbnail || previewMedia.fileUrl}
                  alt={previewMedia.title}
                  className="max-h-[60vh] object-contain rounded-2xl"
                />
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Uploaded by {previewMedia.uploadedBy} on {previewMedia.uploadDate}</span>
              <a
                href={previewMedia.fileUrl}
                download
                onClick={() => alert(`Downloading "${previewMedia.title}"...`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Original File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadCenterView;
