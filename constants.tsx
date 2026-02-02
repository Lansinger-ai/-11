
import React from 'react';
import { 
  Search, Upload, Download
} from 'lucide-react';
import { ActionType, ServerAsset } from './types';

export const TOOLBAR_ACTIONS = [
  { type: ActionType.QUERY, icon: <Search size={14} />, color: 'text-blue-600' },
  { type: ActionType.IMPORT, icon: <Upload size={14} />, color: 'text-blue-500' },
  { type: ActionType.EXPORT, icon: <Download size={14} />, color: 'text-blue-500' },
];

export const MOCK_DATA: ServerAsset[] = Array.from({ length: 50 }, (_, i) => ({
  id: `30960${i + 1}`,
  sn: `SN-${1000 + i}`,
  hostname: `SRV-NODE-${i.toString().padStart(3, '0')}`,
  status: i % 15 === 0 ? '维护中' : i % 10 === 9 ? '机器下架' : '正常运行',
  configSource: i % 3 === 0 ? '人工更新' : i % 3 === 1 ? 'PXE抓取' : '监控抓取',
  isGpuServer: i % 4 === 0 ? '是' : '否',
  
  gpu: i % 4 === 0 ? 'NVIDIA A100 80GB x4 | NVIDIA H100 80GB x4' : '-',
  gpuModel: i % 4 === 0 ? 'A100-PG150-S01 x4 | ERR: Model Mismatch' : '-',
  
  cpu: i % 5 === 0 ? 'Intel Xeon 8358 x1 | Intel Xeon 8350 x1' : 'Intel Xeon Platinum 8358 x2',
  cpuModel: i % 5 === 0 ? 'Intel-8358-Retail | ERR: Unknown Rev' : 'Intel-8358-Standard-V2; Intel-8358-Standard-V3',
  
  memory: '256GB (32GB x 8) | 256GB (32GB x 8)',
  memoryModel: i % 7 === 0 ? 'Samsung-DDR4-3200 x8 | Unknown-Vendor-ID' : 'Samsung-DDR4-3200 x8 | Hynix-DDR4-3200 x8',
  
  networkCard: '100G Dual Port x1 | 25G Dual Port x1',
  networkCardModel: 'Mellanox-CX6-VPI | Mellanox-CX4-LX',
  
  harddisk: '2TB SATA x2 | 4TB SATA x2',
  harddiskModel: 'ST2000-NM001 x2 | ST4000-NM002 x2',
  
  ssd: i % 3 === 0 ? '3.84TB NVMe x2 | 1.92TB NVMe x2' : '3.84TB NVMe x4',
  ssdModel: i % 3 === 0 ? 'Samsung-PM1733 x2 | ERR: Sector Bad' : 'Samsung-PM9A3-V2 x4',
  
  raid: 'RAID 1 | RAID 10',
  raidModel: '9460-16i-Primary | 9460-16i-Secondary',
}));
