import React from 'react';

const PagePlaceholder = ({ title }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 text-center max-w-md">
            This module is currently under development. Data grids and forms for {title.toLowerCase()} will appear here soon.
        </p>
    </div>
);

export default PagePlaceholder;
