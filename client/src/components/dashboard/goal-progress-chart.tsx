import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';

interface Goal {
  name: string;
  progress: number;
  target: string;
  color?: string;
}

interface GoalProgressChartProps {
  goals?: Goal[];
}

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  // Default goals if none provided
  const defaultGoals: Goal[] = [
    { name: 'Carbon Reduction', progress: 75, target: '500 metric tons', color: '#16803C' },
    { name: 'Community Engagement', progress: 50, target: '5,000 participants', color: '#3B82F6' },
    { name: 'Sustainable Sourcing', progress: 65, target: '90% compliance', color: '#F59E0B' },
    { name: 'Diversity Goals', progress: 10, target: '40% improvement', color: '#EF4444' }
  ];
  
  const displayGoals = goals || defaultGoals;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Progress Towards Goals</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {displayGoals.map((goal, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-24 w-24 mb-2">
                <ProgressRing 
                  value={goal.progress} 
                  color={goal.color}
                />
              </div>
              <h4 className="text-sm font-medium text-gray-900">{goal.name}</h4>
              <p className="text-xs text-gray-500">Target: {goal.target}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <a href="#" className="text-sm font-medium text-primary-500 hover:text-primary-600">
          Set New Goals
        </a>
      </CardFooter>
    </Card>
  );
}
