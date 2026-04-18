import * as React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  using: number;
  available: number;
  unavailable?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ using, available, unavailable = false }) => {
  const getSolidUsageColor = (percentage: number) => {
    if (percentage < 40) return '#10B981'; // Green
    if (percentage <= 70) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const solidUsageColor = unavailable ? '#9CA3AF' : getSolidUsageColor(using);

  const data = {
    labels: ['Using', 'Available'],
    datasets: [
      {
        label: 'Resources',
        data: unavailable ? [100, 0] : [using, available],
        backgroundColor: [
          solidUsageColor, // Dynamic solid color for chart.js compatibility or grey if unavailable
          '#F3F4F6', // Lighter gray for available portion
        ],
        borderColor: [
          'transparent',
          'transparent',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Creates the donut hole
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#2d3748',
        bodyColor: '#2d3748',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  return (
    <div style={{ height: '180px', width: '180px', position: 'relative' }}>
      <Doughnut data={data} options={options} />
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: solidUsageColor,
          fontWeight: 'bold',
          fontSize: '24px'
        }}
      >
        {unavailable ? '--' : `${using}%`}
      </div>
    </div>
  );
};

export default PieChart;
