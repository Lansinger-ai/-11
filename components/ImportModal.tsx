
import React, { useState, useRef, useMemo } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, Save, ChevronDown, ListFilter, Cpu, HardDrive, Layout, Server, FileUp, ArrowRight, Layers, Settings2, Database, Search, Hash, PlusCircle, AlertCircle, Activity, ExternalLink, Factory, FileArchive, Check, RotateCcw } from 'lucide-react';

export interface ParsedConfig {
  id: string;
  sourceFiles: string[];
  suggestedSNs: string[];
  additionalSNs: string[]; 
  rawIds: Record<string, string>; 
  rawQtys: Record<string, number>; 
  specs: Record<string, string>;
  models: Record<string, string>;
}

interface SummaryCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  issues: {
    rawId: string;
    templateIds: string[];
    qty: number;
  }[];
}

const MANUFACTURERS = [
  '浪潮 (Inspur)',
  '戴尔 (Dell)',
  '惠普 (HPE)',
  '联想 (Lenovo)',
  '华为 (Huawei)',
  '超微 (Supermicro)',
  '中兴 (ZTE)',
  '新华三 (H3C)',
  '超聚变 (FusionServer)'
];

const ENUM_OPTIONS: Record<string, { specs: string[]; models: string[] }> = {
  gpu: {
    specs: ['NVIDIA A100 80GB x8', 'NVIDIA H100 80GB x8', 'NVIDIA L40S x4'],
    models: ['A100-PG150-S01 x8', 'H100-PG520-S01 x8', 'L40S-NVLink-V1']
  },
  cpu: {
    specs: ['Intel Xeon 8358 x2', 'Intel Xeon Platinum 8480C x2', 'AMD EPYC 9654 x2'],
    models: ['Intel-8358-Standard-V2', 'Intel-8480C-QS', 'AMD-EPYC-9654-Retail']
  },
  memory: {
    specs: ['256GB (32GB x8)', '1024GB (64GB x16)', '2048GB (128GB x16)'],
    models: ['Samsung-DDR4-3200 x8', 'Hynix-DDR4-3200 x8', 'Samsung-DDR4-3200 x8']
  },
  networkCard: {
    specs: ['100G Dual Port x1', '25G Quad Port x1', '200G HDR x1'],
    models: ['Mellanox-CX6-VPI', 'Mellanox-CX4-LX', 'Mellanox-CX5-EN']
  },
  harddisk: {
    specs: ['2TB SATA x2', '8TB SAS x12'],
    models: ['ST2000-NM001', 'Seagate-Exos-X18']
  },
  ssd: {
    specs: ['3.84TB NVMe x2', '7.68TB NVMe x1', '1.92TB SATA x4'],
    models: ['Samsung-PM1733', 'Micron-7450-Pro', 'Samsung-PM9A3-V2']
  },
  raid: {
    specs: ['RAID 1', 'RAID 10'],
    models: ['9460-16i-Primary', '9361-8i-Adapter']
  },
  fpga: {
    specs: ['Xilinx Alveo U250 x1'],
    models: ['U250-PQ123']
  }
};

const CATEGORIES = [
  { id: 'gpu', label: 'GPU', icon: <Layout size={12} className="text-indigo-400" /> },
  { id: 'cpu', label: 'CPU', icon: <Cpu size={12} className="text-blue-400" /> },
  { id: 'memory', label: '内存', icon: <Settings2 size={12} className="text-purple-400" /> },
  { id: 'networkCard', label: '网卡', icon: <Layout size={12} className="text-emerald-400" /> },
  { id: 'harddisk', label: '硬盘', icon: <HardDrive size={12} className="text-amber-400" /> },
  { id: 'ssd', label: 'SSD', icon: <HardDrive size={12} className="text-teal-400" /> },
  { id: 'raid', label: 'RAID', icon: <Settings2 size={12} className="text-slate-400" /> },
  { id: 'fpga', label: 'FPGA', icon: <Cpu size={12} className="text-rose-400" /> },
];

const isAbnormal = (str: string) => {
  if (!str || str.trim() === '' || str.trim() === '-') return false;
  const lower = str.toLowerCase();
  return lower.includes('err:') || lower.includes('unknown') || lower.includes('mismatch') || lower.includes('bad');
};

