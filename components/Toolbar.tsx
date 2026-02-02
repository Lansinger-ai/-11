
import React from 'react';
import { TOOLBAR_ACTIONS } from '../constants';
import { Search } from 'lucide-react';

export const Toolbar: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between px-2 py-1 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {TOOLBAR_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            className={`flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium border border-gray-200 rounded hover:bg-gray-50 transition-colors whitespace-nowrap active:bg-gray-100 ${action.color}`}
          >
            {action.icon}
            <span>{action.type}</span>
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <span className="text-[11px] text-gray-500 whitespace-nowrap">快速查找</span>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search"
            className="pl-2 pr-8 py-1 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-48 group-hover:border-gray-400"
          />
          <Search size={12} className="absolute right-2 top-1.5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
