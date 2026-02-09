
import React, { useState, useEffect } from 'react';
import { X, Settings2, Save, RotateCcw, Upload, Cpu, HardDrive, Layout, Trash2, AlertTriangle, Plus, Trash, Info, ChevronDown, Layers } from 'lucide-react';
import { ServerAsset } from '../types';

interface ModelItem {
  id: string;
  name: string;
  qty: number;
}

interface SpecItem {
  id: string;
  name: string;
  totalQty: number;
  models: ModelItem[];
}

const HARDWARE_CATALOG: Record<string, { specs: string[]; mapping: Record<string, string[]> }> = {
  cpu: {
    specs: ['Intel Xeon 8358', 'Intel Xeon Platinum 8480C', 'AMD EPYC 9654', 'Intel Xeon 8350'],
    mapping: {
      'Intel Xeon 8358': ['Intel-8358-Standard-V2', 'Intel-8358-Retail', 'Intel-8358-OEM'],
      'Intel Xeon Platinum 8480C': ['Intel-8480C-QS', 'Intel-8480C-Retail-V1'],
      'AMD EPYC 9654': ['AMD-EPYC-9654-Retail'],
      'Intel Xeon 8350': ['Intel-8350-OEM']
    }
  },
  gpu: {
    specs: ['NVIDIA A100 80GB', 'NVIDIA H100 80GB', 'NVIDIA L40S', 'NVIDIA RTX 4090'],
    mapping: {
      'NVIDIA A100 80GB': ['A100-PG150-S01', 'A100-SXM4-80GB'],
      'NVIDIA H100 80GB': ['H100-PG520-S01', 'H100-SXM5-80GB'],
      'NVIDIA L40S': ['L40S-NVLink-V1'],
      'NVIDIA RTX 4090': ['RTX-4090-FE']
    }
  },
  memory: {
    specs: ['32GB DDR4', '64GB DDR4', '64GB DDR5'],
    mapping: {
      '32GB DDR4': ['Samsung-DDR4-3200', 'Hynix-DDR4-3200', 'Micron-DDR4-3200'],
      '64GB DDR4': ['Samsung-DDR4-3200-HR'],
      '64GB DDR5': ['Samsung-DDR5-4800', 'Hynix-DDR5-4800']
    }
  },
  ssd: {
    specs: ['1.92TB NVMe', '3.84TB NVMe', '7.68TB NVMe'],
    mapping: {
      '1.92TB NVMe': ['Samsung-PM9A3', 'Intel-D7-P5510'],
      '3.84TB NVMe': ['Samsung-PM1733', 'Micron-7450-Pro'],
      '7.68TB NVMe': ['Samsung-PM1733-Max']
    }
  },
  fpga: {
    specs: ['Xilinx Alveo U250', 'Xilinx Alveo U200'],
    mapping: {
      'Xilinx Alveo U250': ['U250-PQ123', 'U250-Custom'],
      'Xilinx Alveo U200': ['U200-PQ456']
    }
  }
};

const CATEGORIES = [
  { id: 'gpu', label: 'GPU', icon: <Layout size={14} /> },
  { id: 'cpu', label: 'CPU', icon: <Cpu size={14} /> },
  { id: 'memory', label: '内存', icon: <Settings2 size={14} /> },
  { id: 'networkCard', label: '网卡', icon: <Layout size={14} /> },
  { id: 'harddisk', label: '硬盘', icon: <HardDrive size={14} /> },
  { id: 'ssd', label: 'SSD', icon: <HardDrive size={14} /> },
  { id: 'raid', label: 'RAID', icon: <Settings2 size={14} /> },
  { id: 'fpga', label: 'FPGA', icon: <Cpu size={14} /> },
];

const isAbnormalStr = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower.includes('err:') || lower.includes('unknown') || lower.includes('mismatch') || lower.includes('bad');
};

const parseToNested = (specStr: string, modelStr: string): SpecItem[] => {
  if (!specStr || specStr === '-') return [];
  const specParts = specStr.split('|').map(s => s.trim());
  const modelParts = modelStr.split('|').map(m => m.trim());

  return specParts.map((s, idx) => {
    const specMatch = s.match(/(.+)\s+x(\d+)/) || [null, s, '1'];
    const specName = specMatch[1]?.trim() || s;
    const specQty = parseInt(specMatch[2] || '1');

    const mPart = modelParts[idx] || '';
    const mRows = mPart.split(';').map(m => m.trim()).filter(Boolean);
    
    const models: ModelItem[] = mRows.map(m => {
      const mMatch = m.match(/(.+)\s+x(\d+)/) || [null, m, '1'];
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: mMatch[1]?.trim() || m,
        qty: parseInt(mMatch[2] || '1')
      };
    });

    if (models.length === 0) {
      models.push({ id: Math.random().toString(36).substr(2, 9), name: '', qty: specQty });
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: specName,
      totalQty: specQty,
      models
    };
  });
};

