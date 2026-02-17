import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CoverageChartProps {
  covered: number;
  missing: number;
  excess: number;
}

export const CoverageChart: React.FC<CoverageChartProps> = ({ covered, missing, excess }) => {
  const data = [
    { name: 'Covered', value: covered, color: '#10b981' },
    { name: 'Missing', value: missing, color: '#ef4444' },
    { name: 'Excess', value: excess, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className="no-data">No permissions to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
