import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export function ProgressRing({
  value,
  size = 100,
  strokeWidth = 8,
  color = 'var(--primary)',
  backgroundColor = '#E5E7EB',
  className,
  showValue = true,
  label
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn('progress-ring', className)}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Progress circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${center} ${center})`}
        strokeLinecap="round"
      />
      
      {/* Text in the center */}
      {showValue && (
        <text 
          x={center} 
          y={center}
          textAnchor="middle" 
          dominantBaseline="middle"
          fontSize={size / 5}
          fontWeight="600"
          fill="currentColor"
        >
          {value}%
        </text>
      )}
      
      {/* Optional label */}
      {label && (
        <text 
          x={center} 
          y={center + (size / 7)}
          textAnchor="middle" 
          dominantBaseline="middle"
          fontSize={size / 10}
          fill="currentColor"
        >
          {label}
        </text>
      )}
    </svg>
  );
}
