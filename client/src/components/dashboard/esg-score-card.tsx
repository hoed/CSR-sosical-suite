import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { EsgScore } from '@shared/schema';
import { Sprout, Users, Scale } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}

interface ESGScoreCardProps {
  esgScores: EsgScore;
}

function ScoreCard({ title, score, trend = 0, icon, color }: ScoreCardProps) {
  const trendIcon = trend >= 0 ? '↑' : '↓';
  const trendColor = trend >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{score}/100</div>
                {trend !== 0 && (
                  <div className={`ml-2 flex items-center text-sm font-semibold ${trendColor}`}>
                    {trendIcon}
                    <span>{Math.abs(trend)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-3">
        <div className="text-sm">
          <a href="#" className="font-medium text-primary-500 hover:text-primary-600">
            View details<span className="sr-only"> for {title.toLowerCase()} metrics</span>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ESGScoreCard({ esgScores }: ESGScoreCardProps) {
  // Default values
  const defaultScores = {
    environmentalScore: 74,
    socialScore: 81,
    governanceScore: 68,
    environmentalTrend: 12,
    socialTrend: 8,
    governanceTrend: 3
  };
  
  // Use actual values if available, otherwise use defaults
  const environmentalScore = esgScores?.environmentalScore ?? defaultScores.environmentalScore;
  const socialScore = esgScores?.socialScore ?? defaultScores.socialScore;
  const governanceScore = esgScores?.governanceScore ?? defaultScores.governanceScore;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <ScoreCard
        title="Environmental Score"
        score={environmentalScore}
        trend={defaultScores.environmentalTrend}
        icon={<Sprout className="h-5 w-5 text-green-600" />}
        color="bg-green-100"
      />
      <ScoreCard
        title="Social Score"
        score={socialScore}
        trend={defaultScores.socialTrend}
        icon={<Users className="h-5 w-5 text-blue-600" />}
        color="bg-blue-100"
      />
      <ScoreCard
        title="Governance Score"
        score={governanceScore}
        trend={defaultScores.governanceTrend}
        icon={<Scale className="h-5 w-5 text-yellow-600" />}
        color="bg-yellow-100"
      />
    </div>
  );
}
