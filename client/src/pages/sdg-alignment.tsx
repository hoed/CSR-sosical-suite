import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SdgGoal, ProjectSdgMapping, InsertProjectSdgMapping, Project } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Globe, 
  Leaf, 
  FileText, 
  Filter,
  ExternalLink,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { SDGTracker } from '@/components/dashboard/sdg-tracker';
import { PieChart } from '@/components/ui/piechart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Mock SDG goals
const mockSdgGoals: SdgGoal[] = [
  { id: 1, number: 1, name: 'No Poverty', description: 'End poverty in all its forms everywhere', color: '#E5243B' },
  { id: 2, number: 2, name: 'Zero Hunger', description: 'End hunger, achieve food security', color: '#DDA63A' },
  { id: 3, number: 3, name: 'Good Health and Well-being', description: 'Ensure healthy lives and promote well-being', color: '#4C9F38' },
  { id: 4, number: 4, name: 'Quality Education', description: 'Ensure inclusive and equitable quality education', color: '#C5192D' },
  { id: 5, number: 5, name: 'Gender Equality', description: 'Achieve gender equality and empower all women and girls', color: '#FF3A21' },
  { id: 6, number: 6, name: 'Clean Water and Sanitation', description: 'Ensure availability of water and sanitation', color: '#26BDE2' },
  { id: 7, number: 7, name: 'Affordable and Clean Energy', description: 'Ensure access to affordable and clean energy', color: '#FCC30B' },
  { id: 8, number: 8, name: 'Decent Work and Economic Growth', description: 'Promote sustained economic growth', color: '#A21942' },
  { id: 9, number: 9, name: 'Industry, Innovation and Infrastructure', description: 'Build resilient infrastructure', color: '#FD6925' },
  { id: 10, number: 10, name: 'Reduced Inequalities', description: 'Reduce inequality within and among countries', color: '#DD1367' },
  { id: 11, number: 11, name: 'Sustainable Cities and Communities', description: 'Make cities and human settlements inclusive, safe, resilient and sustainable', color: '#FD9D24' },
  { id: 12, number: 12, name: 'Responsible Consumption and Production', description: 'Ensure sustainable consumption and production patterns', color: '#BF8B2E' },
  { id: 13, number: 13, name: 'Climate Action', description: 'Take urgent action to combat climate change and its impacts', color: '#3F7E44' },
  { id: 14, number: 14, name: 'Life Below Water', description: 'Conserve and sustainably use the oceans, seas and marine resources', color: '#0A97D9' },
  { id: 15, number: 15, name: 'Life on Land', description: 'Protect, restore and promote sustainable use of terrestrial ecosystems', color: '#56C02B' },
  { id: 16, number: 16, name: 'Peace, Justice and Strong Institutions', description: 'Promote peaceful and inclusive societies for sustainable development', color: '#00689D' },
  { id: 17, number: 17, name: 'Partnerships for the Goals', description: 'Strengthen the means of implementation and revitalize the global partnership for sustainable development', color: '#19486A' }
];

// Mock project SDG mappings
const mockProjectSdgMappings: ProjectSdgMapping[] = [
  { id: 1, projectId: 1, sdgId: 6, impactLevel: 'strong', notes: 'Project significantly reduces water waste', createdById: 1 },
  { id: 2, projectId: 1, sdgId: 12, impactLevel: 'strong', notes: 'Directly promotes responsible consumption', createdById: 1 },
  { id: 3, projectId: 1, sdgId: 13, impactLevel: 'medium', notes: 'Indirectly reduces carbon footprint', createdById: 1 },
  { id: 4, projectId: 2, sdgId: 4, impactLevel: 'strong', notes: 'Direct impact on education quality', createdById: 1 },
  { id: 5, projectId: 2, sdgId: 5, impactLevel: 'medium', notes: 'Promotes gender equality in education access', createdById: 1 },
  { id: 6, projectId: 2, sdgId: 10, impactLevel: 'medium', notes: 'Reduces inequality in education access', createdById: 1 },
  { id: 7, projectId: 3, sdgId: 5, impactLevel: 'strong', notes: 'Directly addresses gender equality in leadership', createdById: 1 },
  { id: 8, projectId: 3, sdgId: 10, impactLevel: 'strong', notes: 'Reduces inequality in leadership positions', createdById: 1 },
  { id: 9, projectId: 3, sdgId: 16, impactLevel: 'medium', notes: 'Promotes inclusive institutions', createdById: 1 },
  { id: 10, projectId: 4, sdgId: 13, impactLevel: 'strong', notes: 'Direct climate action through reforestation', createdById: 1 },
  { id: 11, projectId: 4, sdgId: 15, impactLevel: 'strong', notes: 'Directly protects and restores terrestrial ecosystems', createdById: 1 },
  { id: 12, projectId: 4, sdgId: 6, impactLevel: 'medium', notes: 'Helps maintain water sources', createdById: 1 },
];

// Mock projects
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

