import { DeviceDetail } from '../types';

interface DeviceTableProps {
  devices: DeviceDetail[];
  loading: boolean;
}

const DeviceTable = ({ devices, loading }: DeviceTableProps) => {
  const getStatusBadge = (status: DeviceDetail['status']) => {
    const statusColors = {
      active: '#F59E0B', // Orange for active jobs
      finished: '#10B981' // Green for finished jobs
    };

    const textColors = {
      active: '#FFFFFF', // White text for better contrast on orange
      finished: '#FFFFFF' // White text for better contrast on green
    };

    return (
      <span 
        className={`status-badge ${status}`}
        style={{ 
          backgroundColor: statusColors[status] || '#6B7280',
          color: textColors[status] || '#FFFFFF',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.875rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="device-table">
        <div className="loading">Loading device details...</div>
      </div>
    );
  }

  return (
    <div className="device-table">
      <h2 className="title">Sended Jobs</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Ip</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className="table-row">
                <td className="device-name">{device.name}</td>
                <td className="device-ip">{device.ip}</td>
                <td className="device-status">
                  {getStatusBadge(device.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceTable;
