
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
};

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
            
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <span className={cn(
                  "flex items-center",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
