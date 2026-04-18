import { ConnectedDevice, SystemMetrics, DeviceDetail, DeviceInfo } from '../types';

// Using real API endpoints now


const generateSystemMetrics = (): SystemMetrics => ({
  cpu_avg: Math.floor(Math.random() * 100),
  gpu: "GPU unavailable",
  ram_usage_percent: Math.floor(Math.random() * 100),
});

const setRealSystemMetrics = (data: any): SystemMetrics => ({
  cpu_avg: data.cpu_avg,
  gpu: data.gpu,
  ram_usage_percent: data.ram_usage_percent,
});

const generateDeviceDetails = (): DeviceDetail[] => [
  { name: 'Router Principal', ip: '192.168.1.1', status: 'active' },
  { name: 'Switch Core', ip: '192.168.1.10', status: 'active' },
  { name: 'Access Point 1', ip: '192.168.1.20', status: 'active' },
  { name: 'Access Point 2', ip: '192.168.1.21', status: 'finished' },
  { name: 'Firewall', ip: '192.168.1.5', status: 'active' },
  { name: 'Print Server', ip: '192.168.1.100', status: 'finished' },
  { name: 'NAS Storage', ip: '192.168.1.200', status: 'active' },
  { name: 'Backup Server', ip: '192.168.1.201', status: 'active' },
  { name: 'VPN Gateway', ip: '192.168.1.50', status: 'active' },
  { name: 'Load Balancer', ip: '192.168.1.15', status: 'active' },
  { name: 'DNS Server', ip: '192.168.1.53', status: 'active' },
  { name: 'DHCP Server', ip: '192.168.1.2', status: 'active' },
  { name: 'Security Camera Hub', ip: '192.168.1.150', status: 'finished' },
  { name: 'IoT Gateway', ip: '192.168.1.75', status: 'finished' },
  { name: 'Web Server', ip: '192.168.1.80', status: 'active' },
  { name: 'Database Server', ip: '192.168.1.90', status: 'active' },
  { name: 'Mail Server', ip: '192.168.1.25', status: 'finished' },
  { name: 'Monitoring Server', ip: '192.168.1.110', status: 'active' },
  { name: 'File Server', ip: '192.168.1.220', status: 'active' },
  { name: 'Proxy Server', ip: '192.168.1.8', status: 'finished' },
];

// All Systems API interface
export interface AllSystemsResponse {
  msg: {
    [ip: string]: {
      message: {
        cpu: number;
        gpu: string;
        hostname: string;
        ip: string | null;
        ram: number;
        temp: number;
      };
    };
  };
}

// Transform API response to ConnectedDevice format
const transformAllSystemsToDevices = (data: AllSystemsResponse): ConnectedDevice[] => {
  return Object.entries(data.msg).map(([ip, deviceData], index) => {
    const { message } = deviceData;
    
    // Determine status based on metrics
    let status: ConnectedDevice['status'] = 'online';
    if (message.cpu > 80 || message.ram > 80) {
      status = 'warning';
    }
    
    return {
      id: (index + 1).toString(),
      name: message.hostname,
      status,
      ip,
      metrics: {
        cpu: message.cpu,
        ram: message.ram,
        gpu: message.gpu,
        temp: message.temp
      }
    };
  });
};

// API functions
export const fetchConnectedDevices = async (): Promise<ConnectedDevice[]> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/allsystem');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.status} ${response.statusText}`);
    }
    
    const data: AllSystemsResponse = await response.json();
    return transformAllSystemsToDevices(data);
  } catch (error) {
    console.error('Error fetching devices from API:', error);
    // Return empty array if API fails
    return [];
  }
};

export const fetchSystemMetrics = async (): Promise<SystemMetrics> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/systemstats');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch system metrics: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("DAAAAAAAAA CPU: ", data.cpu_avg)
    console.log("DAAAAAAAAA RAM: ", data.ram_usage_percent)
    setRealSystemMetrics(data)
    return data;
  } catch (error) {
    console.error('Error fetching system metrics from API:', error);
    // Return fallback data if API fails
    return generateSystemMetrics();
  }
};

export const fetchDeviceDetails = async (): Promise<DeviceDetail[]> => {
  // Return empty array since we're using real API data now
  return generateDeviceDetails();
};

// Fetch all devices data from allsystem endpoint for device modal
export const fetchAllSystemDevices = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/allsystem');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch allsystem data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching allsystem data:', error);
    throw error;
  }
};

// Filter device data by hostname from allsystem response
export const filterDeviceByHostname = (allSystemData: any, hostname: string) => {
  if (!allSystemData?.msg) return null;
  
  for (const [ip, deviceInfo] of Object.entries(allSystemData.msg)) {
    const deviceData = deviceInfo as any;
    if (deviceData.message?.hostname === hostname) {
      return {
        ip,
        ...deviceData.message
      };
    }
  }
  
  return null;
};

// Fetch specific device data by hostname from allsystem endpoint
export const fetchDeviceByHostname = async (hostname: string): Promise<any> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/allsystem');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch device data: ${response.status} ${response.statusText}`);
    }
    
    const data: AllSystemsResponse = await response.json();
    
    // Find device by hostname
    for (const [deviceIp, deviceData] of Object.entries(data.msg)) {
      if (deviceData.message.hostname === hostname) {
        return {
          deviceIp,
          ...deviceData.message
        };
      }
    }
    
    throw new Error(`Device with hostname ${hostname} not found`);
  } catch (error) {
    console.error('Error fetching device by hostname:', error);
    throw error;
  }
};

// Tandem AI Chat Completions API
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// My Stats API interface
export interface MyStatsResponse {
  cpu: {
    percent: number;
    times: {
      user: number;
      system: number;
      idle: number;
      iowait: number;
    };
  };
  memory: {
    total_gb: number;
    used_gb: number;
    percent: number;
  };
  gpu: string;
  motherboard_temperature: number;
}

export const fetchMyStats = async (): Promise<MyStatsResponse> => {
  const response = await fetch('http://127.0.0.1:8000/mystats');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch my stats: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

export const fetchDeviceInfo = async (): Promise<DeviceInfo> => {
  const response = await fetch('http://127.0.0.1:8000/device-name');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch device info: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

export const fetchChatCompletion = async (
  messages: ChatMessage[],
  model: string = 'casperhansen/deepseek-r1-distill-llama-70b-awq'
): Promise<ChatCompletionResponse> => {
  const apiKey = import.meta.env.VITE_TANDEM_API_KEY;
  
  if (!apiKey) {
    throw new Error('VITE_TANDEM_API_KEY environment variable is not set');
  }

  const response = await fetch('/api/tandem/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
