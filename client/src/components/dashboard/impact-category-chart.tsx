import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  percentage: number;
  color: string;
}

interface ImpactCategoryChartProps {
  data?: CategoryData[];
  period?: string;
  onPeriodChange?: (direction: 'prev' | 'next') => void;
}

export function ImpactCategoryChart({ 
  data,
  period = 'Q3 2023',
  onPeriodChange
}: ImpactCategoryChartProps) {
  const [currentPeriod, setCurrentPeriod] = useState(period);
  
  // Default data if none provided
  const defaultData: CategoryData[] = [
    { name: 'Social', percentage: 60, color: 'var(--chart-1, #3B82F6)' },
    { name: 'Environmental', percentage: 80, color: 'var(--chart-2, #16803C)' },
    { name: 'Governance', percentage: 40, color: 'var(--chart-3, #F59E0B)' }
  ];
  
  const chartData = data || defaultData;
  
  const handlePeriodChange = (direction: 'prev' | 'next') => {
    if (onPeriodChange) {
      onPeriodChange(direction);
      return;
    }
    
    // Fallback to simple period change if no handler provided
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const years = ['2022', '2023', '2024'];
    
    const [quarter, year] = currentPeriod.split(' ');
    let qIndex = quarters.indexOf(quarter);
    let yIndex = years.indexOf(year);
    
    if (direction === 'prev') {
      qIndex--;
      if (qIndex < 0) {
        qIndex = quarters.length - 1;
        yIndex--;
      }
    } else {
      qIndex++;
      if (qIndex >= quarters.length) {
        qIndex = 0;
        yIndex++;
      }
    }
    
    // Constrain within available years
    yIndex = Math.max(0, Math.min(yIndex, years.length - 1));
    
    setCurrentPeriod(`${quarters[qIndex]} ${years[yIndex]}`);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Impact by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Value']}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="percentage" 
                radius={[4, 4, 0, 0]}
                fill="#8884d8"
                isAnimationActive={true}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <rect 
                    key={`rect-${index}`} 
                    fill={entry.color} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm w-full">
          <span className="font-medium text-gray-500">Period: {currentPeriod}</span>
          <div className="flex space-x-2 text-primary-500">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-primary-500 hover:text-primary-600"
              onClick={() => handlePeriodChange('prev')}
              title="Previous Period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-primary-500 hover:text-primary-600"
              onClick={() => handlePeriodChange('next')}
              title="Next Period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