const EditableCell: React.FC<{
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  isMono?: boolean;
}> = ({ value, options, onChange, placeholder = "请选择...", isMono }) => {
  const [isCustom, setIsCustom] = useState(!options.includes(value) && value !== "");
  const abnormal = isAbnormal(value);

  return (
    <div className="relative flex-1">
      {isCustom ? (
        <div className="relative">
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2 pr-7 transition-all ${
              abnormal ? 'bg-rose-50 border-rose-300 text-rose-700 focus:ring-rose-200' : 'bg-white border-blue-200 focus:ring-blue-100'
            } ${isMono ? 'font-mono' : ''}`}
          />
          <button onClick={() => setIsCustom(false)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500">
            <X size={10} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => e.target.value === "__CUSTOM__" ? setIsCustom(true) : onChange(e.target.value)}
            className={`w-full px-3 py-1.5 pr-6 text-[11px] border rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 transition-all ${
              abnormal ? 'bg-rose-50 border-rose-200 text-rose-600 focus:ring-rose-100 font-bold' : 'bg-white border-gray-200 focus:ring-blue-100 hover:border-blue-300'
            } ${isMono ? 'font-mono' : ''}`}
          >
            <option value="" disabled>{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            {!options.includes(value) && value !== "" && <option value={value}>{value}</option>}
            <option value="__CUSTOM__" className="text-blue-600 font-bold">+ 自定义输入</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={12} />
          </div>
        </div>
      )}
    </div>
  );
};

export const ImportModal: React.FC<{ isOpen: boolean; onClose: () => void; onApply: (configs: any[]) => void }> = ({ isOpen, onClose, onApply }) => {
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [parsedConfigs, setParsedConfigs] = useState<ParsedConfig[]>([]);
  const [selectedConfigIds, setSelectedConfigIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snFileInputRef = useRef<HTMLInputElement>(null);
  const [currentActiveConfigId, setCurrentActiveConfigId] = useState<string | null>(null);
  const [detailCategory, setDetailCategory] = useState<SummaryCategory | null>(null);

  const allDetectedSNs = useMemo(() => {
    return parsedConfigs.reduce((acc, curr) => [...acc, ...curr.suggestedSNs], [] as string[]);
  }, [parsedConfigs]);

  const selectedConfigs = useMemo(() => {
    return parsedConfigs.filter(c => selectedConfigIds.has(c.id)).map(c => {
      // 在应用时，将厂商信息前置到所有规格描述中
      const updatedSpecs: Record<string, string> = {};
      Object.entries(c.specs).forEach(([key, value]) => {
        // Fix: Cast 'value' to string to access 'startsWith'
        const val = value as string;
        if (val !== '-' && !val.startsWith(selectedManufacturer)) {
          updatedSpecs[key] = `${selectedManufacturer} ${val}`;
        } else {
          updatedSpecs[key] = val;
        }
      });
      return {
        ...c,
        specs: updatedSpecs,
        targetSNs: [...new Set([...c.suggestedSNs, ...c.additionalSNs])]
      };
    });
  }, [parsedConfigs, selectedConfigIds, selectedManufacturer]);

  const unmappedSummary = useMemo<Record<string, SummaryCategory>>(() => {
    const summary: Record<string, SummaryCategory> = {};
    
    CATEGORIES.forEach(cat => {
      summary[cat.id] = { id: cat.id, label: cat.label, icon: cat.icon, issues: [] };
      
      parsedConfigs.forEach(config => {
        const rawId = config.rawIds[cat.id] || '-';
        const modelVal = config.models[`${cat.id}Model`] || '-';
        const isUnknown = rawId.includes('UNKNOWN') || rawId === '-' || isAbnormal(modelVal);
        
        if (isUnknown && rawId !== '-') {
          const existing = summary[cat.id].issues.find(i => i.rawId === rawId);
          if (existing) {
            if (!existing.templateIds.includes(config.id)) existing.templateIds.push(config.id);
            existing.qty += config.rawQtys[cat.id] || 0;
          } else {
            summary[cat.id].issues.push({
              rawId,
              templateIds: [config.id],
              qty: config.rawQtys[cat.id] || 0
            });
          }
        }
      });
    });
    
    return summary;
  }, [parsedConfigs]);

  const totalUnmappedCount = useMemo(() => {
    return (Object.values(unmappedSummary) as SummaryCategory[]).reduce((acc, cat) => acc + cat.issues.length, 0);
  }, [unmappedSummary]);

  const enhancedSummary = useMemo<Record<string, SummaryCategory>>(() => {
    const s: Record<string, SummaryCategory> = { ...unmappedSummary };
    if (s['memory'] && s['memory'].issues.length > 0) {
      for(let i=1; i<=35; i++) {
        s['memory'].issues.push({
          rawId: `UNKNOWN_MEM_CHIP_00${i}_REVISION_A`,
          templateIds: ['TEMPLATE-A100-MISMATCH-40'],
          qty: 16
        });
      }
    }
    return s;
  }, [unmappedSummary]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsParsing(true);
    
    setTimeout(() => {
      const allSNs = Array.from({ length: 100 }, (_, i) => `SN-IMPORT-${2000 + i}`);
      
      const configA: ParsedConfig = {
        id: 'TEMPLATE-H100-NODE-60',
        // Fix: Cast array elements to any or File to access 'name'
        sourceFiles: Array.from(files).map((f: any) => f.name),
        suggestedSNs: allSNs.slice(0, 60),
        additionalSNs: [],
        rawIds: { gpu: 'NV-ID-H100-SXM5-80GB', cpu: 'GenuineIntel-Family-6-Model-143', memory: 'PN: M393A8G40BB2-CT7', networkCard: 'PCI-15B3-1021', harddisk: 'ST4000NM002', ssd: 'MZ-PLJ3T20', raid: '9460-16i-Primary', fpga: '-' },
        rawQtys: { gpu: 8, cpu: 2, memory: 16, networkCard: 2, harddisk: 4, ssd: 2, raid: 1, fpga: 0 },
        specs: { gpu: 'NVIDIA H100 80GB x8', cpu: 'Intel Xeon Platinum 8480C x2', memory: '1024GB (64GB x16)', networkCard: '200G HDR x1', harddisk: '4TB SATA x4', ssd: '3.84TB NVMe x2', raid: 'RAID 1', fpga: '-' },
        models: { gpuModel: 'H100-PG520-S01 x8', cpuModel: 'Intel-8480C-QS', memoryModel: 'Samsung-DDR5-4800 x16', networkCardModel: 'Mellanox-CX6-VPI', harddiskModel: 'ST4000-NM002 x4', ssdModel: 'Samsung-PM1733', raidModel: '9460-16i-Primary', fpgaModel: '-' }
      };

      const configB: ParsedConfig = {
        id: 'TEMPLATE-A100-MISMATCH-40',
        // Fix: Cast array elements to any or File to access 'name'
        sourceFiles: Array.from(files).map((f: any) => f.name),
        suggestedSNs: allSNs.slice(60, 100),
        additionalSNs: [],
        rawIds: { gpu: 'NV-ID-A100-SXM4', cpu: 'GenuineIntel-Family-6-Model-106', memory: 'UNKNOWN-MEM-SERIES-X', networkCard: 'PCI-15B3-1017', harddisk: 'UNKNOWN_PART_HDD_X1', ssd: 'MZ-76E1T0', raid: 'MegaRAID-SAS-9361', fpga: 'ALVEO-U250-PQ' },
        rawQtys: { gpu: 8, cpu: 2, memory: 8, networkCard: 1, harddisk: 2, ssd: 4, raid: 1, fpga: 1 },
        specs: { gpu: 'NVIDIA A100 80GB x8', cpu: 'Intel Xeon 8358 x2', memory: 'ERR: Unknown Layout', networkCard: '100G Dual Port x1', harddisk: 'ERR: Unknown Mapping', ssd: '1.92TB SATA x4', raid: 'RAID 10', fpga: 'Xilinx Alveo U250 x1' },
        models: { gpuModel: 'A100-PG150-S01 x8', cpuModel: 'Intel-8358-Standard-V2', memoryModel: 'ERR: Unmapped Part', networkCardModel: 'Mellanox-CX6-VPI', harddiskModel: 'ERR: Unmapped Part', ssdModel: 'Samsung-PM9A3-V2', raidModel: '9361-8i-Adapter', fpgaModel: 'U250-PQ123' }
      };

      setParsedConfigs([configA, configB]);
      setSelectedConfigIds(new Set([configA.id, configB.id]));
      setIsParsing(false);
      setHasUploaded(true);
    }, 1200);
  };

  const handleSNFileUpload = (e: React.ChangeEvent<HTMLInputElement>, configId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const newSns = (event.target?.result as string).split(/[\s,;]+/).filter(Boolean);
      setParsedConfigs(prev => prev.map(c => c.id === configId ? { ...c, additionalSNs: [...new Set([...c.additionalSNs, ...newSns])] } : c));
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
      <div className="bg-white w-[1320px] max-h-[94vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white relative">
        
        {/* Detail Popup for Unmapped Items */}
        {detailCategory && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-12 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-3xl shadow-sm">
                      {detailCategory.icon}
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-slate-800 tracking-tight">待对齐 Part ID 详情: {detailCategory.label}</h4>
                       <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">共有 <span className="text-rose-600 font-black">{detailCategory.issues.length}</span> 个独立的原始 Part ID 无法命中库模型</p>
                    </div>
                 </div>
                 <button onClick={() => setDetailCategory(null)} className="p-3 hover:bg-gray-200 rounded-full text-gray-400 transition-all active:scale-90"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-auto p-10 custom-scrollbar bg-white">
                <div className="grid grid-cols-12 gap-6 mb-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                   <div className="col-span-6">抓取到的原始 Part ID</div>
                   <div className="col-span-2 text-center">总设备数量</div>
                   <div className="col-span-4">涉及模板预览</div>
                </div>
                <div className="space-y-3">
                  {detailCategory.issues.map((issue, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center gap-6 p-6 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:border-indigo-100 hover:shadow-lg transition-all group">
                       <div className="col-span-6">
                          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-mono font-black text-slate-700 break-all shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-700">
                            {issue.rawId}
                          </div>
                       </div>
                       <div className="col-span-2 text-center">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[12px] font-black rounded-xl">
                            <Hash size={12} /> {issue.qty}
                          </span>
                       </div>
                       <div className="col-span-4 flex flex-wrap gap-1.5">
                          {issue.templateIds.map(tid => (
                            <span key={tid} className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-bold text-slate-400 rounded-lg group-hover:border-indigo-100 group-hover:text-indigo-400 transition-colors">
                              {tid.split('-').slice(1).join('-')}
                            </span>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="px-10 py-6 border-t border-gray-100 bg-gray-50/30 flex justify-end">
                 <button onClick={() => setDetailCategory(null)} className="px-10 py-3 bg-slate-800 text-white rounded-2xl text-[12px] font-bold shadow-xl shadow-slate-200 hover:bg-slate-700 transition-all active:scale-95">
                    关闭详情
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-10 py-7 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100">
              <Upload size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">导入配置文件 (离线抓取)</h3>
              <p className="text-[12px] text-gray-500 font-medium tracking-tight">自动对齐 <span className="text-indigo-600 font-bold underline decoration-indigo-200 decoration-2 underline-offset-4">抓取数据 → 型号映射 → 规格对标</span> 逻辑链路</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
        </div>

        {/* Steps Navigation */}
        <div className="flex bg-white px-16 py-6 border-b border-gray-50 shadow-sm justify-between">
          {[
            { n: 1, l: '解析源文件与指定厂商' },
            { n: 2, l: '规格映射与数量核对' },
            { n: 3, l: '批量资产应用' }
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`flex items-center gap-4 ${step >= s.n ? 'text-indigo-600' : 'text-gray-300'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.n ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 border border-gray-200'}`}>{s.n}</div>
                <span className="text-[13px] font-bold whitespace-nowrap">{s.l}</span>
              </div>
              {i < 2 && <div className={`flex-1 mx-12 h-0.5 mt-4.5 transition-colors ${step > s.n ? 'bg-indigo-600' : 'bg-gray-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-12 bg-slate-50/20 custom-scrollbar min-h-[550px]">
          {step === 1 && (
            <div className="h-full flex flex-col items-center justify-start gap-10">
              {isParsing ? (
                <div className="text-center animate-pulse mt-32">
                  <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-8" />
                  <p className="text-base font-bold text-gray-600 tracking-tight italic">正在扫描上传的文件配置快照，聚合资产 SN...</p>
                </div>
              ) : !hasUploaded ? (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 mt-20">
                    <div 
                      className="w-full p-24 border-2 border-dashed border-indigo-200 rounded-[4rem] bg-white flex flex-col items-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group shadow-xl shadow-indigo-100/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                        <FileArchive size={48} />
                      </div>
                      <h4 className="text-2xl font-black text-slate-800">上传抓取脚本日志或压缩包</h4>
                      <p className="text-sm text-slate-400 mt-4 text-center leading-relaxed">
                        支持一次性上传多个节点的离线抓取文件。<br/>
                        系统将自动识别 <span className="font-bold text-slate-600">Serial Number</span> 并归纳同类配置。
                      </p>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                    </div>
                </div>
              ) : (
                <div className="w-full max-w-5xl space-y-10 animate-in fade-in zoom-in-95 duration-400">
                  {/* Parsing Results Summary */}
                  <div className="bg-white border border-gray-200 rounded-[3rem] p-10 shadow-xl shadow-indigo-100/10 flex flex-col gap-8">
                     <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                             <Check size={24} />
                           </div>
                           <div>
                             <h4 className="text-lg font-black text-slate-800 tracking-tight">源文件解析完成</h4>
                             <p className="text-[12px] text-slate-400 font-medium">成功从 {parsedConfigs.reduce((acc, c) => acc + c.sourceFiles.length, 0)} 个文件中提取到资产数据</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => { setHasUploaded(false); setParsedConfigs([]); setSelectedManufacturer(''); }}
                          className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw size={12} /> 重新上传
                        </button>
                     </div>

                     <div className="grid grid-cols-12 gap-10">
                        {/* SN Tag Cloud */}
                        <div className="col-span-5 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">发现的资产 SN ({allDetectedSNs.length})</span>
                           </div>
                           <div className="w-full h-44 p-4 bg-slate-50 border border-slate-100 rounded-[2rem] overflow-y-auto custom-scrollbar-thin flex flex-wrap gap-2 content-start">
                              {allDetectedSNs.map(sn => (
                                <div key={sn} className="px-3 py-1 bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-500 rounded-lg shadow-sm">
                                  {sn}
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* Manufacturer Selection Grid */}
                        <div className="col-span-7 space-y-4">
                           <div className="flex items-center gap-3">
                              <Factory size={16} className="text-indigo-600" />
                              <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">请选择这批资产的服务器厂商 (必选)</span>
                           </div>
                           <div className="grid grid-cols-3 gap-3">
                              {MANUFACTURERS.map(brand => (
                                <button
                                  key={brand}
                                  onClick={() => setSelectedManufacturer(brand)}
                                  className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 font-bold text-[12px] transition-all duration-200 ${
                                    selectedManufacturer === brand 
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-102' 
                                      : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100 hover:text-indigo-600'
                                  }`}
                                >
                                  {brand}
                                  {selectedManufacturer === brand && <Check size={14} className="animate-in zoom-in" />}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 p-6 rounded-[2rem]">
                     <AlertCircle size={24} className="text-amber-500 shrink-0" />
                     <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                        <b>厂商信息声明</b>：由于离线日志中缺少显式的品牌标记，系统将强制应用您所选的厂商前缀（如：{selectedManufacturer || '...'}）至后续步骤的所有硬件规格中，以确保资产库数据的品牌一致性。
                     </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-400">
              {/* Health and Alignment Status */}
              <div className="flex flex-col gap-6 bg-white border border-slate-200 p-8 rounded-[3.5rem] shadow-xl shadow-slate-100/50 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner ring-4 ring-indigo-50/50">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">Part ID 聚合解析概览 ({selectedManufacturer})</h4>
                      <p className="text-[12px] text-slate-400 font-medium italic mt-0.5">点击下方存在映射缺口的分类查看详细 Part ID 列表</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2.5 text-[11px] font-bold shadow-lg shadow-indigo-100">
                       <Layers size={14} /> 模板: 2
                    </div>
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 text-[11px] font-bold ${totalUnmappedCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                       <AlertTriangle size={14} /> 异常项: {totalUnmappedCount}
                    </div>
                  </div>
                </div>

                {/* COMPACT UNMAPPED SUMMARY */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {(Object.entries(enhancedSummary) as [string, SummaryCategory][]).map(([catId, summary]) => {
                    const hasIssues = summary.issues.length > 0;
                    return (
                      <div 
                        key={catId} 
                        onClick={() => hasIssues && setDetailCategory(summary)}
                        className={`group relative flex flex-col items-center justify-center py-4 px-2 rounded-[1.5rem] border transition-all duration-300 ${
                          hasIssues 
                            ? 'bg-rose-50/40 border-rose-200 shadow-md shadow-rose-100/10 hover:bg-rose-50 hover:border-rose-300 hover:scale-105 cursor-pointer' 
                            : 'bg-slate-50/20 border-slate-100 opacity-60'
                        }`}
                      >
                         <div className={`w-10 h-10 rounded-xl shadow-sm border mb-3 flex items-center justify-center transition-transform duration-300 ${
                           hasIssues ? 'bg-white border-rose-200 text-rose-500' : 'bg-white border-slate-100 text-slate-400'
                         }`}>
                            {React.cloneElement(summary.icon as React.ReactElement, { size: 16 })}
                         </div>
                         
                         <span className="text-[12px] font-black text-slate-600">{summary.label}</span>
                         
                         {hasIssues ? (
                            <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-rose-200 border border-white">
                              {summary.issues.length}项
                            </div>
                         ) : (
                           <div className="mt-2 flex items-center gap-1">
                             <CheckCircle size={10} className="text-emerald-500" />
                             <span className="text-[9px] font-bold text-emerald-600 uppercase">OK</span>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Template Mapping Area */}
              <div className="space-y-12">
                {parsedConfigs.map((config, idx) => (
                  <div key={config.id} className="bg-white border border-gray-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 flex transition-all hover:shadow-indigo-100/30">
                    <div className="w-72 bg-gray-50/50 border-r border-gray-100 flex flex-col">
                      <div className="px-6 py-6 bg-gray-100/50 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${idx === 0 ? 'bg-indigo-600' : 'bg-rose-500'}`}>
                             {idx + 1}
                           </div>
                           <span className="text-[13px] font-bold text-gray-700">模板 - {idx === 0 ? '标准配置' : '异常配置'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white border border-gray-200 text-[10px] rounded font-mono text-gray-400">{config.id}</span>
                        </div>
                      </div>
                      
                      <div className="px-6 py-4 bg-white/50 border-b border-gray-100 flex items-center justify-between">
                         <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">特征 SN ({config.suggestedSNs.length})</span>
                         <span className="text-[10px] text-indigo-500 font-bold italic">{Math.round((config.suggestedSNs.length / 100) * 100)}% 占比</span>
                      </div>

                      <div className="p-5 flex-1 overflow-y-auto max-h-[450px] space-y-2.5 custom-scrollbar bg-slate-50/30">
                        {config.suggestedSNs.map(sn => (
                          <div key={sn} className="bg-white border border-gray-100 px-4 py-2 rounded-2xl text-[11px] font-mono text-gray-600 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all cursor-default">
                            {sn}
                            <CheckCircle size={12} className="text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-white">
                      <div className="px-8 py-5 bg-gray-50/30 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <input type="checkbox" checked={selectedConfigIds.has(config.id)} onChange={() => {
                            const next = new Set(selectedConfigIds);
                            next.has(config.id) ? next.delete(config.id) : next.add(config.id);
                            setSelectedConfigIds(next);
                          }} className="rounded-xl text-indigo-600 w-6 h-6 cursor-pointer" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 tracking-tight">应用该解析模板至关联资产</span>
                            <span className="text-[10px] text-gray-400 font-medium">源文件快照: {config.sourceFiles.join(', ')}</span>
                          </div>
                        </div>
                        {idx === 1 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-lg animate-pulse">
                            <AlertTriangle size={12} />
                            部分映射缺失
                          </div>
                        )}
                      </div>

                      <div className="p-10">
                        <div className="grid grid-cols-12 gap-4 mb-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4">
                          <div className="col-span-2">配件类型</div>
                          <div className="col-span-10 grid grid-cols-12 gap-4">
                            <div className="col-span-4">解析出的原始数据 (Part ID & 数量)</div>
                            <div className="col-span-1"></div>
                            <div className="col-span-3">对准型号 (Model)</div>
                            <div className="col-span-1"></div>
                            <div className="col-span-3">层级规格 (Specification)</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {CATEGORIES.map((cat) => {
                            const rawId = config.rawIds[cat.id] || '-';
                            const rawQty = config.rawQtys[cat.id] ?? 0;
                            const specVal = config.specs[cat.id] || '-';
                            const modelKey = `${cat.id}Model`;
                            const modelVal = config.models[modelKey] || '-';
                            const opts = ENUM_OPTIONS[cat.id] || { specs: [], models: [] };
                            const isUnknownId = rawId.includes('UNKNOWN') || rawId === '-' || isAbnormal(modelVal);
                            const hasErr = isUnknownId || isAbnormal(modelVal) || isAbnormal(specVal);

                            return (
                              <div key={cat.id} className={`grid grid-cols-12 items-center p-4 rounded-[2rem] border transition-all ${hasErr ? 'bg-rose-50/30 border-rose-200' : 'hover:bg-slate-50 border-gray-100 hover:border-indigo-100'}`}>
                                <div className="col-span-2 flex items-center gap-3">
                                  <div className={`p-2.5 rounded-2xl shadow-sm border ${hasErr ? 'bg-rose-100 border-rose-200 text-rose-500' : 'bg-white border-gray-100'}`}>
                                    {cat.icon}
                                  </div>
                                  <span className="text-[12px] font-bold text-gray-600">{cat.label}</span>
                                </div>
                                <div className="col-span-10 grid grid-cols-12 items-center gap-4">
                                  <div className="col-span-4 flex items-center gap-2 relative">
                                    <div className={`flex-1 px-3 py-2.5 rounded-xl border text-[10px] font-mono font-bold truncate ${isUnknownId ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                      {rawId}
                                    </div>
                                    <div className={`shrink-0 w-12 px-2 py-2.5 rounded-xl border flex items-center justify-center gap-1 text-[10px] font-bold ${isUnknownId ? 'bg-rose-100 border-rose-300 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                                      <Hash size={10} /> {rawQty}
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex justify-center text-indigo-300"><ArrowRight size={14} /></div>
                                  <div className="col-span-3">
                                    <EditableCell value={modelVal} options={opts.models} onChange={(v) => updateNested(config.id, 'models', modelKey, v)} placeholder="请手动映射 Model..." isMono />
                                  </div>
                                  <div className="col-span-1 flex justify-center text-indigo-300"><ArrowRight size={14} /></div>
                                  <div className="col-span-3">
                                    <EditableCell value={specVal} options={opts.specs} onChange={(v) => updateNested(config.id, 'specs', cat.id, v)} placeholder="请对齐规格..." />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-400">
              <div className="grid grid-cols-1 gap-12">
                {selectedConfigs.length === 0 ? (
                  <div className="py-32 text-center text-gray-400 flex flex-col items-center gap-6">
                    <Layers size={64} className="opacity-20" />
                    <p className="italic text-base font-medium">请在核对环节勾选需要应用的配置模板</p>
                  </div>
                ) : selectedConfigs.map((config) => (
                  <div key={config.id} className="bg-white border border-gray-200 rounded-[3.5rem] p-12 shadow-2xl shadow-slate-100">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                      <div className="flex items-center gap-5">
                        <div className="w-4 h-10 bg-indigo-600 rounded-full" />
                        <div>
                          <h5 className="text-xl font-bold text-gray-900">批量应用资产快照 (模板: {config.id})</h5>
                          <p className="text-[12px] text-gray-400 mt-1 font-medium italic text-slate-500">
                            正在为关联的 <span className="font-bold text-indigo-600">{config.targetSNs.length}</span> 台设备配置硬件资产档案
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-12 h-[500px]">
                      {/* SN Input Area */}
                      <div className="flex-1 flex flex-col gap-6">
                        {/* Read-only: Suggested SNs */}
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between px-3">
                             <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                               <Database size={14} /> 自动识别的资产 SN (不可修改)
                             </label>
                             <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                               已锁定: {config.suggestedSNs.length} 台
                             </span>
                           </div>
                           <div className="w-full h-32 p-4 bg-gray-50/50 border border-gray-200 rounded-[1.5rem] overflow-y-auto flex flex-wrap gap-2 content-start custom-scrollbar opacity-70 cursor-not-allowed">
                              {config.suggestedSNs.map(sn => (
                                <span key={sn} className="px-2 py-1 bg-white border border-gray-200 text-[10px] font-mono text-gray-400 rounded-lg shadow-sm">
                                  {sn}
                                </span>
                              ))}
                              {config.suggestedSNs.length === 0 && <span className="text-[10px] italic text-gray-400 p-2">未识别到自动关联的 SN</span>}
                           </div>
                        </div>

                        {/* Editable: Manual SNs */}
                        <div className="flex flex-col flex-1 gap-2">
                          <div className="flex items-center justify-between px-3">
                            <label className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                              <PlusCircle size={14} /> 补充更多目标 SN (手动输入/追加)
                            </label>
                            <button 
                              onClick={() => { setCurrentActiveConfigId(config.id); snFileInputRef.current?.click(); }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                            >
                              <FileUp size={14} /> 追加 SN 文件
                            </button>
                          </div>
                          <textarea 
                            value={config.additionalSNs.join('\n')}
                            onChange={(e) => {
                              const input = e.target.value.split(/[\s,;]+/).filter(Boolean);
                              updateConfig(config.id, { additionalSNs: input });
                            }}
                            placeholder="请直接在此处输入或粘贴额外的 SN 序列号..."
                            className="w-full flex-1 p-6 text-sm font-mono border border-gray-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none resize-none transition-all shadow-inner bg-slate-50/20"
                          />
                        </div>
                      </div>
                      
                      {/* Preview Panel */}
                      <div className="w-[400px] bg-indigo-50/30 rounded-[3rem] p-8 border border-indigo-100 shadow-inner flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                           <h6 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">任务执行队列预览</h6>
                           <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-lg">
                             总计 {config.targetSNs.length}
                           </div>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-4 custom-scrollbar">
                          {config.targetSNs.map((sn, snIdx) => (
                            <div key={sn} className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in duration-300">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-indigo-300 font-bold">#{snIdx + 1}</span>
                                <span className="text-[12px] font-mono font-bold text-slate-700">{sn}</span>
                              </div>
                              {config.suggestedSNs.includes(sn) ? (
                                <Database size={12} className="text-indigo-300" title="自动识别" />
                              ) : (
                                <PlusCircle size={12} className="text-emerald-500" title="手动追加" />
                              )}
                            </div>
                          ))}
                          {config.targetSNs.length === 0 && <div className="text-center py-24 text-xs text-slate-300 italic">等待输入目标资产 SN</div>}
                        </div>
                        <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200" />
                           <span className="text-[10px] font-bold text-indigo-400">准备就绪: 即将应用配置模板</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <input type="file" id="sn-file-input" ref={snFileInputRef} className="hidden" onChange={(e) => currentActiveConfigId && handleSNFileUpload(e, currentActiveConfigId)} />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-12 py-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-gray-400">
            <AlertTriangle size={24} className="text-amber-500" />
            <span className="text-[11px] font-bold leading-relaxed uppercase tracking-tight max-w-md">
              提交后，系统将依据 <span className="text-slate-800 font-black">Spec-Model-Qty</span> 三元组强制覆盖目标资产。
              同步操作将全量归档至 <span className="text-indigo-600 font-bold underline decoration-indigo-100">“PXE 改配日志”</span>。
            </span>
          </div>
          <div className="flex gap-5">
            <button onClick={onClose} className="px-12 py-4 text-xs font-bold text-gray-500 hover:bg-slate-200 rounded-2xl transition-all">取消导入</button>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-12 py-4 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-2xl hover:bg-indigo-50 transition-all">
                返回修改
              </button>
            )}
            {step < 3 ? (
              <button 
                onClick={() => {
                  if (step === 1 && !selectedManufacturer) {
                    alert('请先选择服务器厂商');
                    return;
                  }
                  setStep(step + 1);
                }} 
                disabled={step === 1 && (!hasUploaded || !selectedManufacturer)}
                className={`flex items-center gap-3 px-16 py-4 text-xs font-bold text-white rounded-2xl shadow-2xl transition-all ${step === 1 && (!hasUploaded || !selectedManufacturer) ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-100'}`}
              >
                下一步: 规格核对 <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={() => { onApply(selectedConfigs); onClose(); }} 
                className="flex items-center gap-3 px-20 py-4 text-xs font-bold text-white bg-green-600 rounded-2xl shadow-2xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
              >
                <Save size={20} /> 立即同步 {selectedConfigs.reduce((sum, c) => sum + c.targetSNs.length, 0)} 台资产
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
