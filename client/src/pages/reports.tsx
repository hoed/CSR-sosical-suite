import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Report, InsertReport, insertReportSchema } from '@shared/schema';
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
import { FileText, Download, Eye, Clock, Filter, PlusCircle, FileBarChart, FileSpreadsheet, File } from 'lucide-react';

// Mock report data
const mockReports = [
  { id: 1, name: 'Annual Sustainability Report', description: 'Comprehensive report on all ESG initiatives', type: 'impact', format: 'pdf', createdById: 1, createdAt: new Date('2023-09-01') },
  { id: 2, name: 'Carbon Emissions Q3 2023', description: 'Quarterly carbon emissions report', type: 'project', format: 'excel', createdById: 1, createdAt: new Date('2023-07-15') },
  { id: 3, name: 'Social Impact Summary', description: 'Overview of social impact programs', type: 'impact', format: 'pdf', createdById: 1, createdAt: new Date('2023-08-22') },
  { id: 4, name: 'SDG Alignment Report', description: 'Analysis of project contributions to SDGs', type: 'sdg', format: 'pdf', createdById: 1, createdAt: new Date('2023-09-10') },
  { id: 5, name: 'Waste Reduction Metrics', description: 'Detailed metrics on waste reduction efforts', type: 'project', format: 'excel', createdById: 1, createdAt: new Date('2023-06-30') },
];

// Extend the report schema for the form
const reportFormSchema = insertReportSchema.extend({
  createdById: z.number().optional(),
});

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Create report form
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "project",
      format: "pdf",
      parameters: {}
    },
  });
  
  // Filter reports based on active tab
  const filteredReports = mockReports.filter(report => {
    if (activeTab === 'all') return true;
    return report.type === activeTab;
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof reportFormSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a report.",
        variant: "destructive",
      });
      return;
    }
    
    // Add the current user as creator
    const newReport = {
      ...values,
      createdById: user.id || 0, // Added fallback to prevent null reference
    };
    
    toast({
      title: "Report created",
      description: "Your report is being generated and will be available shortly.",
    });
    setIsCreateDialogOpen(false);
    form.reset();
  }
  
  // Handle report download
  const handleDownloadReport = (report: Report) => {
    toast({
      title: "Downloading report",
      description: `${report.name} is being downloaded.`,
    });
  };
  
  // Get icon based on report format
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and manage impact reports for your stakeholders</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Create a new report based on your projects and impact data.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Q3 2023 Sustainability Report" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose and content of this report" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="project">Project Report</SelectItem>
                            <SelectItem value="impact">Impact Report</SelectItem>
                            <SelectItem value="sdg">SDG Alignment Report</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="parameters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report Parameters</FormLabel>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-charts" 
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            defaultChecked
                          />
                          <label htmlFor="include-charts" className="text-sm text-gray-700">Include charts and visualizations</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-metrics" 
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                            defaultChecked
                          />
                          <label htmlFor="include-metrics" className="text-sm text-gray-700">Include detailed metrics</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="include-recommendations" 
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label htmlFor="include-recommendations" className="text-sm text-gray-700">Include recommendations</label>
                        </div>
                      </div>
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
                  <Button type="submit">
                    Generate Report
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-green-100 mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Sustainability Report</h3>
              <p className="text-sm text-gray-500 mb-3">Comprehensive view of your ESG performance</p>
              <Button size="sm" variant="outline" className="w-full">
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-blue-100 mb-3">
                <FileBarChart className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Impact Report</h3>
              <p className="text-sm text-gray-500 mb-3">Detailed analysis of project outcomes</p>
              <Button size="sm" variant="outline" className="w-full">
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-yellow-100 mb-3">
                <Filter className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">SDG Alignment</h3>
              <p className="text-sm text-gray-500 mb-3">Map initiatives to UN Sustainable Development Goals</p>
              <Button size="sm" variant="outline" className="w-full">
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-purple-100 mb-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Periodic Report</h3>
              <p className="text-sm text-gray-500 mb-3">Monthly, quarterly, or annual performance</p>
              <Button size="sm" variant="outline" className="w-full">
                Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="project">Project Reports</TabsTrigger>
          <TabsTrigger value="impact">Impact Reports</TabsTrigger>
          <TabsTrigger value="sdg">SDG Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download your previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getFormatIcon(report.format)}
                          <div className="ml-3">
                            <div className="font-medium">{report.name}</div>
                            <div className="text-sm text-gray-500">{report.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.type === 'project' ? 'bg-blue-100 text-blue-800' :
                          report.type === 'impact' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="uppercase text-xs font-medium">{report.format}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
