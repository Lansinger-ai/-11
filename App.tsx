
import React from 'react';
import { Toolbar } from './components/Toolbar';
import { ServerTable } from './components/ServerTable';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Toolbar />
      <main className="flex-1 flex flex-col relative">
        <ServerTable />
        
        {/* Footer / Pagination Placeholder */}
        <footer className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-[11px] text-gray-500 z-10 shadow-inner">
          <div className="flex items-center gap-4">
            <span>共 {MOCK_DATA_COUNT} 条记录</span>
            <span>已选 0 条</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50">上一页</button>
            <span className="font-bold text-blue-600">1</span>
            <button className="px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-50">下一页</button>
          </div>
        </footer>
      </main>

      {/* Fixed bottom-right helper button */}
      <div className="fixed bottom-12 right-6 flex flex-col gap-2 z-50">
        <button className="w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-105 active:scale-95">
          <span className="text-[10px] text-center font-bold">问题<br/>反馈</span>
        </button>
      </div>
    </div>
  );
};

const MOCK_DATA_COUNT = 50;

export default App;
