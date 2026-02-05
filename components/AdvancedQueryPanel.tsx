
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, RotateCcw, ChevronDown, Check, ListFilter, LayoutGrid } from 'lucide-react';
import { FilterState } from '../types';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange, placeholder = "请选择" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(next);
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] cursor-pointer hover:border-blue-400 transition-colors min-h-[30px]"
      >
        <span className="truncate max-w-[150px]">
          {selected.length > 0 ? selected.join(', ') : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-[100] left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl max-h-48 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map(option => (
            <div 
              key={option}
              onClick={() => toggleOption(option)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-[11px] text-gray-700"
            >
              <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors ${selected.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                {selected.includes(option) && <Check size={10} className="text-white" />}
              </div>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface AdvancedQueryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: FilterState) => void;
  batches: string[];
}

export const AdvancedQueryPanel: React.FC<AdvancedQueryPanelProps> = ({ isOpen, onClose, onSearch, batches }) => {
  const initialFilters: FilterState = {
    sn: '',
    snBulk: '',
    hostname: '',
    statuses: [],
    isGpuServer: '全部',
    sources: [], // 新增
    arrivalBatches: [],
    arrivalBatchBulk: '',
    configTypes: [],
    configSources: []
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeTab, setActiveTab] = useState<'standard' | 'bulk'>('standard');

  if (!isOpen) return null;

  const handleReset = () => {
    setFilters(initialFilters);
    onSearch(initialFilters);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-4 duration-200 z-30">
      <div className="max-w-[1400px] mx-auto flex">
        {/* Sidebar Tabs */}
        <div className="w-40 border-r border-gray-100 bg-gray-50/50 flex flex-col p-2 gap-1">
          <button 
            onClick={() => setActiveTab('standard')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <LayoutGrid size={14} /> 标准查询
          </button>
          <button 
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'bulk' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ListFilter size={14} /> 批量搜索
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
              <Search size={14} className="text-blue-500" /> {activeTab === 'standard' ? '精准过滤条件' : '大批量数据匹配'}
            </h4>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400">
              <X size={16} />
            </button>
          </div>

          {activeTab === 'standard' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-5">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight">SN 搜索</label>
                <input 
                  type="text"
                  value={filters.sn}
                  onChange={e => setFilters({...filters, sn: e.target.value})}
                  placeholder="输入 SN 关键词..."
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] focus:ring-1 focus:ring-blue-400 outline-none hover:border-blue-300"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight">主机名搜索</label>
                <input 
                  type="text"
                  value={filters.hostname}
                  onChange={e => setFilters({...filters, hostname: e.target.value})}
                  placeholder="输入主机名关键词..."
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] focus:ring-1 focus:ring-blue-400 outline-none hover:border-blue-300"
                />
              </div>

              <MultiSelect 
                label="状态"
                options={['正常运行', '机器下架', '维护中', '已到货']}
                selected={filters.statuses}
                onChange={val => setFilters({...filters, statuses: val})}
              />

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight">是否 GPU</label>
                <select 
                  value={filters.isGpuServer}
                  onChange={e => setFilters({...filters, isGpuServer: e.target.value})}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-[11px] focus:ring-1 focus:ring-blue-400 outline-none hover:border-blue-300 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                >
                  <option value="全部">全部</option>
                  <option value="是">是</option>
                  <option value="否">否</option>
                </select>
              </div>

              {/* 新增：来源多选 */}
              <MultiSelect 
                label="来源"
                options={['使用权资产', '算力验收', '短租', '正常采购', '其他']}
                selected={filters.sources}
                onChange={val => setFilters({...filters, sources: val})}
              />

              <MultiSelect 
                label="到货批次 (下拉)"
                options={batches}
                selected={filters.arrivalBatches}
                onChange={val => setFilters({...filters, arrivalBatches: val})}
                placeholder="搜索/选择批次..."
              />

              <MultiSelect 
                label="配置种类"
                options={['到货配置', '改配配置']}
                selected={filters.configTypes}
                onChange={val => setFilters({...filters, configTypes: val})}
              />

              <MultiSelect 
                label="配置来源"
                options={['人工更新', 'PXE抓取', '监控抓取', '改配']}
                selected={filters.configSources}
                onChange={val => setFilters({...filters, configSources: val})}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight">批量 SN 匹配</label>
                  <span className="text-[10px] text-gray-400">支持换行、逗号、空格分隔</span>
                </div>
                <textarea 
                  value={filters.snBulk}
                  onChange={e => setFilters({...filters, snBulk: e.target.value})}
                  placeholder="请粘贴多个 SN 号..."
                  className="w-full h-32 px-3 py-2 bg-slate-50 border border-gray-200 rounded text-[11px] font-mono focus:ring-1 focus:ring-blue-400 outline-none hover:border-blue-300 resize-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight">批量到货批次匹配</label>
                  <span className="text-[10px] text-gray-400">支持换行、逗号、空格分隔</span>
                </div>
                <textarea 
                  value={filters.arrivalBatchBulk}
                  onChange={e => setFilters({...filters, arrivalBatchBulk: e.target.value})}
                  placeholder="请粘贴多个到货批次号..."
                  className="w-full h-32 px-3 py-2 bg-slate-50 border border-gray-200 rounded text-[11px] font-mono focus:ring-1 focus:ring-blue-400 outline-none hover:border-blue-300 resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-50">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-100 rounded transition-colors"
            >
              <RotateCcw size={14} /> 重置所有条件
            </button>
            <button 
              onClick={() => onSearch(filters)}
              className="flex items-center gap-1.5 px-8 py-2 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Search size={14} /> 执行过滤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
