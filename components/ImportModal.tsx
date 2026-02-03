
import React, { useState, useRef, useMemo } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, Save, ChevronDown, ListFilter, Cpu, HardDrive, Layout, Server, FileUp } from 'lucide-react';

export interface ParsedConfig {
  id: string;
  sourceFiles: string[];
  suggestedSNs: string[];
  targetSNs: string[]; // 用户手动分配的 SN
  specs: {
    cpu: string;
    gpu: string;
    memory: string;
    ssd: string;
  };
  models: {
    cpuModel: string;
    gpuModel: string;
    memoryModel: string;
    ssdModel: string;
  };
}

const ENUM_OPTIONS: Record<string, { specs: string[]; models: string[] }> = {
  cpu: {
    specs: ['Intel Xeon 8358 x2', 'Intel Xeon Platinum 8480C x2', 'AMD EPYC 9654 x2', 'Intel Xeon 8350 x2'],
    models: ['Intel-8358-Standard-V2', 'Intel-8480C-QS', 'AMD-EPYC-9654-Retail', 'Intel-8358-Retail']
  },
  gpu: {
    specs: ['NVIDIA A100 80GB x8', 'NVIDIA H100 80GB x8', 'NVIDIA L40S x4', 'NVIDIA RTX 4090 x2', '-'],
    models: ['A100-PG150-S01 x8', 'H100-PG520-S01 x8', 'L40S-NVLink-V1', '-']
  },
  memory: {
    specs: ['256GB', '512GB', '1024GB', '2048GB'],
    models: ['Samsung-DDR4-3200 x8', 'Samsung-DDR4-3200 x16', 'Samsung-DDR4-3200 x32', 'Hynix-DDR5-4800 x16']
  },
  ssd: {
    specs: ['3.84TB x2', '1.92TB x4', '7.68TB x1', '3.84TB x4'],
    models: ['Samsung-PM1733', 'Samsung-PM9A3-V2', 'Intel-D7-P5510', 'Micron-7450-Pro']
  }
};

/**
 * 增强异常检测：包含空值、"-" 以及特定的错误关键字
 */
const isAbnormal = (str: string) => {
  if (!str || str.trim() === '' || str.trim() === '-') return true;
  const lower = str.toLowerCase();
  return lower.includes('err:') || lower.includes('unknown') || lower.includes('mismatch') || lower.includes('bad');
};

/**
 * 混合编辑组件：支持下拉枚举与自由输入
 */
