import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ESGScoreCard } from '@/components/dashboard/esg-score-card';
import { ImpactCategoryChart } from '@/components/dashboard/impact-category-chart';
import { GoalProgressChart } from '@/components/dashboard/goal-progress-chart';
import { ProjectTable } from '@/components/dashboard/project-table';
import { SDGTracker } from '@/components/dashboard/sdg-tracker';
import { Button } from '@/components/ui/button';
import { Download, PlusCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, EsgScore } from '@shared/schema';

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedOrganization, setSelectedOrganization] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch ESG scores
  const { 
    data: esgScores,
    isLoading: isLoadingEsgScores,
    error: esgScoresError 
  } = useQuery<EsgScore>({
    queryKey: ['/api/esg-scores/1', { latest: true }],
    enabled: false, // We're using mock data for now
  });
  
  // Fetch projects
  const { 
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects', { organizationId: selectedOrganization !== 'all' ? parseInt(selectedOrganization) : undefined }],
    enabled: false, // We're using mock data for now
  });
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle adding a new project
  const handleAddProject = () => {
    toast({
      title: "Feature in development",
      description: "Project creation will be available soon.",
    });
  };
  
  // Handle exporting data
  const handleExportData = () => {
    toast({
      title: "Exporting data",
      description: "Your export is being prepared and will be downloaded shortly.",
    });
  };
  
  // Handle project click
  const handleProjectClick = (project: Project) => {
    toast({
      title: "Project selected",
      description: `You selected "${project.name}"`,
    });
  };
  
  // Handle SDG mapping
  const handleAddSdgMapping = () => {
    toast({
      title: "SDG Mapping",
      description: "SDG mapping feature will be available soon.",
    });
  };
  
  // Handle generating SDG report
  const handleGenerateSdgReport = () => {
    toast({
      title: "Generating report",
      description: "Your SDG report is being generated.",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Impact Dashboard
          </h1>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <RefreshCw className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>Last updated: {formatDate(new Date())}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3 flex-wrap gap-2">
          <Select 
            defaultValue="all" 
            value={selectedOrganization}
            onValueChange={setSelectedOrganization}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="environmental">Environmental Projects</SelectItem>
              <SelectItem value="social">Social Projects</SelectItem>
              <SelectItem value="governance">Governance Projects</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button onClick={handleAddProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>
      
      {/* ESG Score Summary */}
      <ESGScoreCard esgScores={esgScores as EsgScore} />
      
      {/* Project Impact Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact by Category Chart */}
        <ImpactCategoryChart />
        
        {/* Progress Towards Goals */}
        <GoalProgressChart />
      </div>
      
      {/* Project Status Overview */}
      <ProjectTable 
        projects={projects || []} 
        isLoading={isLoadingProjects}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onProjectClick={handleProjectClick}
      />
      
      {/* SDG Alignment Section */}
      <SDGTracker 
        onAddMapping={handleAddSdgMapping}
        onGenerateReport={handleGenerateSdgReport}
      />
    </div>
  );
}
