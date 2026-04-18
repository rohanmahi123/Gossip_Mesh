import { ConnectedDevice } from '../types';
import { FaLaptop, FaTimes } from 'react-icons/fa';
import PieChart from './PieChart';
import { useState, useEffect } from 'react';
import { fetchAllSystemDevices, filterDeviceByHostname } from '../services/api';

interface DeviceModalProps {
  device: ConnectedDevice | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DeviceMetrics {
  cpu: number;
  ram: number;
  disk: number;
  temperature: number;
  gpuUnavailable?: boolean;
}

const DeviceModal = ({ device, isOpen, onClose }: DeviceModalProps) => {
  const [metrics, setMetrics] = useState<DeviceMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && device) {
      fetchDeviceMetrics(true); // Initial fetch with loading
      
      // Set up periodic refresh for device metrics when modal is open (every 5 seconds)
      const metricsInterval = setInterval(() => {
        fetchDeviceMetrics(false); // Periodic fetches without loading
      }, 5000);

      return () => {
        clearInterval(metricsInterval);
      };
    }
  }, [isOpen, device]);

  const fetchDeviceMetrics = async (showLoading = false) => {
    if (!device?.name) return;
    
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // Fetch all devices data from allsystem endpoint
      const allSystemData = await fetchAllSystemDevices();
      
      // Filter by hostname to get specific device data
      const deviceData = filterDeviceByHostname(allSystemData, device.name);
      
      if (deviceData) {
        const isGpuUnavailable = deviceData.gpu === "GPU unavailable";
        
        setMetrics({
          cpu: Math.round(deviceData.cpu),
          ram: Math.round(deviceData.ram),
          disk: Math.round(deviceData.cpu * 0.7), // Approximation since disk not available in API
          temperature: deviceData.temp,
          gpuUnavailable: isGpuUnavailable
        });
      } else {
        // Device not found in allsystem response - show as unavailable
        setMetrics({
          cpu: 0,
          ram: 0,
          disk: 0,
          temperature: 0,
          gpuUnavailable: true
        });
      }
      
      if (showLoading) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching device metrics from allsystem:', error);
      // Fallback to unavailable state on error
      setMetrics({
        cpu: 0,
        ram: 0,
        disk: 0,
        temperature: 0,
        gpuUnavailable: true
      });
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  if (!isOpen || !device) return null;

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


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="device-info">
            <FaLaptop 
              className="device-modal-icon" 
              style={{ color: getStatusColor(device.status) }} 
            />
            <div>
              <h2 className="device-modal-title">{device.name}</h2>
              <span 
                className="device-modal-status"
                style={{ color: getStatusColor(device.status) }}
              >
                {device.status.toUpperCase()}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">Loading device metrics...</div>
          ) : metrics ? (
            <>
              <div className="device-metrics-grid">
                <div className="device-metric-card">
                  <div className="metric-chart">
                    <PieChart 
                      using={metrics.cpu} 
                      available={100 - metrics.cpu}
                    />
                  </div>
                  <div className="metric-info">
                    <div className="metric-label" style={{ color: '#ffffff' }}>CPU Usage</div>
                  </div>
                </div>

                <div className="device-metric-card">
                  <div className="metric-chart">
                    <PieChart 
                      using={metrics.disk} 
                      available={100 - metrics.disk}
                    />
                  </div>
                  <div className="metric-info">
                    <div className="metric-label" style={{ color: '#ffffff' }}>RAM Usage</div>
                  </div>
                </div>

                <div 
                  className="device-metric-card"
                  style={{
                    opacity: metrics.gpuUnavailable ? 0.3 : 1,
                    backgroundColor: metrics.gpuUnavailable ? '#E5E7EB' : undefined,
                    color: metrics.gpuUnavailable ? '#6B7280' : undefined,
                    filter: metrics.gpuUnavailable ? 'grayscale(100%)' : undefined
                  }}
                >
                  <div className="metric-chart">
                    <PieChart 
                      using={metrics.ram} 
                      available={100 - metrics.ram}
                      unavailable={metrics.gpuUnavailable}
                    />
                  </div>
                  <div className="metric-info">
                    <div className="metric-label" style={{ color: metrics.gpuUnavailable ? '#6B7280' : '#ffffff' }}>GPU Usage</div>
                  </div>
                </div>


              </div>

              <div className="device-additional-info" style={{ 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%',
                background: 'transparent',
                marginTop: '20px'
              }}>
                <div className="info-item" style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <span className="info-label" style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#475569',
                    letterSpacing: '0.025em'
                  }}>
                    Temperature: <span style={{
                      color: '#0F172A',
                      fontWeight: '700'
                    }}>{metrics.temperature} °C</span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="modal-error">Failed to load device metrics</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceModal;