export const SingleUpdateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  server: ServerAsset | null;
  onSave: (sn: string, updates: Partial<ServerAsset>) => void;
}> = ({ isOpen, onClose, server, onSave }) => {
  const [activeTab, setActiveTab] = useState('gpu');
  const [showConfirm, setShowConfirm] = useState(false);
  const [configs, setConfigs] = useState<Record<string, SpecItem[]>>({});

  useEffect(() => {
    if (server) {
      const initial: Record<string, SpecItem[]> = {};
      CATEGORIES.forEach(cat => {
        const sVal = (server as any)[cat.id] || '';
        const mVal = (server as any)[`${cat.id}Model`] || '';
        initial[cat.id] = parseToNested(sVal, mVal);
      });
      setConfigs(initial);
    }
  }, [server]);

  if (!isOpen || !server) return null;

  const checkCategoryAbnormality = (catId: string): boolean => {
    const specs = configs[catId] || [];
    return specs.some(s => {
      const nameAbnormal = isAbnormalStr(s.name);
      const modelNameAbnormal = s.models.some(m => isAbnormalStr(m.name));
      const qtyMismatch = s.models.reduce((sum, m) => sum + m.qty, 0) !== s.totalQty;
      return nameAbnormal || modelNameAbnormal || qtyMismatch;
    });
  };

  const addSpec = (catId: string) => {
    const newSpec: SpecItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      totalQty: 1,
      models: [{ id: Math.random().toString(36).substr(2, 9), name: '', qty: 1 }]
    };
    setConfigs(prev => ({ ...prev, [catId]: [...(prev[catId] || []), newSpec] }));
  };

  const removeSpec = (catId: string, specId: string) => {
    setConfigs(prev => ({ ...prev, [catId]: prev[catId].filter(s => s.id !== specId) }));
  };

  const updateSpec = (catId: string, specId: string, updates: Partial<SpecItem>) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => {
        if (s.id !== specId) return s;
        const next = { ...s, ...updates };
        if (updates.name && HARDWARE_CATALOG[catId]) {
          const firstModel = HARDWARE_CATALOG[catId].mapping[updates.name]?.[0] || '';
          next.models = next.models.map((m, idx) => idx === 0 ? { ...m, name: firstModel } : m);
        }
        return next;
      })
    }));
  };

  const addModel = (catId: string, specId: string) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => s.id === specId ? {
        ...s,
        models: [...s.models, { id: Math.random().toString(36).substr(2, 9), name: '', qty: 1 }]
      } : s)
    }));
  };

  const removeModel = (catId: string, specId: string, modelId: string) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => s.id === specId ? {
        ...s,
        models: s.models.filter(m => m.id !== modelId)
      } : s)
    }));
  };

  const updateModel = (catId: string, specId: string, modelId: string, updates: Partial<ModelItem>) => {
    setConfigs(prev => ({
      ...prev,
      [catId]: prev[catId].map(s => s.id === specId ? {
        ...s,
        models: s.models.map(m => m.id === modelId ? { ...m, ...updates } : m)
      } : s)
    }));
  };

  const handleFinalSave = () => {
    const finalUpdates: any = {};
    CATEGORIES.forEach(cat => {
      const specs = configs[cat.id] || [];
      if (specs.length === 0) {
        finalUpdates[cat.id] = '-';
        finalUpdates[`${cat.id}Model`] = '-';
      } else {
        finalUpdates[cat.id] = specs.map(s => `${s.name} x${s.totalQty}`).join(' | ');
        finalUpdates[`${cat.id}Model`] = specs.map(s => 
          s.models.map(m => `${m.name} x${m.qty}`).join('; ')
        ).join(' | ');
      }
    });
    onSave(server.sn, finalUpdates);
    onClose();
  };

  const handleClear = () => {
    setConfigs(prev => ({ ...prev, [activeTab]: [] }));
  };

  const handleImport = () => {
    // Simulated file import behavior with some "errors" for testing visual feedback
    if (activeTab === 'cpu') {
      const imported: SpecItem[] = [{
        id: 'imp-1', name: 'Intel Xeon Platinum 8480C', totalQty: 2,
        models: [{ id: 'imp-m1', name: 'ERR: Unknown Rev', qty: 2 }]
      }];
      setConfigs(prev => ({ ...prev, cpu: imported }));
    } else if (activeTab === 'gpu') {
        const imported: SpecItem[] = [{
            id: 'imp-2', name: 'NVIDIA H100 80GB', totalQty: 8,
            models: [{ id: 'imp-m2', name: 'H100-PG520-S01', qty: 8 }]
        }];
        setConfigs(prev => ({ ...prev, gpu: imported }));
    } else {
      alert('请上传配置文件');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 p-6">
      <div className="bg-white w-full max-w-[1100px] h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-white">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">更新配置</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-[10px] font-bold border border-indigo-100">SN: {server.sn}</span>
                <span className="text-[10px] text-slate-400">|</span>
                <span className="text-[10px] text-slate-500">正在修改物理资产的层级配件信息</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={24} /></button>
        </div>

        {/* Global Action Bar */}
        <div className="px-8 py-3.5 bg-white border-b border-slate-50 flex gap-4 items-center">
          <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-[11px] font-bold hover:bg-blue-100 transition-all active:scale-95">
            <Upload size={14} /> 导入配置文件
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[11px] font-bold hover:bg-rose-100 transition-all active:scale-95">
            <Trash2 size={14} /> 清空所有项
          </button>
          <div className="flex-1" />
          <button onClick={() => {
            const initial: Record<string, SpecItem[]> = {};
            CATEGORIES.forEach(cat => {
              const sVal = (server as any)[cat.id] || '';
              const mVal = (server as any)[`${cat.id}Model`] || '';
              initial[cat.id] = parseToNested(sVal, mVal);
            });
            setConfigs(initial);
          }} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 text-[11px] font-bold hover:bg-slate-100 transition-all active:scale-95">
            <RotateCcw size={14} /> 重置为原始值
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-slate-50/80 border-r border-slate-100 p-4 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">配件分类</p>
            {CATEGORIES.map(cat => {
              const hasAbnormality = checkCategoryAbnormality(cat.id);
              const isActive = activeTab === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[11px] font-bold transition-all relative group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : hasAbnormality 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={hasAbnormality && !isActive ? 'animate-pulse' : ''}>
                       {cat.icon}
                    </div>
                    {cat.label}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasAbnormality && !isActive && (
                      <AlertTriangle size={12} className="text-rose-500" />
                    )}
                    {(configs[cat.id]?.length || 0) > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-white text-indigo-600' : hasAbnormality ? 'bg-rose-200 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
                        {configs[cat.id].length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-10 bg-white custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {CATEGORIES.find(c => c.id === activeTab)?.label}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">支持为该配件添加多个规格，且每个规格可映射多个 Model 编号</p>
              </div>
              <button 
                onClick={() => addSpec(activeTab)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                <Plus size={14} /> 添加新规格
              </button>
            </div>

            <div className="space-y-8">
              {(configs[activeTab] || []).map((spec, sIdx) => {
                const catalog = HARDWARE_CATALOG[activeTab];
                const validModels = (catalog && catalog.mapping[spec.name]) || [];
                const currentModelQtySum = spec.models.reduce((sum, m) => sum + m.qty, 0);
                const isMismatch = currentModelQtySum !== spec.totalQty;
                const isSpecAbnormal = isAbnormalStr(spec.name);

                return (
                  <div key={spec.id} className={`group bg-white border rounded-[2rem] overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-100 ${isMismatch || isSpecAbnormal ? 'border-rose-200' : 'border-slate-200 hover:border-indigo-200'}`}>
                    {/* Spec Header */}
                    <div className={`px-8 py-5 flex items-center gap-6 border-b ${isMismatch || isSpecAbnormal ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/80 border-slate-100'}`}>
                      <div className="flex-1 flex gap-4 items-center">
                        <div className="flex flex-col flex-1 gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">规格名称 (Spec)</label>
                          <div className="relative">
                            {catalog ? (
                              <select 
                                value={spec.name}
                                onChange={e => updateSpec(activeTab, spec.id, { name: e.target.value })}
                                className={`w-full border rounded-xl px-4 py-2 text-xs font-bold outline-none appearance-none ${isSpecAbnormal ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                              >
                                <option value="" disabled>选择或输入规格...</option>
                                {catalog.specs.map(s => <option key={s} value={s}>{s}</option>)}
                                {spec.name && !catalog.specs.includes(spec.name) && <option value={spec.name}>{spec.name}</option>}
                              </select>
                            ) : (
                              <input 
                                type="text" 
                                value={spec.name}
                                onChange={e => updateSpec(activeTab, spec.id, { name: e.target.value })}
                                className={`w-full border rounded-xl px-4 py-2 text-xs font-bold outline-none ${isSpecAbnormal ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                placeholder="输入硬件规格..."
                              />
                            )}
                          </div>
                        </div>
                        <div className="w-28 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">总数量</label>
                          <div className={`flex items-center gap-1 border rounded-xl px-3 py-2 ${isMismatch ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'}`}>
                            <span className="text-[10px] font-bold text-slate-400">x</span>
                            <input 
                              type="number" 
                              value={spec.totalQty}
                              onChange={e => updateSpec(activeTab, spec.id, { totalQty: parseInt(e.target.value) || 0 })}
                              className="w-full text-xs font-bold outline-none bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeSpec(activeTab, spec.id)} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all mt-4">
                        <Trash size={18} />
                      </button>
                    </div>

                    {/* Models Area */}
                    <div className="p-8 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Model 映射详情</span>
                          {isMismatch && (
                            <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">
                              <AlertTriangle size={10} /> 数量不匹配 (当前: {currentModelQtySum})
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => addModel(activeTab, spec.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                        >
                          <Plus size={12} /> 添加 Model
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {spec.models.map((model, mIdx) => {
                          const isMAbnormal = isAbnormalStr(model.name);
                          return (
                            <div key={model.id} className={`flex items-center gap-4 p-4 rounded-2xl border group/model ${isMAbnormal ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50/50 border-slate-100'}`}>
                              <div className={`w-6 h-6 border rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isMAbnormal ? 'bg-white border-rose-300 text-rose-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                                {mIdx + 1}
                              </div>
                              <div className="flex-1 relative">
                                {validModels.length > 0 ? (
                                  <select 
                                    value={model.name}
                                    onChange={e => updateModel(activeTab, spec.id, model.id, { name: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-2 text-xs font-bold font-mono outline-none appearance-none ${isMAbnormal ? 'bg-white border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                  >
                                    <option value="" disabled>选择 Model 号...</option>
                                    {validModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    {model.name && !validModels.includes(model.name) && <option value={model.name}>{model.name}</option>}
                                  </select>
                                ) : (
                                  <input 
                                    type="text" 
                                    value={model.name}
                                    onChange={e => updateModel(activeTab, spec.id, model.id, { name: e.target.value })}
                                    className={`w-full border rounded-xl px-4 py-2 text-xs font-bold font-mono outline-none ${isMAbnormal ? 'bg-white border-rose-300 text-rose-700 focus:ring-rose-500' : 'bg-white border-slate-200 focus:ring-indigo-500'}`}
                                    placeholder="输入 Model 编号..."
                                  />
                                )}
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                              </div>
                              <div className="w-24">
                                <div className={`flex items-center gap-1 border rounded-xl px-3 py-2 ${isMismatch ? 'bg-white border-rose-300' : 'bg-white border-slate-200'}`}>
                                  <span className="text-[10px] font-bold text-slate-400">x</span>
                                  <input 
                                    type="number" 
                                    value={model.qty}
                                    onChange={e => updateModel(activeTab, spec.id, model.id, { qty: parseInt(e.target.value) || 0 })}
                                    className="w-full text-xs font-bold outline-none bg-transparent"
                                  />
                                </div>
                              </div>
                              {spec.models.length > 1 && (
                                <button onClick={() => removeModel(activeTab, spec.id, model.id)} className="p-2 text-slate-300 hover:text-rose-400 transition-colors">
                                  <Trash size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!configs[activeTab] || configs[activeTab]?.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center gap-3">
                  <div className="p-4 bg-slate-50 rounded-full text-slate-200">
                    <Layers size={32} />
                  </div>
                  <p className="text-slate-400 text-xs italic">当前配件分类暂无配置数据，请点击右上角添加新规格</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <AlertTriangle size={16} className="text-amber-500" />
            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-tight">
              保存将立即更新该资产硬件快照。 <span className="text-slate-600 font-bold">SN: {server.sn}</span><br/>
              如果规格与 Model 数量不匹配，或数据识别包含异常关键字，表格及侧边栏将显示红警。
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="px-8 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-2xl transition-all"
            >
              取消并退出
            </button>
            <button 
              onClick={() => setShowConfirm(true)} 
              className="flex items-center gap-2 px-12 py-3 bg-green-600 text-white rounded-2xl text-xs font-bold shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
            >
              <Save size={16} /> 确认更新配置
            </button>
          </div>
        </div>

        {/* Confirmation */}
        {showConfirm && (
          <div className="absolute inset-0 z-[130] bg-slate-900/40 backdrop-blur-[6px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full mx-4 flex flex-col items-center text-center border border-white">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50/50">
                <AlertTriangle size={40} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">确认提交硬件变更？</h4>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                正在更新 SN: <b>{server.sn}</b> 的核心硬件参数。此操作将被永久记录在资产变更审计日志中。
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  继续检查
                </button>
                <button 
                  onClick={handleFinalSave}
                  className="flex-1 px-4 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  确认保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
