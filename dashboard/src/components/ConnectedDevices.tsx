import { FaLaptop } from 'react-icons/fa';
import { ConnectedDevice, DeviceInfo } from '../types';

interface ConnectedDevicesProps {
  devices: ConnectedDevice[];
  loading: boolean;
  onDeviceClick: (device: ConnectedDevice) => void;
  onUserComputerClick?: () => void;
  deviceInfo?: DeviceInfo | null;
}

const ConnectedDevices = ({ devices, loading, onDeviceClick, onUserComputerClick, deviceInfo }: ConnectedDevicesProps) => {
  const getStatusColor = (status: ConnectedDevice['status']) => {
    switch (status) {
      case 'online':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'offline':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="connected-devices">
        <div className="loading">Loading devices...</div>
      </div>
    );
  }

  const isUserComputer = (device: ConnectedDevice) => {
    // Check if the device name matches the hostname from the device info API
    if (!deviceInfo?.hostname) return false;
    return device.name.toLowerCase().includes(deviceInfo.hostname.toLowerCase());
  };

  const handleDeviceClick = (device: ConnectedDevice, index: number) => {
    console.log('Device clicked:', device.name, 'Index:', index, 'Is user computer:', isUserComputer(device));
    console.log('onUserComputerClick function exists:', !!onUserComputerClick);
    
    if (isUserComputer(device) && onUserComputerClick) {
      console.log('Calling onUserComputerClick');
      onUserComputerClick();
    } else {
      console.log('Calling regular onDeviceClick');
      onDeviceClick(device);
    }
  };

  return (
    <div className="connected-devices">
      <h2 className="title">Devices</h2>
      <div className="devices-grid">
        {devices.map((device, index) => (
          <div 
            key={device.id} 
            className="device-card"
            onClick={() => handleDeviceClick(device, index)}
            style={{ 
              cursor: 'pointer',
              backgroundColor: isUserComputer(device) ? 'rgba(60, 60, 60, 0.8)' : undefined,
              border: isUserComputer(device) ? '1px solid rgba(255, 255, 255, 0.2)' : undefined
            }}
          >
            <FaLaptop 
              className="device-icon" 
              style={{ color: getStatusColor(device.status) }} 
            />
            <div className="device-name">
              <div>{device.name}</div>
              {isUserComputer(device) && (
                <div style={{ 
                  fontSize: '0.8em', 
                  color: '#3B82F6', 
                  fontWeight: 'bold',
                  marginTop: '4px'
                }}>
                  (Your Computer)
                </div>
              )}
            </div>
            <span 
              className={`device-status ${device.status}`}
            >
              {device.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectedDevices;
