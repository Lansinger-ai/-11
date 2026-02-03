
import React, { useState, useEffect } from 'react';
import { X, Settings2, Save, RotateCcw, Upload, Cpu, HardDrive, Layout, Trash2 } from 'lucide-react';
import { ServerAsset } from '../types';

interface SingleUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: ServerAsset | null;
  onSave: (sn: string, updates: Partial<ServerAsset>) => void;
}

export const SingleUpdateModal: React.FC<SingleUpdateModalProps> = ({ isOpen, onClose, server, onSave }) => {
  const [formData, setFormData] = useState<Partial<ServerAsset>>({});

  useEffect(() => {
    if (server) {
      setFormData({ ...server });
    }
  }, [server]);

  if (!isOpen || !server) return null;

  const handleClear = () => {
    const cleared = { ...formData };
    Object.keys(cleared).forEach(key => {
      if (key.endsWith('Model') || ['cpu', 'gpu', 'memory', 'ssd', 'harddisk', 'networkCard', 'raid'].includes(key)) {
        (cleared as any)[key] = '-';
      }
    });
    setFormData(cleared);
  };

  const handleImport = () => {
    // 模拟导入逻辑
    alert('正在从本地 PXE 日志解析并填充配置...');
    setFormData({
      ...formData,
      cpu: 'Intel Xeon Platinum 8480C x2',
      cpuModel: 'Intel-8480C-Retail-V1',
      memory: '1024GB (64GB x 16)',
      memoryModel: 'Samsung-DDR5-4800 x16'
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[900px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Settings2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">更新服务器配置</h3>
              <p className="text-[10px] text-gray-500">正在修改 SN: {server.sn} 的机件规格与 Model 信息</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="flex gap-4 mb-6">
            <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-xs font-bold hover:bg-blue-100 transition-colors">
              <Upload size={14} /> 导入离线抓取配置
            </button>
            <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 text-xs font-bold hover:bg-red-100 transition-colors">
              <Trash2 size={14} /> 清空当前所有配置
            </button>
            <button onClick={() => setFormData({...server})} className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-100 text-xs font-bold hover:bg-gray-100 transition-colors">
              <RotateCcw size={14} /> 重置为原始值
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {[
              { label: 'CPU', key: 'cpu', modelKey: 'cpuModel', icon: <Cpu size={14} /> },
              { label: 'GPU', key: 'gpu', modelKey: 'gpuModel', icon: <Layout size={14} /> },
              { label: '内存', key: 'memory', modelKey: 'memoryModel', icon: <Settings2 size={14} /> },
              { label: 'SSD', key: 'ssd', modelKey: 'ssdModel', icon: <HardDrive size={14} /> },
              { label: '硬盘', key: 'harddisk', modelKey: 'harddiskModel', icon: <HardDrive size={14} /> },
              { label: '网卡', key: 'networkCard', modelKey: 'networkCardModel', icon: <Layout size={14} /> },
            ].map(field => (
              <div key={field.key} className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                  {field.icon}
                  {field.label}配置
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">规格 (Spec)</label>
                  <input 
                    type="text" 
                    value={(formData as any)[field.key] || ''} 
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-400 uppercase font-bold">Model 号</label>
                  <input 
                    type="text" 
                    value={(formData as any)[field.modelKey] || ''} 
                    onChange={e => setFormData({...formData, [field.modelKey]: e.target.value})}
                    className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">取消</button>
          <button 
            onClick={() => { onSave(server.sn, formData); onClose(); }} 
            className="flex items-center gap-2 px-10 py-2 text-xs font-medium text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 transition-all active:scale-95"
          >
            <Save size={14} /> 确认并更新
          </button>
        </div>
      </div>
    </div>
  );
};
