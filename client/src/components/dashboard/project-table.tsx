import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Search,
  Recycle,
  Users,
  Building2
} from 'lucide-react';
import { cn, getPercentageColor, getStatusColor, getCategoryColor } from '@/lib/utils';
import { Project } from '@shared/schema';

interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
  totalProjects?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
  onStatusFilter?: (status: string) => void;
  onProjectClick?: (project: Project) => void;
}

export function ProjectTable({
  projects,
  isLoading = false,
  totalProjects = 12,
  currentPage = 1,
  onPageChange,
  onSearch,
  onCategoryFilter,
  onStatusFilter,
  onProjectClick
}: ProjectTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  const pageSize = 4; // Items per page
  const totalPages = Math.ceil(totalProjects / pageSize);
  
  // Mock projects data when real data is not available
  const mockProjects: Project[] = [
    {
      id: 1,
      name: 'Waste Reduction Initiative',
      description: 'A project to reduce industrial waste',
      location: 'Jakarta, Indonesia',
      category: 'Environmental',
      status: 'on track',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      completion: 75,
      impactScore: 83,
      lastUpdated: new Date('2023-09-13'),
      organizationId: 1,
      createdById: 1
    },
    {
      id: 2,
      name: 'Community Education Program',
      description: 'Education program for underserved communities',
      location: 'Surabaya, Indonesia',
      category: 'Social',
      status: 'at risk',
      startDate: new Date('2023-02-15'),
      endDate: new Date('2023-11-30'),
      completion: 45,
      impactScore: 68,
      lastUpdated: new Date('2023-09-08'),
      organizationId: 1,
      createdById: 1
    },
    {
      id: 3,
      name: 'Board Diversity Initiative',
      description: 'Improving diversity in company leadership',
      location: 'Jakarta, Indonesia',
      category: 'Governance',
      status: 'delayed',
      startDate: new Date('2023-03-01'),
      endDate: new Date('2023-10-31'),
      completion: 20,
      impactScore: 42,
      lastUpdated: new Date('2023-08-25'),
      organizationId: 1,
      createdById: 1
    },
    {
      id: 4,
      name: 'Reforestation Project',
      description: 'Replanting efforts in deforested areas',
      location: 'Sumatra, Indonesia',
      category: 'Environmental',
      status: 'on track',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      completion: 90,
      impactScore: 91,
      lastUpdated: new Date('2023-09-14'),
      organizationId: 1,
      createdById: 1
    }
  ];
  
  const displayProjects = projects.length > 0 ? projects : mockProjects;
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };
  
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    if (onCategoryFilter) onCategoryFilter(value);
  };
  
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    if (onStatusFilter) onStatusFilter(value);
  };
  
  const handleProjectClick = (project: Project) => {
    if (onProjectClick) onProjectClick(project);
  };
  
  const handlePageChange = (page: number) => {
    if (onPageChange) onPageChange(page);
  };
  
  // Helper function to get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'environmental':
        return <Recycle className="h-5 w-5" />;
      case 'social':
        return <Users className="h-5 w-5" />;
      case 'governance':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };
  
  return (
    <Card className="shadow overflow-hidden">
      <CardHeader className="px-6 py-5 flex justify-between items-center flex-col sm:flex-row space-y-4 sm:space-y-0">
        <CardTitle>Active Projects</CardTitle>
        <div className="flex space-x-3 flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              <SelectItem value="Environmental">Environmental</SelectItem>
              <SelectItem value="Social">Social</SelectItem>
              <SelectItem value="Governance">Governance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="On Track">On Track</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Impact Score</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayProjects.map((project) => {
                  const statusStyle = getStatusColor(project.status);
                  const categoryStyle = getCategoryColor(project.category);
                  
                  return (
                    <TableRow 
                      key={project.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleProjectClick(project)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <div className={cn("flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center", categoryStyle.icon)}>
                            {getCategoryIcon(project.category)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {project.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", categoryStyle.bg, categoryStyle.text)}>
                          {project.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", statusStyle.bg, statusStyle.text)}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={cn("h-2.5 rounded-full", getPercentageColor(project.completion))} style={{ width: `${project.completion}%` }}></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{project.completion}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {project.impactScore}/100
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(project.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalProjects)}</span> of{' '}
                <span className="font-medium">{totalProjects}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                      currentPage === i + 1 
                        ? "bg-primary-50 border-primary-500 text-primary-600" 
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    )}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                {totalPages > 3 && (
                  <>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
