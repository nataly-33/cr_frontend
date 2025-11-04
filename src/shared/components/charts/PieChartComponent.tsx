import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export interface PieChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  title?: string;
  dataKey?: string;
  colors?: string[];
  height?: number;
  width?: number | string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const SimplePieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Chart',
  dataKey = 'value',
  colors = DEFAULT_COLORS,
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
      <ResponsiveContainer width={width as any} height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} documentos`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
