
import React, { useState } from 'react';
import { MOCK_DATA } from '../constants';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { key: 'id', label: 'ID', width: 'w-20' },
  { key: 'sn', label: 'SN', width: 'w-28' },
  { key: 'hostname', label: '主机名', width: 'w-32' },
  { key: 'status', label: '状态', width: 'w-20' },
  { key: 'configSource', label: '配置来源', width: 'w-24' },
  { key: 'isGpuServer', label: 'GPU服务器', width: 'w-24' },
  { key: 'cpu', modelKey: 'cpuModel', label: 'CPU (规格 / Model)', width: 'w-64' },
  { key: 'gpu', modelKey: 'gpuModel', label: 'GPU (规格 / Model)', width: 'w-64' },
  { key: 'memory', modelKey: 'memoryModel', label: '内存 (规格 / Model)', width: 'w-64' },
  { key: 'networkCard', modelKey: 'networkCardModel', label: '网卡 (规格 / Model)', width: 'w-56' },
  { key: 'harddisk', modelKey: 'harddiskModel', label: '硬盘 (规格 / Model)', width: 'w-56' },
  { key: 'ssd', modelKey: 'ssdModel', label: 'SSD (规格 / Model)', width: 'w-56' },
  { key: 'raid', modelKey: 'raidModel', label: 'RAID (规格 / Model)', width: 'w-48' },
];

const isAbnormal = (model: string): boolean => {
  const lower = model.toLowerCase();
  return lower.includes('err:') || lower.includes('unknown') || lower.includes('mismatch') || lower.includes('bad');
};

const ComponentDetail: React.FC<{ spec: string; models: string }> = ({ spec, models }) => {
  if (!spec || spec === '-') return <span className="text-gray-300">-</span>;
  
  const specGroups = spec.split('|').map(s => s.trim());
  const modelGroups = models.split('|').map(m => m.trim());

  return (
    <div className="flex flex-col py-1 gap-2.5 max-w-full">
      {specGroups.map((currentSpec, idx) => {
        const currentModelStr = modelGroups[idx] || '';
        const modelList = currentModelStr.split(';').map(m => m.trim()).filter(Boolean);

        return (
          <div key={idx} className="flex flex-col gap-1 group/spec">
            <div 
              className="font-bold text-gray-800 text-[11px] leading-tight border-b border-gray-100 pb-0.5 group-hover/spec:text-blue-700 transition-colors"
              title={currentSpec}
            >
              {currentSpec}
            </div>
            <div className="flex flex-col gap-0.5 pl-1.5 border-l-2 border-blue-100">
              {modelList.length > 0 ? (
                modelList.map((m, mIdx) => {
                  const abnormal = isAbnormal(m);
                  return (
                    <div 
                      key={mIdx} 
                      className={`flex items-center gap-1 text-[10px] leading-relaxed font-mono truncate px-1 rounded-sm transition-colors ${
                        abnormal 
                          ? 'text-red-600 bg-red-50 border border-red-100 animate-pulse font-semibold' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      title={abnormal ? `检测到异常数据: ${m}` : m}
                    >
                      {abnormal && <AlertTriangle size={10} className="shrink-0" />}
                      <span className="truncate">{m}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-[10px] text-gray-300 italic">No Model Data</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ServerTable: React.FC = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedRows.size === MOCK_DATA.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(MOCK_DATA.map(d => d.id)));
    }
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  return (
    <div className="flex-1 overflow-auto bg-white table-container relative">
      <table className="w-full border-collapse table-fixed text-[11px] leading-tight min-w-[1800px]">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase tracking-wider font-semibold border-b border-gray-200 shadow-sm">
            <th className="w-10 px-2 py-3 border-r border-gray-200 sticky top-0 bg-gray-100 z-30 text-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                checked={selectedRows.size === MOCK_DATA.length && MOCK_DATA.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
            {COLUMNS.map((col) => (
              <th 
                key={col.key} 
                className={`${col.width} px-3 py-3 border-r border-gray-200 text-left sticky top-0 bg-gray-100 z-20 hover:bg-gray-200 cursor-pointer group whitespace-nowrap`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{col.label}</span>
                  <div className="flex flex-col opacity-20 group-hover:opacity-100 transition-opacity">
                    <ChevronUp size={8} className="mb-[-2px]" />
                    <ChevronDown size={8} />
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {MOCK_DATA.map((row) => (
            <tr 
              key={row.id} 
              className={`hover:bg-blue-50/40 transition-colors ${selectedRows.has(row.id) ? 'bg-blue-50' : ''}`}
            >
              <td className="px-2 py-2 border-r border-gray-200 text-center align-top pt-4">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  checked={selectedRows.has(row.id)}
                  onChange={() => toggleRow(row.id)}
                />
              </td>
              {COLUMNS.map((col) => {
                const isConfigCol = !!(col as any).modelKey;
                const value = row[col.key as keyof typeof row];
                const modelValue = isConfigCol ? row[(col as any).modelKey as keyof typeof row] : null;

                return (
                  <td 
                    key={col.key} 
                    className="px-3 py-3 border-r border-gray-200 align-top"
                  >
                    {isConfigCol ? (
                      <ComponentDetail spec={String(value)} models={String(modelValue)} />
                    ) : col.key === 'status' ? (
                      <div className="pt-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded-sm font-medium ${
                          row.status === '正常运行' ? 'bg-green-100 text-green-700' : 
                          row.status === '维护中' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    ) : col.key === 'configSource' ? (
                      <div className="pt-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded-sm font-medium ${
                          row.configSource === '人工更新' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                          row.configSource === 'PXE抓取' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 
                          'bg-teal-50 text-teal-600 border border-teal-100'
                        }`}>
                          {row.configSource}
                        </span>
                      </div>
                    ) : col.key === 'isGpuServer' ? (
                      <div className="pt-1 text-center font-bold">
                        <span className={row.isGpuServer === '是' ? 'text-blue-600' : 'text-gray-300'}>
                          {row.isGpuServer}
                        </span>
                      </div>
                    ) : (
                      <div className="pt-1 font-mono text-gray-800 break-all">{String(value)}</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] select-none flex flex-wrap justify-around items-around z-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="transform -rotate-45 text-2xl font-bold p-20">兰义丰 5449</div>
        ))}
      </div>
    </div>
  );
};
