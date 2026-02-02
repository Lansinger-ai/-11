
export interface ServerAsset {
  id: string;
  sn: string;
  hostname: string;
  status: '正常运行' | '机器下架' | '维护中';
  configSource: '人工更新' | 'PXE抓取' | '监控抓取';
  isGpuServer: '是' | '否';
  // 规格描述
  gpu: string;
  cpu: string;
  memory: string;
  networkCard: string;
  harddisk: string;
  ssd: string;
  raid: string;
  // 具体 Model 号
  gpuModel: string;
  cpuModel: string;
  memoryModel: string;
  networkCardModel: string;
  harddiskModel: string;
  ssdModel: string;
  raidModel: string;
}

export enum ActionType {
  QUERY = '高级查询',
  CONFIG = '设置显示字段',
  ADD = '添加',
  IMPORT = '导入',
  UPDATE = '更新',
  SELECT_ALL = '全选',
  EXPORT = '导出',
  REFRESH = '刷新',
  BATCH_QUERY = '批量查询',
  BATCH_ARRIVAL = '批量到货',
  BATCH_SN = '变更资产编号',
  INIT = '初始化机件信息',
  VNC = '设备是否在建',
  ALLOCATE = '发起分配',
  UPDATE_ACCESSORY = '更新服务器配件Model'
}