const EditableCell: React.FC<{
  value: string;
  options: string[];
  onChange: (val: string) => void;
  isErrorHighlight?: boolean;
}> = ({ value, options, onChange, isErrorHighlight }) => {
  const [isCustom, setIsCustom] = useState(!options.includes(value) && value !== "");

  return (
    <div className="relative flex-1">
      {isCustom ? (
        <div className="relative">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-2 py-1 text-[11px] border rounded focus:outline-none focus:ring-1 pr-7 ${
              isErrorHighlight && isAbnormal(value) ? 'bg-red-50 border-red-300 text-red-600 focus:ring-red-500' : 'border-blue-300 focus:ring-blue-500'
            }`}
          />
          <button 
            onClick={() => setIsCustom(false)}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500"
            title="返回选择列表"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => e.target.value === "__CUSTOM__" ? setIsCustom(true) : onChange(e.target.value)}
            className={`w-full px-2 py-1 pr-6 text-[11px] border rounded appearance-none cursor-pointer focus:outline-none focus:ring-1 ${
              isErrorHighlight && isAbnormal(value) ? 'bg-red-50 border-red-200 text-red-600 focus:ring-red-500 font-medium' : 'border-gray-200 focus:ring-blue-500 hover:border-blue-300'
            }`}
          >
            <option value="" disabled>请选择...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {!options.includes(value) && value !== "" && <option value={value}>{value}</option>}
            <option value="__CUSTOM__" className="text-blue-600 font-bold">+ 补充自定义内容...</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={12} />
          </div>
          {isErrorHighlight && isAbnormal(value) && (
            <AlertTriangle size={12} className="absolute right-6 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none" />
          )}
        </div>
      )}
    </div>
  );
};

export const ImportModal: React.FC<{ isOpen: boolean; onClose: () => void; onApply: (configs: ParsedConfig[]) => void }> = ({ isOpen, onClose, onApply }) => {
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedConfigs, setParsedConfigs] = useState<ParsedConfig[]>([]);
  const [selectedConfigIds, setSelectedConfigIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snFileInputRef = useRef<HTMLInputElement>(null);
  const [currentActiveConfigId, setCurrentActiveConfigId] = useState<string | null>(null);

  const selectedConfigs = useMemo(() => parsedConfigs.filter(c => selectedConfigIds.has(c.id)), [parsedConfigs, selectedConfigIds]);

  if (!isOpen) return null;

  const handleFileUpload = () => {
    setIsParsing(true);
    setTimeout(() => {
      const mockParsed: ParsedConfig[] = [
        {
          id: 'config-1',
          sourceFiles: ['pxe_log_001.txt', 'pxe_log_002.txt'],
          suggestedSNs: ['SN-1001', 'SN-1002', 'SN-1003'],
          targetSNs: ['SN-1001', 'SN-1002', 'SN-1003'],
          specs: { cpu: 'Intel Xeon 8358 x2', gpu: 'NVIDIA A100 80GB x8', memory: '1024GB', ssd: '-' },
          models: { cpuModel: 'Intel-8358-Standard-V2', gpuModel: 'A100-PG150-S01 x8', memoryModel: 'Samsung-DDR4-3200 x32', ssdModel: 'ERR: Bad Sector Detected' }
        },
        {
          id: 'config-2',
          sourceFiles: ['pxe_log_batch_b.zip'],
          suggestedSNs: ['SN-1005', 'SN-1006'],
          targetSNs: ['SN-1005', 'SN-1006'],
          specs: { cpu: '', gpu: '-', memory: '512GB', ssd: '1.92TB x2' },
          models: { cpuModel: 'ERR: Unknown Rev', gpuModel: '-', memoryModel: 'Hynix-DDR4-3200 x16', ssdModel: 'Samsung-PM9A3-V2' }
        }
      ];
      setParsedConfigs(mockParsed);
      setSelectedConfigIds(new Set(mockParsed.map(c => c.id)));
      setIsParsing(false);
      setStep(2);
    }, 1200);
  };

  const handleSNFileUpload = (e: React.ChangeEvent<HTMLInputElement>, configId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const sns = content.split(/[\s,;]+/).filter(Boolean);
      updateConfig(configId, { targetSNs: sns });
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const updateConfig = (id: string, updates: Partial<ParsedConfig>) => {
    setParsedConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateNested = (id: string, type: 'specs' | 'models', field: string, value: string) => {
    setParsedConfigs(prev => prev.map(c => c.id === id ? { ...c, [type]: { ...(c[type] as any), [field]: value } } : c));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[1150px] max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">导入离线抓取配置</h3>
              <p className="text-[10px] text-gray-500">解析 PXE/离线抓取文件，支持多机型批量抽检与改配</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
        </div>

        {/* Steps Nav */}
        <div className="flex bg-white px-10 py-4 border-b border-gray-50 shadow-sm">
          {[
            { n: 1, l: '解析文件' },
            { n: 2, l: '核对 SN 与规格修正' },
            { n: 3, l: '应用资产分配' }
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-2 ${step >= s.n ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-200'}`}>{s.n}</div>
                <span className="text-xs font-semibold">{s.l}</span>
              </div>
              {i < 2 && <div className={`flex-1 mx-6 h-px ${step > s.n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 min-h-[450px] bg-slate-50/30">
          {step === 1 && (
            <div className="h-full flex flex-col items-center justify-center">
              {isParsing ? (
                <div className="text-center">
                  <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">深度解析 PXE 日志中，提取硬件 Model 与 SN...</p>
                </div>
              ) : (
                <div 
                  className="w-full max-w-xl p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center hover:border-blue-400 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layout size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-700">点击上传 PXE 抓取结果</h4>
                  <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed">系统将自动从日志中识别服务器 SN 及其对应的硬件配置。<br/>支持多文件批量上传（抽检模式）。</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
                <span className="text-[11px] text-amber-800 flex items-center gap-2">
                  <AlertTriangle size={14} /> 
                  <b>抽检核对：</b>请确认下方解析出的服务器 SN 与配置规格是否一致。如有异常或空值，请修正。
                </span>
                <span className="text-[10px] text-gray-500 font-mono bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                  检测到配置模版：{parsedConfigs.length} 组 | 覆盖物理机：{parsedConfigs.reduce((acc, c) => acc + c.suggestedSNs.length, 0)} 台
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                {parsedConfigs.map((config) => (
                  <div key={config.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex">
                    {/* 左侧：SN 列表 (抽检信息) */}
                    <div className="w-48 bg-gray-50 border-r border-gray-100 flex flex-col">
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center gap-2">
                        <Server size={12} className="text-gray-500" />
                        <span className="text-[11px] font-bold text-gray-600">解析到的 SN</span>
                      </div>
                      <div className="p-3 flex-1 overflow-y-auto max-h-[300px] space-y-1.5 custom-scrollbar">
                        {config.suggestedSNs.map(sn => (
                          <div key={sn} className="flex items-center justify-between bg-white border border-gray-200 px-2 py-1 rounded group">
                            <span className="text-[10px] font-mono text-gray-700">{sn}</span>
                            <CheckCircle size={10} className="text-green-500 opacity-50 group-hover:opacity-100" />
                          </div>
                        ))}
                      </div>
                      <div className="p-2 border-t border-gray-100 text-[10px] text-gray-400 text-center italic">
                        共 {config.suggestedSNs.length} 台
                      </div>
                    </div>

                    {/* 右侧：配置详情修正 */}
                    <div className="flex-1 flex flex-col">
                      <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedConfigIds.has(config.id)} onChange={() => {
                            const next = new Set(selectedConfigIds);
                            next.has(config.id) ? next.delete(config.id) : next.add(config.id);
                            setSelectedConfigIds(next);
                          }} className="rounded text-blue-600 w-4 h-4" />
                          <span className="text-xs font-bold text-gray-700">配置模版 ID: {config.id}</span>
                          <div className="flex gap-1">
                            {config.sourceFiles.map(f => (
                               <span key={f} className="text-[9px] bg-white text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 flex items-center gap-1 shadow-xs">
                                 <FileText size={8} /> {f}
                               </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100 text-left">
                              <th className="pb-2 font-medium w-24">硬件组件</th>
                              <th className="pb-2 font-medium w-64">规格修正 (Spec)</th>
                              <th className="pb-2 font-medium">Model 号修正 (下拉或手动)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {Object.keys(config.specs).map((key) => {
                              const specVal = (config.specs as any)[key];
                              const modelKey = `${key}Model`;
                              const modelVal = (config.models as any)[modelKey];
                              const opts = ENUM_OPTIONS[key] || { specs: [], models: [] };
                              
                              return (
                                <tr key={key}>
                                  <td className="py-2.5 font-bold text-gray-500 uppercase flex items-center gap-2">
                                    {key === 'cpu' && <Cpu size={12} className="text-blue-400" />}
                                    {key === 'ssd' && <HardDrive size={12} className="text-teal-400" />}
                                    {key}
                                  </td>
                                  <td className="py-2.5 pr-6">
                                    <EditableCell 
                                      value={specVal} 
                                      options={opts.specs} 
                                      onChange={(v) => updateNested(config.id, 'specs', key, v)} 
                                      isErrorHighlight 
                                    />
                                  </td>
                                  <td className="py-2.5">
                                    <EditableCell 
                                      value={modelVal} 
                                      options={opts.models} 
                                      onChange={(v) => updateNested(config.id, 'models', modelKey, v)} 
                                      isErrorHighlight 
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 gap-6">
                {selectedConfigs.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 italic">请在上一阶段勾选需要应用的配置模版</div>
                ) : selectedConfigs.map((config) => (
                  <div key={config.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 bg-blue-500 rounded-full" />
                        <h5 className="text-sm font-bold text-gray-800">分配资产 SN - 模版 {config.id}</h5>
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-gray-100 rounded">CPU: {config.specs.cpu}</span>
                         <span className="px-2 py-0.5 bg-gray-100 rounded">MEM: {config.specs.memory}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[11px] font-bold text-gray-600">确认目标服务器 SN</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setCurrentActiveConfigId(config.id);
                                snFileInputRef.current?.click();
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
                            >
                              <FileUp size={12} /> 导入 SN 文件
                            </button>
                            <input 
                              type="file" 
                              ref={snFileInputRef} 
                              className="hidden" 
                              accept=".txt,.csv"
                              onChange={(e) => currentActiveConfigId && handleSNFileUpload(e, currentActiveConfigId)}
                            />
                          </div>
                        </div>
                        <textarea 
                          value={config.targetSNs.join('\n')}
                          onChange={(e) => updateConfig(config.id, { targetSNs: e.target.value.split(/[\s,;]+/).filter(Boolean) })}
                          placeholder="手动输入目标资产 SN，或点击上方导入文件..."
                          className="w-full h-32 p-3 text-xs font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                        <div className="mt-2 flex justify-between">
                          <button 
                            onClick={() => updateConfig(config.id, { targetSNs: [...config.suggestedSNs] })}
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <ListFilter size={10} /> 使用解析到的抽检 SN ({config.suggestedSNs.length}个)
                          </button>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">待改配资产：{config.targetSNs.length} 台</span>
                        </div>
                      </div>
                      
                      <div className="w-1/3 bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-inner">
                        <h6 className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-wider">改配资产列表</h6>
                        <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1 custom-scrollbar">
                          {config.targetSNs.map(sn => (
                            <div key={sn} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-gray-200 shadow-xs">
                              <span className="text-[10px] font-mono font-bold text-gray-600">{sn}</span>
                              <CheckCircle size={10} className="text-green-500" />
                            </div>
                          ))}
                          {config.targetSNs.length === 0 && <div className="text-center py-8 text-[10px] text-gray-300 italic">暂无目标 SN</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <AlertTriangle size={12} className="text-amber-500" />
            <span className="text-[10px]">应用导入后，相应 SN 的资产“配置来源”将自动更新为“改配”。</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">取消</button>
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-5 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">上一步</button>}
            {step < 3 ? (
              <button 
                onClick={() => setStep(step + 1)} 
                disabled={step === 1 && !isParsing}
                className={`flex items-center gap-2 px-8 py-2 text-xs font-medium text-white rounded-lg shadow-lg transition-all ${step === 1 && !isParsing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
              >
                下一步 <ChevronRight size={14} />
              </button>
            ) : (
              <button 
                onClick={() => { onApply(selectedConfigs); onClose(); }} 
                className="flex items-center gap-2 px-10 py-2 text-xs font-medium text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 active:scale-95 transition-all"
              >
                <Save size={14} /> 确认并应用改配
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
