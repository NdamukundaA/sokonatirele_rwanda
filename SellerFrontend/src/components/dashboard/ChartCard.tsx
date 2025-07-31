
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { cn } from '@/lib/utils';

export type ChartData = {
  name: string;
  [key: string]: string | number;
}[];

type ChartCardProps = {
  title: string;
  subtitle?: string;
  data: ChartData;
  type: 'area' | 'bar' | 'line' | 'pie';
  dataKey: string | string[];
  colors?: string[];
  className?: string;
  height?: number;
  showLegend?: boolean;
};

const defaultColors = [
  '#0EA5E9', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F97316', // orange
  '#EF4444', // red
];

const ChartCard = ({ 
  title, 
  subtitle, 
  data, 
  type, 
  dataKey, 
  colors = defaultColors,
  className,
  height = 300,
  showLegend = true
}: ChartCardProps) => {
  const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey];

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  fill={colors[index % colors.length]} 
                  stroke={colors[index % colors.length]}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const total = data.reduce((sum, entry) => sum + Number(entry[dataKeys[0]]), 0);
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <Tooltip formatter={(value, name) => [`${value} (${((Number(value) / total) * 100).toFixed(1)}%)`, name]} />
              {showLegend && <Legend />}
              <Pie
                data={data}
                nameKey="name"
                dataKey={dataKeys[0]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <p>Invalid chart type</p>;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </CardHeader>
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
