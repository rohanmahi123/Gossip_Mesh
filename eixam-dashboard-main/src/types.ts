export interface ConnectedDevice {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  ip?: string;
  metrics?: {
    cpu: number;
    ram: number;
    gpu: string;
    temp: number;
  };
}

export interface SystemMetrics {
  cpu_avg: number;
  gpu: string;
  ram_usage_percent: number;
}

export interface DeviceDetail {
  name: string;
  ip: string;
  status: 'active' | 'finished';
}

export interface DeviceInfo {
  device_name: string;
  hostname: string;
}
