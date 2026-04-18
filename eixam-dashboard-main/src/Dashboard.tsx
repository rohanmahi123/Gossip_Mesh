import { useState, useEffect } from 'react';
import ConnectedDevices from './components/ConnectedDevices';
import SystemMetrics from './components/SystemMetrics';
import DeviceTable from './components/DeviceTable';
import DeviceModal from './components/DeviceModal';
import ChatButton from './components/ChatButton';
import { ConnectedDevice, SystemMetrics as SystemMetricsType, DeviceDetail } from './types';
import { fetchConnectedDevices, fetchSystemMetrics, fetchDeviceDetails } from './services/api';
import { useDevice } from './contexts/DeviceContext';
import './Dashboard.css';

const Dashboard = () => {
  const { deviceInfo, loading: deviceInfoLoading, error: deviceInfoError } = useDevice();
  
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsType | null>(null);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetail[]>([]);
  
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Device modal state
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeviceClick = (device: ConnectedDevice) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleUserComputerClick = async () => {
    // Find the user's computer device from the connected devices list based on hostname
    const userDevice = connectedDevices.find(device => 
      deviceInfo?.hostname && device.name.toLowerCase().includes(deviceInfo.hostname.toLowerCase())
    );
    
    if (userDevice) {
      setSelectedDevice(userDevice);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load connected devices
        const devices = await fetchConnectedDevices();
        setConnectedDevices(devices);
        setLoadingDevices(false);
      } catch (error) {
        console.error('Error loading connected devices:', error);
        setLoadingDevices(false);
      }

      try {
        // Load system metrics
        const metrics = await fetchSystemMetrics();
        setSystemMetrics(metrics);
        setLoadingMetrics(false);
      } catch (error) {
        console.error('Error loading system metrics:', error);
        setLoadingMetrics(false);
      }

      try {
        // Load device details
        const details = await fetchDeviceDetails();
        setDeviceDetails(details);
        setLoadingDetails(false);
      } catch (error) {
        console.error('Error loading device details:', error);
        setLoadingDetails(false);
      }
    };

    loadData();

    // Set up periodic refresh for connected devices (every 5 seconds)
    const devicesInterval = setInterval(async () => {
      try {
        const devices = await fetchConnectedDevices();
        setConnectedDevices(devices);
      } catch (error) {
        console.error('Error refreshing connected devices:', error);
      }
    }, 5000);

    // Set up periodic refresh for system metrics (every 5 seconds)
    const metricsInterval = setInterval(async () => {
      try {
        const metrics = await fetchSystemMetrics();
        setSystemMetrics(metrics);
      } catch (error) {
        console.error('Error refreshing system metrics:', error);
      }
    }, 5000);

    return () => {
      clearInterval(devicesInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="title">
        {deviceInfoLoading ? (
          <h1>Loading device information...</h1>
        ) : deviceInfoError ? (
          <h1>Error loading device info: {deviceInfoError}</h1>
        ) : deviceInfo ? (
          <h1>Welcome back to eixam {deviceInfo.hostname}</h1>
        ) : (
          <h1>Device Dashboard</h1>
        )}
      </div>
      <div className="dashboard-grid">
        {/* Left Top - Connected Devices */}
        <div className="quadrant lt">
          <ConnectedDevices 
            devices={connectedDevices} 
            loading={loadingDevices}
            onDeviceClick={handleDeviceClick}
            onUserComputerClick={handleUserComputerClick}
            deviceInfo={deviceInfo}
          />
        </div>

        {/* Left Bottom - System Metrics */}
        <div className="quadrant lb">
          <SystemMetrics 
            metrics={systemMetrics} 
            loading={loadingMetrics}
            hasDevices={connectedDevices.length > 0}
          />
        </div>

        {/* Right Side - Device Table */}
        <div className="quadrant right">
          <DeviceTable 
            devices={deviceDetails} 
            loading={loadingDetails} 
          />
        </div>
      </div>

      {/* Device Modal - Rendered at main page level */}
      <DeviceModal 
        device={selectedDevice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Floating Chat Button */}
      <ChatButton />

    </div>
  );
};

export default Dashboard;
