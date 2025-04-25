import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { SdgGoal, ProjectSdgMapping } from '@shared/schema';

interface SDGTrackerProps {
  sdgGoals?: SdgGoal[];
  projectSdgMappings?: ProjectSdgMapping[];
  selectedProject?: { id: number; name: string; category: string };
  onAddMapping?: () => void;
  onGenerateReport?: () => void;
}

export function SDGTracker({
  sdgGoals,
  projectSdgMappings,
  selectedProject,
  onAddMapping,
  onGenerateReport
}: SDGTrackerProps) {
  // Default SDG goals if none provided (actual data would come from API)
  const defaultSdgGoals: SdgGoal[] = [
    { id: 1, number: 1, name: 'No Poverty', color: '#E5243B', description: 'End poverty in all its forms everywhere' },
    { id: 2, number: 2, name: 'Zero Hunger', color: '#DDA63A', description: 'End hunger, achieve food security' },
    { id: 3, number: 3, name: 'Good Health and Well-being', color: '#4C9F38', description: 'Ensure healthy lives and promote well-being' },
    { id: 4, number: 4, name: 'Quality Education', color: '#C5192D', description: 'Ensure inclusive and equitable quality education' },
    { id: 5, number: 5, name: 'Gender Equality', color: '#FF3A21', description: 'Achieve gender equality and empower all women and girls' },
    { id: 6, number: 6, name: 'Clean Water and Sanitation', color: '#26BDE2', description: 'Ensure availability of water and sanitation' },
    { id: 7, number: 7, name: 'Affordable and Clean Energy', color: '#FCC30B', description: 'Ensure access to affordable and clean energy' },
    { id: 8, number: 8, name: 'Decent Work and Economic Growth', color: '#A21942', description: 'Promote sustained economic growth' },
    { id: 9, number: 9, name: 'Industry, Innovation and Infrastructure', color: '#FD6925', description: 'Build resilient infrastructure' },
    { id: 10, number: 10, name: 'Reduced Inequalities', color: '#DD1367', description: 'Reduce inequality within and among countries' }
  ];
  
  const displaySdgGoals = sdgGoals || defaultSdgGoals;
  
  // Example project SDG contribution
  const defaultProject = {
    id: 4,
    name: 'Reforestation Project',
    category: 'Environmental',
    sdgContributions: [
      { sdgId: 3, sdgNumber: 3, sdgName: 'Good Health and Well-being', impactLevel: 'Strong' },
      { sdgId: 6, sdgNumber: 6, sdgName: 'Clean Water and Sanitation', impactLevel: 'Medium' },
      { sdgId: 15, sdgNumber: 15, sdgName: 'Life on Land', impactLevel: 'Strong' }
    ]
  };
  
  const activeProject = selectedProject || defaultProject;
  
  // Active SDGs (those with dot indicator)
  const activeSdgs = [1, 3, 4];
  
  return (
    <Card className="shadow overflow-hidden">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>SDG Alignment</CardTitle>
        <p className="mt-1 text-sm text-gray-500">
          Monitoring impact towards Sustainable Development Goals
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {displaySdgGoals.map((goal) => (
            <div key={goal.id} className="flex flex-col items-center">
              <div className="relative mb-2">
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: goal.color }}
                >
                  <span className="text-white text-xs font-bold">{goal.number}</span>
                </div>
                {activeSdgs.includes(goal.number) && (
                  <div 
                    className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-white" 
                    title="Active"
                  ></div>
                )}
              </div>
              <span className="text-xs text-center">{goal.name.split(' ')[0]} {goal.name.split(' ')[1] || ''}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <h4 className="text-base font-medium text-gray-900 mb-3">Project SDG Contributions</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center mb-3">
              <h5 className="font-medium text-gray-900">
                <Leaf className="inline-block text-green-600 mr-2 h-5 w-5" />
                {activeProject.name}
              </h5>
              <span className="ml-auto px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                {activeProject.sdgContributions.length} SDGs aligned
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {activeProject.sdgContributions.map((contribution, index) => (
                <div key={index} className="flex items-center p-2 bg-white rounded border border-gray-200">
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center mr-2"
                    style={{ 
                      backgroundColor: displaySdgGoals.find(g => g.number === contribution.sdgNumber)?.color || '#333' 
                    }}
                  >
                    <span className="text-white text-xs font-bold">{contribution.sdgNumber}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium">SDG {contribution.sdgNumber}: {contribution.sdgName}</div>
                    <div className="text-xs text-gray-500">{contribution.impactLevel} impact</div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="link" 
              className="text-sm font-medium text-primary-500 hover:text-primary-600 p-0"
            >
              View detailed SDG mapping
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <Button 
          variant="link" 
          className="text-sm font-medium text-primary-500 hover:text-primary-600 p-0"
          onClick={onAddMapping}
        >
          <span className="flex items-center">+ Add SDG Mapping</span>
        </Button>
        <Button 
          size="sm"
          onClick={onGenerateReport}
        >
          Generate SDG Report
        </Button>
      </CardFooter>
    </Card>
  );
}
