import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface LineChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  title?: string;
  dataKey?: string;
  stroke?: string;
  height?: number;
  width?: number | `${number}%`;
}

export const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  title = 'Chart',
  dataKey = 'value',
  stroke = '#3b82f6',
  height = 300,
  width = '100%',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            dot={{ fill: stroke, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
