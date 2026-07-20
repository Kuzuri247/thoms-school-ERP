import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../types/erp';
import { PlusCircle, Archive, Megaphone } from 'lucide-react';

import { useGetNotices } from '../notices/useNotices';

const Noticeboard = () => {
  const user = useAuthStore((state) => state.user);
  const { data: noticesData } = useGetNotices();
  const notices = noticesData?.data || [];

  const roleStr = user?.role ? String(user.role).toUpperCase().replace(/\s+/g, '_') : '';
  const canManageNotices = [ROLES.SUPERADMIN, ROLES.ADMIN].includes(roleStr);

  const activeNotices = notices.filter(n => !n.isArchived);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Megaphone className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Noticeboard</h2>
        </div>
        
        {canManageNotices && (
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-indigo-500/20">
            <PlusCircle className="w-4 h-4" />
            New Notice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeNotices.map(notice => (
          <div key={notice.id} className="group p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
                {new Date(notice.publish_date).toLocaleDateString()} - {notice.target_audience}
              </span>
              {canManageNotices && (
                <button 
                  className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Archive Notice"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
              {notice.title}
            </h3>
            <p className="text-sm text-slate-600 line-clamp-3 mb-4 whitespace-pre-wrap">
              {notice.content}
            </p>
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Priority: {notice.priority}</span>
              <span>Expires: {notice.expiry_date ? new Date(notice.expiry_date).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        ))}

        {activeNotices.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500 text-sm">
            No active notices to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default Noticeboard;