// SDG mapping schema
const sdgMappingSchema = z.object({
  projectId: z.number({
    required_error: "Project is required",
  }),
  sdgId: z.number({
    required_error: "SDG goal is required",
  }),
  impactLevel: z.string({
    required_error: "Impact level is required",
  }),
  notes: z.string().optional(),
});

export default function SdgAlignment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Create SDG mapping form
  const form = useForm<z.infer<typeof sdgMappingSchema>>({
    resolver: zodResolver(sdgMappingSchema),
    defaultValues: {
      projectId: 1,
      sdgId: 1,
      impactLevel: "medium",
      notes: "",
    },
  });
  
  // Create SDG mapping mutation mock
  const createSdgMappingMutation = {
    mutate: (values: any) => {
      toast({
        title: "SDG mapping created",
        description: "Your SDG mapping has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    isPending: false
  };
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof sdgMappingSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create an SDG mapping.",
        variant: "destructive",
      });
      return;
    }
    
    createSdgMappingMutation.mutate(values);
  }
  
  // Handle SDG report generation
  const handleGenerateSdgReport = () => {
    toast({
      title: "Generating SDG report",
      description: "Your report is being generated and will be available shortly.",
    });
  };
  
  // Prepare data for charts
  const sdgCounts = mockSdgGoals.map(sdg => {
    const mappings = mockProjectSdgMappings.filter(mapping => mapping.sdgId === sdg.id);
    return {
      id: sdg.id,
      number: sdg.number,
      name: sdg.name,
      color: sdg.color,
      count: mappings.length,
      strongCount: mappings.filter(m => m.impactLevel === 'strong').length,
      mediumCount: mappings.filter(m => m.impactLevel === 'medium').length,
      weakCount: mappings.filter(m => m.impactLevel === 'weak').length,
    };
  }).sort((a, b) => b.count - a.count);
  
  // Data for category impact
  const categoryImpactData = [
    { name: 'Environmental', sdgCount: 6, projectCount: 2 },
    { name: 'Social', sdgCount: 5, projectCount: 1 },
    { name: 'Governance', sdgCount: 2, projectCount: 1 },
  ];
  
  // Data for pie chart
  const pieChartData = [
    { name: 'Strong Impact', value: mockProjectSdgMappings.filter(m => m.impactLevel === 'strong').length, color: '#16803C' },
    { name: 'Medium Impact', value: mockProjectSdgMappings.filter(m => m.impactLevel === 'medium').length, color: '#3B82F6' },
    { name: 'Weak Impact', value: mockProjectSdgMappings.filter(m => m.impactLevel === 'weak').length, color: '#F59E0B' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SDG Alignment</h1>
          <p className="text-gray-500 mt-1">Map your projects to UN Sustainable Development Goals</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add SDG Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add SDG Mapping</DialogTitle>
              <DialogDescription>
                Connect your project to a Sustainable Development Goal and define its impact.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockProjects.map(project => (
                            <SelectItem key={project.id} value={project.id.toString()}>{project.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sdgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SDG Goal</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select SDG goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockSdgGoals.map(sdg => (
                            <SelectItem key={sdg.id} value={sdg.id.toString()}>
                              {sdg.number}: {sdg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="impactLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="strong">Strong</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="weak">Weak</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain how this project contributes to the selected SDG" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createSdgMappingMutation.isPending}
                  >
                    Create Mapping
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">SDG Coverage</h2>
                <p className="text-sm text-gray-500">9 of 17 goals</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '53%' }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">53% of goals covered</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Projects Mapped</h2>
                <p className="text-sm text-gray-500">4 projects</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="mt-1 text-xs text-gray-500">100% of projects mapped</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Mappings</h2>
                <p className="text-sm text-gray-500">{mockProjectSdgMappings.length} connections</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-yellow-100">
                <Filter className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs">
                <span>Strong: {mockProjectSdgMappings.filter(m => m.impactLevel === 'strong').length}</span>
                <span>Medium: {mockProjectSdgMappings.filter(m => m.impactLevel === 'medium').length}</span>
                <span>Weak: {mockProjectSdgMappings.filter(m => m.impactLevel === 'weak').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Reports</h2>
                <p className="text-sm text-gray-500">2 available</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleGenerateSdgReport}
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">SDG Goals</TabsTrigger>
          <TabsTrigger value="projects">Project Alignment</TabsTrigger>
          <TabsTrigger value="reporting">SDG Reporting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Top SDG Contributions</CardTitle>
                <CardDescription>The SDGs with the most project contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sdgCounts.filter(sdg => sdg.count > 0).slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 'dataMax']} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fill: '#666' }} 
                        width={100}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="strongCount" 
                        stackId="a" 
                        name="Strong Impact" 
                        fill="#16803C" 
                      />
                      <Bar 
                        dataKey="mediumCount" 
                        stackId="a" 
                        name="Medium Impact" 
                        fill="#3B82F6" 
                      />
                      <Bar 
                        dataKey="weakCount" 
                        stackId="a" 
                        name="Weak Impact" 
                        fill="#F59E0B" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Impact by Category</CardTitle>
                <CardDescription>SDG alignment across project categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryImpactData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="sdgCount" 
                        name="SDG Goals" 
                        fill="#3B82F6" 
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="projectCount" 
                        name="Projects" 
                        fill="#16803C" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project SDG Mapping</CardTitle>
                <CardDescription>Select a project to view its SDG contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 mb-4">
                  {mockProjects.map(project => (
                    <Button 
                      key={project.id}
                      variant={selectedProject?.id === project.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      {project.name}
                    </Button>
                  ))}
                </div>
                
                <SDGTracker 
                  sdgGoals={mockSdgGoals}
                  selectedProject={selectedProject || mockProjects[3]}
                  onAddMapping={() => setIsCreateDialogOpen(true)}
                  onGenerateReport={handleGenerateSdgReport}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Impact Distribution</CardTitle>
                <CardDescription>Impact levels across all mappings</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 mb-4">
                  <PieChart data={pieChartData} />
                </div>
                <div className="space-y-2 w-full">
                  {pieChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Sustainable Development Goals</CardTitle>
              <CardDescription>The 17 United Nations Sustainable Development Goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockSdgGoals.map(sdg => {
                  const mappings = mockProjectSdgMappings.filter(m => m.sdgId === sdg.id);
                  
                  return (
                    <Card key={sdg.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div 
                            className="w-16 h-16 flex items-center justify-center rounded-md flex-shrink-0" 
                            style={{ backgroundColor: sdg.color }}
                          >
                            <span className="text-white text-xl font-bold">{sdg.number}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{sdg.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{sdg.description}</p>
                            
                            <div className="mt-2 flex flex-wrap gap-1">
                              {mappings.length > 0 ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {mappings.length} project{mappings.length !== 1 ? 's' : ''} aligned
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  No projects aligned
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-3 flex items-center">
                              <Button variant="link" size="sm" className="h-8 px-0">
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">Learn more</span>
                              </Button>
                              
                              {mappings.length > 0 && (
                                <Button variant="link" size="sm" className="h-8 px-0 ml-auto">
                                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                                  <span className="text-xs">View impact</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project SDG Alignments</CardTitle>
              <CardDescription>View how projects are aligned with SDG goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SDGs Aligned</TableHead>
                    <TableHead>Strong Impact</TableHead>
                    <TableHead>Medium Impact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProjects.map((project) => {
                    const projectMappings = mockProjectSdgMappings.filter(m => m.projectId === project.id);
                    const strongImpact = projectMappings.filter(m => m.impactLevel === 'strong').length;
                    const mediumImpact = projectMappings.filter(m => m.impactLevel === 'medium').length;
                    
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.location}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                            project.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {projectMappings.map(mapping => {
                              const sdg = mockSdgGoals.find(g => g.id === mapping.sdgId);
                              
                              return (
                                <div 
                                  key={mapping.id}
                                  className="w-7 h-7 rounded-md flex items-center justify-center"
                                  style={{ backgroundColor: sdg?.color }}
                                  title={`SDG ${sdg?.number}: ${sdg?.name}`}
                                >
                                  <span className="text-white text-xs font-bold">{sdg?.number}</span>
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">{strongImpact}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-600">{mediumImpact}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProject(project);
                                setActiveTab('overview');
                              }}
                            >
                              <Leaf className="h-4 w-4 mr-1" />
                              View SDGs
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setIsCreateDialogOpen(true);
                                form.setValue('projectId', project.id);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reporting">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>SDG Reporting</CardTitle>
                <CardDescription>Generate detailed reports on your SDG contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="p-3 rounded-md bg-blue-100 text-blue-700">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">SDG Impact Report</h3>
                        <p className="text-sm text-gray-500">Comprehensive report on all SDG contributions</p>
                      </div>
                      <Button className="ml-auto" onClick={handleGenerateSdgReport}>
                        Generate Report
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="p-3 rounded-md bg-green-100 text-green-700">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">SDG Data Export</h3>
                        <p className="text-sm text-gray-500">Export raw data for further analysis</p>
                      </div>
                      <Button variant="outline" className="ml-auto">
                        Export Data
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="p-3 rounded-md bg-amber-100 text-amber-700">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">SDG Communication Kit</h3>
                        <p className="text-sm text-gray-500">Materials for stakeholder communication</p>
                      </div>
                      <Button variant="outline" className="ml-auto">
                        Download Kit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>SDG Resources</CardTitle>
                <CardDescription>Helpful resources for SDG reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-md flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">UN SDG Guidelines</h4>
                      <p className="text-xs text-gray-500 mt-1">Official UN guidelines for reporting on SDGs</p>
                      <Button variant="link" className="p-0 h-auto mt-1 text-xs">
                        View resource
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">SDG Compass</h4>
                      <p className="text-xs text-gray-500 mt-1">Guide for business action on the SDGs</p>
                      <Button variant="link" className="p-0 h-auto mt-1 text-xs">
                        View resource
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm">GRI Standards</h4>
                      <p className="text-xs text-gray-500 mt-1">Global standards for sustainability reporting</p>
                      <Button variant="link" className="p-0 h-auto mt-1 text-xs">
                        View resource
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
