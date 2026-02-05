
import React, { useState, useMemo } from 'react';
import { Toolbar } from './components/Toolbar';
import { ServerTable } from './components/ServerTable';
import { ImportModal } from './components/ImportModal';
import { LogModal } from './components/LogModal';
import { SingleUpdateModal } from './components/SingleUpdateModal';
import { AdvancedQueryPanel } from './components/AdvancedQueryPanel';
import { MOCK_DATA, MOCK_LOGS } from './constants';
import { ActionType, ServerAsset, LogEntry, FilterState } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<ServerAsset[]>(MOCK_DATA);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isQueryPanelOpen, setIsQueryPanelOpen] = useState(false);
  
  const [activeServer, setActiveServer] = useState<ServerAsset | null>(null);
  const [lastUpdatedSNs, setLastUpdatedSNs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState | null>(null);

  // 获取所有唯一的到货批次
  const availableBatches = useMemo(() => {
    const batches = new Set<string>();
    MOCK_DATA.forEach(item => batches.add(item.arrivalBatch));
    return Array.from(batches).sort();
  }, []);

  // 辅助函数：解析批量输入字符串
  const parseBulkInput = (input: string) => {
    if (!input) return [];
    return input.split(/[\s,;\n]+/).filter(Boolean).map(s => s.trim());
  };

  // 过滤后的数据
  const filteredData = useMemo(() => {
    if (!filters) return data;

    const snBulkList = parseBulkInput(filters.snBulk);
    const batchBulkList = parseBulkInput(filters.arrivalBatchBulk);

    return data.filter(item => {
      // 标准搜索
      if (filters.sn && !item.sn.toLowerCase().includes(filters.sn.toLowerCase())) return false;
      if (filters.hostname && !item.hostname.toLowerCase().includes(filters.hostname.toLowerCase())) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) return false;
      if (filters.isGpuServer !== '全部' && item.isGpuServer !== filters.isGpuServer) return false;
      if (filters.sources.length > 0 && !filters.sources.includes(item.source)) return false; // 新增：来源过滤
      if (filters.arrivalBatches.length > 0 && !filters.arrivalBatches.includes(item.arrivalBatch)) return false;
      if (filters.configTypes.length > 0 && !filters.configTypes.includes(item.configType)) return false;
      if (filters.configSources.length > 0 && !filters.configSources.includes(item.configSource)) return false;
      
      // 批量搜索逻辑
      if (snBulkList.length > 0 && !snBulkList.some(sn => item.sn.toLowerCase().includes(sn.toLowerCase()))) return false;
      if (batchBulkList.length > 0 && !batchBulkList.some(batch => item.arrivalBatch.toLowerCase().includes(batch.toLowerCase()))) return false;
      
      return true;
    });
  }, [data, filters]);

  const handleToolbarAction = (type: ActionType) => {
    if (type === ActionType.IMPORT_CONFIG) {
      setIsImportOpen(true);
    } else if (type === ActionType.QUERY) {
      setIsQueryPanelOpen(!isQueryPanelOpen);
    }
  };

  const handleShowLog = (server: ServerAsset) => {
    setActiveServer(server);
    setIsLogOpen(true);
  };

  const handleUpdateConfig = (server: ServerAsset) => {
    setActiveServer(server);
    setIsUpdateOpen(true);
  };

  const handleAdvancedSearch = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSaveSingleConfig = (sn: string, updates: Partial<ServerAsset>) => {
    const now = new Date().toLocaleString();
    const serverIndex = data.findIndex(s => s.sn === sn);
    if (serverIndex === -1) return;

    const oldServer = data[serverIndex];
    const newData = [...data];
    
    // 记录变更
    const changeDetails: LogEntry['details'] = [];
    Object.keys(updates).forEach(key => {
      const k = key as keyof ServerAsset;
      if (updates[k] !== oldServer[k]) {
        changeDetails.push({
          field: String(k),
          before: String(oldServer[k] || ''),
          after: String(updates[k] || '')
        });
      }
    });

    if (changeDetails.length > 0) {
      const newLog: LogEntry = {
        id: `L-${Date.now()}`,
        sn: sn,
        operator: '兰义丰',
        action: '手动更新配置',
        details: changeDetails,
        timestamp: now
      };
      setLogs([newLog, ...logs]);
    }

    newData[serverIndex] = {
      ...oldServer,
      ...updates,
      configSource: '人工更新',
      configType: '改配配置',
      updatedAt: now
    };

    setData(newData);
    setLastUpdatedSNs(new Set([sn]));
    setTimeout(() => setLastUpdatedSNs(new Set()), 4000);
  };

  const handleApplyConfig = (configs: any[]) => {
    const now = new Date().toLocaleString();
    const updatedSNs = new Set<string>();
    
    const snMap = new Map<string, any>();
    configs.forEach(cfg => {
      cfg.targetSNs.forEach((sn: string) => {
        snMap.set(sn.trim(), cfg);
        updatedSNs.add(sn.trim());
      });
    });

    const newData = data.map(item => {
      const cfg = snMap.get(item.sn);
      if (cfg) {
        return {
          ...item,
          ...cfg.specs,
          ...cfg.models,
          configSource: '改配' as const,
          configType: '改配配置' as const,
          updatedAt: now
        };
      }
      return item;
    });

    setData(newData);
    setLastUpdatedSNs(updatedSNs);
    setTimeout(() => setLastUpdatedSNs(new Set()), 4000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Toolbar onAction={handleToolbarAction} />
      
      <AdvancedQueryPanel 
        isOpen={isQueryPanelOpen} 
        onClose={() => setIsQueryPanelOpen(false)}
        onSearch={handleAdvancedSearch}
        batches={availableBatches}
      />

      <main className="flex-1 flex flex-col relative">
        <ServerTable 
          data={filteredData} 
          highlightedSNs={lastUpdatedSNs} 
          onShowLog={handleShowLog}
          onUpdateConfig={handleUpdateConfig}
        />
        
        {/* Footer */}
        <footer className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-[11px] text-gray-500 z-10 shadow-inner">
          <div className="flex items-center gap-4">
            <span>共 {filteredData.length} 条记录 / 总计 {data.length} 条</span>
            <span>已选 0 条</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50">上一页</button>
            <span className="font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">1</span>
            <button className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50">下一页</button>
          </div>
        </footer>
      </main>

      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onApply={handleApplyConfig}
      />

      <LogModal 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        sn={activeServer?.sn || ''}
        logs={logs.filter(l => l.sn === activeServer?.sn)}
      />

      <SingleUpdateModal 
        isOpen={isUpdateOpen} 
        onClose={() => setIsUpdateOpen(false)} 
        server={activeServer}
        onSave={handleSaveSingleConfig}
      />

      <div className="fixed bottom-12 right-6 flex flex-col gap-2 z-50">
        <button className="w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 border-2 border-white">
          <span className="text-[10px] text-center font-bold leading-tight">问题<br/>反馈</span>
        </button>
      </div>
    </div>
  );
};

export default App;
