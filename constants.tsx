
import React from 'react';
import { 
  Search, Upload, Download
} from 'lucide-react';
import { ActionType, ServerAsset, LogEntry, AssetSource } from './types';

export const TOOLBAR_ACTIONS = [
  { type: ActionType.QUERY, icon: <Search size={14} />, color: 'text-blue-600' },
  { type: ActionType.IMPORT_CONFIG, icon: <Upload size={14} />, color: 'text-blue-500' },
  { type: ActionType.EXPORT, icon: <Download size={14} />, color: 'text-blue-500' },
];

export const MOCK_DATA: ServerAsset[] = Array.from({ length: 50 }, (_, i) => {
  const sources: ServerAsset['configSource'][] = ['人工更新', 'PXE抓取', '监控抓取', '改配'];
  const statuses: ServerAsset['status'][] = ['正常运行', '机器下架', '维护中', '已到货'];
  const assetSources: AssetSource[] = ['使用权资产', '算力验收', '短租', '正常采购'];
  const configType: ServerAsset['configType'] = i % 5 === 0 ? '改配配置' : '到货配置';
  const batches = ['2024Q1-A01', '2024Q2-B05', '2023Q4-C12', '2024-SPOT-01'];
  
  const isArrival = configType === '到货配置';
  const hasError = isArrival && (i % 3 === 0);

  return {
    id: `30960${i + 1}`,
    sn: `SN-${1000 + i}`,
    hostname: `SRV-NODE-${i.toString().padStart(3, '0')}`,
    status: statuses[i % 4],
    arrivalBatch: batches[i % 4],
    configSource: sources[i % 4],
    configType,
    updatedAt: `2024-05-${(i % 28 + 1).toString().padStart(2, '0')} 14:30:${(i % 60).toString().padStart(2, '0')}`,
    isGpuServer: i % 4 === 0 ? '是' : '否',
    source: assetSources[i % 4], // 新增：来源
    
    gpu: i % 4 === 0 ? 'NVIDIA A100 80GB x4 | NVIDIA H100 80GB x4' : '-',
    gpuModel: (i % 4 === 0 && hasError) ? 'A100-PG150-S01 x4 | ERR: Model Mismatch' : (i % 4 === 0 ? 'A100-PG150-S01 x4 | H100-PG520-S01 x4' : '-'),
    
    cpu: i % 5 === 0 ? 'Intel Xeon 8358 x1 | Intel Xeon 8350 x1' : 'Intel Xeon Platinum 8358 x2',
    cpuModel: (i % 5 === 0 && hasError) ? 'Intel-8358-Retail | ERR: Unknown Rev' : 'Intel-8358-Standard-V2; Intel-8358-Standard-V3',
    
    memory: '256GB (32GB x 8) | 256GB (32GB x 8)',
    memoryModel: (i % 7 === 0 && hasError) ? 'Samsung-DDR4-3200 x8 | Unknown-Vendor-ID' : 'Samsung-DDR4-3200 x8 | Hynix-DDR4-3200 x8',
    
    networkCard: '100G Dual Port x1 | 25G Dual Port x1',
    networkCardModel: 'Mellanox-CX6-VPI | Mellanox-CX4-LX',
    
    harddisk: '2TB SATA x2 | 4TB SATA x2',
    harddiskModel: 'ST2000-NM001 x2 | ST4000-NM002 x2',
    
    ssd: i % 3 === 0 ? '3.84TB NVMe x2 | 1.92TB NVMe x2' : '3.84TB NVMe x4',
    ssdModel: (i % 3 === 0 && hasError) ? 'Samsung-PM1733 x2 | ERR: Sector Bad' : 'Samsung-PM9A3-V2 x4',
    
    raid: 'RAID 1 | RAID 10',
    raidModel: '9460-16i-Primary | 9460-16i-Secondary',

    fpga: '-',
    fpgaModel: '-',
    attachments: i % 7 === 0 ? ['pxe_capture_log.txt', 'hardware_inventory.csv'] : (i % 3 === 0 ? ['import_spec.json'] : []),
  };
});

export const MOCK_LOGS: LogEntry[] = [
  {
    id: 'L-001',
    sn: 'SN-1000',
    operator: '兰义丰',
    action: '手动更新配置',
    details: [
      { field: 'CPU Model', before: 'Intel-8358-Standard-V2', after: 'Intel-8480C-QS' },
      { field: 'SSD Model', before: '-', after: 'Samsung-PM1733' }
    ],
    timestamp: '2024-05-20 10:15:30'
  },
  {
    id: 'L-002',
    sn: 'SN-1000',
    operator: '系统PXE',
    action: '自动抓取配置',
    details: [
      { field: 'Status', before: '已到货', after: '正常运行' }
    ],
    timestamp: '2024-05-19 14:20:00'
  }
];
