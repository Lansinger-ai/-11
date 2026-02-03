
import React from 'react';
import { X, History, User, Clock, ArrowRight } from 'lucide-react';
import { LogEntry } from '../types';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  sn: string;
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, logs, sn }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[700px] max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <History size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">操作日志记录</h3>
              <p className="text-[10px] text-gray-500">SN: {sn} 的所有配置变更历史</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="space-y-6">
            {logs.length > 0 ? logs.map((log, idx) => (
              <div key={log.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-0.5 before:bg-gray-200 last:before:hidden">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <User size={12} className="text-gray-400" />
                        {log.operator}
                      </div>
                      <div className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium border border-blue-100">
                        {log.action}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock size={12} />
                      {log.timestamp}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {log.details.map((detail, dIdx) => (
                      <div key={dIdx} className="grid grid-cols-12 items-center text-[11px] bg-gray-50/50 p-2 rounded border border-gray-100">
                        <div className="col-span-3 font-bold text-gray-500 uppercase tracking-tight">{detail.field}</div>
                        <div className="col-span-4 text-gray-400 line-through truncate px-2">{detail.before || '空'}</div>
                        <div className="col-span-1 flex justify-center text-blue-400"><ArrowRight size={12} /></div>
                        <div className="col-span-4 text-blue-700 font-bold truncate px-2">{detail.after || '空'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                  <History size={24} />
                </div>
                <p className="text-sm text-gray-400 italic">暂无该服务器的变更日志</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-colors">知道了</button>
        </div>
      </div>
    </div>
  );
};
