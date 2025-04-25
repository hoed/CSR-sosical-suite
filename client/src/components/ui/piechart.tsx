import React from 'react';
import { cn } from '@/lib/utils';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export function PieChart({
  data,
  width = 100,
  height = 100,
  innerRadius = 0,
  outerRadius = 40,
  className
}: PieChartProps) {
  // Calculate total value
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  // Calculate each segment's angle
  let startAngle = 0;
  const segments = data.map(item => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const segment = {
      ...item,
      startAngle,
      endAngle: startAngle + angle,
      percentage
    };
    startAngle += angle;
    return segment;
  });

  // Convert angle to radians
  const angleToRadians = (angle: number) => (angle * Math.PI) / 180;

  // Calculate path for each segment
  const createPath = (segment: typeof segments[0]) => {
    const startRad = angleToRadians(segment.startAngle);
    const endRad = angleToRadians(segment.endAngle);
    
    const x1 = outerRadius * Math.sin(startRad);
    const y1 = -outerRadius * Math.cos(startRad);
    
    const x2 = outerRadius * Math.sin(endRad);
    const y2 = -outerRadius * Math.cos(endRad);
    
    // For complete circle, we need special handling
    const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? 0 : 1;
    
    // Create path
    let path = `M ${x1} ${y1}`;
    path += ` A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    
    if (innerRadius > 0) {
      const x3 = innerRadius * Math.sin(endRad);
      const y3 = -innerRadius * Math.cos(endRad);
      
      const x4 = innerRadius * Math.sin(startRad);
      const y4 = -innerRadius * Math.cos(startRad);
      
      path += ` L ${x3} ${y3}`;
      path += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`;
      path += ' Z';
    } else {
      path += ' L 0 0 Z';
    }
    
    return path;
  };

  return (
    <svg width={width} height={height} viewBox={`-50 -50 100 100`} className={cn('', className)}>
      {segments.map((segment, index) => (
        <path
          key={index}
          d={createPath(segment)}
          fill={segment.color}
          stroke="white"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
