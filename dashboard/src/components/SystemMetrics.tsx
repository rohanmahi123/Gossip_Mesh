import { SystemMetrics as SystemMetricsType } from '../types';
import PieChart from './PieChart';

interface SystemMetricsProps {
  metrics: SystemMetricsType | null;
  loading: boolean;
  hasDevices: boolean;
}

const SystemMetrics = ({ metrics, loading, hasDevices }: SystemMetricsProps) => {
  if (loading) {
    return (
      <div className="system-metrics">
        <div className="loading">Loading metrics...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="system-metrics">
        <div className="error">Failed to load metrics</div>
      </div>
    );
  }

  // If no devices are connected, show all metrics as unavailable
  if (!hasDevices) {
    const metricItems = [
      { label: 'CPU Usage', value: 0, unavailable: true },
      { label: 'RAM Usage', value: 0, unavailable: true },
      { label: 'GPU Usage', value: 0, unavailable: true }
    ];
    
    return (
      <div>
        <h2 className="title">System Metrics</h2>
        <div className="system-metrics">
          {metricItems.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="metric-label" style={{ color: '#ffffff' }}>{metric.label}</div>
              <div className="pie-chart-container">
                <PieChart 
                  using={0} 
                  available={0}
                  unavailable={true}
                />
              </div>
              <div 
                className="metric-value"
                style={{ color: '#9CA3AF' }}
              >
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isGpuUnavailable = metrics.gpu === "GPU unavailable";
  
  const metricItems = [
    { label: 'CPU Usage', value: metrics.cpu_avg, unavailable: false },
    { label: 'RAM Usage', value: metrics.ram_usage_percent, unavailable: false },
    { label: 'GPU Usage', value: isGpuUnavailable ? 0 : parseFloat(metrics.gpu) || 0, unavailable: isGpuUnavailable }
  ];


  return (
    <div>
      <h2 className="title">System Metrics</h2>
      <div className="system-metrics">
        {metricItems.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-label" style={{ color: '#ffffff' }}>{metric.label}</div>
            <div className="pie-chart-container">
              <PieChart 
                using={metric.unavailable ? 0 : metric.value} 
                available={metric.unavailable ? 0 : 100 - metric.value}
                unavailable={metric.unavailable}
              />
            </div>
            <div 
              className="metric-value"
              style={{ color: metric.unavailable ? '#9CA3AF' : '#ffffff' }}
            >
              {metric.unavailable ? '--' : `${Math.round(metric.value)}%`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemMetrics;
