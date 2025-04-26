import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Indicator, InsertIndicator, insertIndicatorSchema, InsertIndicatorValue, insertIndicatorValueSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import { ProgressRing } from '@/components/ui/progress-ring';
import { PlusCircle, ArrowUpRight, TrendingUp, Edit, Trash2 } from 'lucide-react';

// Mock data for indicators
const mockIndicators = [
  { id: 1, name: 'Carbon Emissions Reduced', description: 'Total carbon emissions reduced by the project', category: 'environmental', unit: 'metric tons', dataType: 'number', projectId: 1, createdById: 1, customizable: true },
  { id: 2, name: 'Waste Reduced', description: 'Amount of waste reduced', category: 'environmental', unit: 'kg', dataType: 'number', projectId: 1, createdById: 1, customizable: true },
  { id: 3, name: 'People Benefited', description: 'Number of people who benefited from the project', category: 'social', unit: 'people', dataType: 'number', projectId: 2, createdById: 1, customizable: true },
  { id: 4, name: 'Educational Sessions', description: 'Number of educational sessions conducted', category: 'social', unit: 'sessions', dataType: 'number', projectId: 2, createdById: 1, customizable: true },
  { id: 5, name: 'Board Gender Diversity', description: 'Percentage of women on the board', category: 'governance', unit: '%', dataType: 'number', projectId: 3, createdById: 1, customizable: true },
];

// Mock data for indicator values
const mockIndicatorValues = [
  { id: 1, indicatorId: 1, projectId: 1, value: '120', date: new Date('2023-06-01'), submittedById: 1 },
  { id: 2, indicatorId: 1, projectId: 1, value: '150', date: new Date('2023-07-01'), submittedById: 1 },
  { id: 3, indicatorId: 1, projectId: 1, value: '180', date: new Date('2023-08-01'), submittedById: 1 },
  { id: 4, indicatorId: 2, projectId: 1, value: '500', date: new Date('2023-06-01'), submittedById: 1 },
  { id: 5, indicatorId: 2, projectId: 1, value: '750', date: new Date('2023-07-01'), submittedById: 1 },
  { id: 6, indicatorId: 2, projectId: 1, value: '1200', date: new Date('2023-08-01'), submittedById: 1 },
];

// Chart data based on indicator values
const generateChartData = (indicatorId: number) => {
  return mockIndicatorValues
    .filter(value => value.indicatorId === indicatorId)
    .map(value => ({
      date: new Date(value.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: parseFloat(value.value)
    }));
};

// Extend the indicator schema for the form
const indicatorFormSchema = insertIndicatorSchema.extend({
  projectId: z.number({
    required_error: "Project is required",
  }),
  createdById: z.number().optional(),
});

export default function MetricsPage() {
  // Simplified approach - hardcode user
  const user = { id: 1, username: "admin", fullName: "Admin User" };
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

  // Create indicator form
  const form = useForm<z.infer<typeof indicatorFormSchema>>({
    resolver: zodResolver(indicatorFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "environmental",
      unit: "",
      dataType: "number",
      projectId: 1,
      customizable: true
    },
  });

  // Create indicator value form
  const valueForm = useForm<z.infer<typeof insertIndicatorValueSchema>>({
    resolver: zodResolver(insertIndicatorValueSchema),
    defaultValues: {
      indicatorId: 0,
      projectId: 0,
      value: "",
      date: new Date(),
      submittedById: user?.id || 0
    },
  });

  // Filter indicators based on active tab
  const filteredIndicators = mockIndicators.filter(indicator => {
    if (activeTab === 'all') return true;
    return indicator.category === activeTab;
  });

  // Handle indicator form submission
  function onIndicatorSubmit(values: z.infer<typeof indicatorFormSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create an indicator.",
        variant: "destructive",
      });
      return;
    }
    
    // Add the current user as creator
    const newIndicator = {
      ...values,
      createdById: user.id || 0, // Added fallback to prevent null reference
    };
    
    toast({
      title: "Indicator created",
      description: "Your indicator has been created successfully.",
    });
    setIsCreateDialogOpen(false);
    form.reset();
  }

  // Handle indicator value form submission
  function onValueSubmit(values: z.infer<typeof insertIndicatorValueSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a value.",
        variant: "destructive",
      });
      return;
    }
    
    // Add the current user as submitter
    const newValue = {
      ...values,
      submittedById: user.id || 0, // Added fallback to prevent null reference
    };
    
    toast({
      title: "Value submitted",
      description: "Your indicator value has been submitted successfully.",
    });
    setIsValueDialogOpen(false);
    valueForm.reset();
  }

  // Set up value form when selecting an indicator
  const handleAddValue = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    valueForm.reset({
      indicatorId: indicator.id,
      projectId: indicator.projectId,
      value: "",
      date: new Date(),
      submittedById: user?.id || 0
    });
    setIsValueDialogOpen(true);
  };

  // COLORS for charts
  const COLORS = ['#16803C', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impact Metrics & Indicators</h1>
          <p className="text-gray-500 mt-1">Track and measure the impact of your CSR and ESG initiatives</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Indicator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Indicator</DialogTitle>
              <DialogDescription>
                Define a new impact indicator to track your project's performance.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onIndicatorSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicator Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Carbon Emissions Reduced" {...field} />
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
                          placeholder="Describe what this indicator measures and why it's important" 
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="environmental">Environmental</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="governance">Governance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select data type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="boolean">Yes/No</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., metric tons, people, %" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            <SelectItem value="1">Waste Reduction Initiative</SelectItem>
                            <SelectItem value="2">Community Education Program</SelectItem>
                            <SelectItem value="3">Board Diversity Initiative</SelectItem>
                            <SelectItem value="4">Reforestation Project</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Indicator
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Indicator Value</DialogTitle>
              <DialogDescription>
                {selectedIndicator && `Record a new value for ${selectedIndicator.name}`}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...valueForm}>
              <form onSubmit={valueForm.handleSubmit(onValueSubmit)} className="space-y-4">
                <FormField
                  control={valueForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`Enter ${selectedIndicator?.dataType === 'number' ? 'a number' : 'value'}`} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {selectedIndicator && `Unit: ${selectedIndicator.unit}`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsValueDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Value
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Environmental</h2>
                <p className="text-sm text-gray-500">5 indicators</p>
              </div>
              <div className="h-12 w-12">
                <ProgressRing value={78} size={48} color="#16803C" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">12% improvement</span>
                <span className="text-gray-500 ml-1">from last quarter</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Social</h2>
                <p className="text-sm text-gray-500">7 indicators</p>
              </div>
              <div className="h-12 w-12">
                <ProgressRing value={81} size={48} color="#3B82F6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">8% improvement</span>
                <span className="text-gray-500 ml-1">from last quarter</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Governance</h2>
                <p className="text-sm text-gray-500">4 indicators</p>
              </div>
              <div className="h-12 w-12">
                <ProgressRing value={65} size={48} color="#F59E0B" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">5% improvement</span>
                <span className="text-gray-500 ml-1">from last quarter</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Indicators</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Impact Indicators</CardTitle>
              <CardDescription>Track and measure your social and environmental impact</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicator Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Latest Value</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndicators.map((indicator) => {
                    // Get the latest value for this indicator
                    const values = mockIndicatorValues.filter(val => val.indicatorId === indicator.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    
                    const latestValue = values.length > 0 ? values[0].value : 'N/A';
                    
                    // Calculate trend data
                    const chartData = generateChartData(indicator.id);
                    const hasTrend = chartData.length > 1;
                    
                    return (
                      <TableRow key={indicator.id}>
                        <TableCell>
                          <div className="font-medium">{indicator.name}</div>
                          <div className="text-sm text-gray-500">{indicator.description}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            indicator.category === 'environmental' ? 'bg-green-100 text-green-800' :
                            indicator.category === 'social' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {indicator.category.charAt(0).toUpperCase() + indicator.category.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{indicator.unit}</TableCell>
                        <TableCell>{latestValue}</TableCell>
                        <TableCell>
                          {hasTrend ? (
                            <div className="h-10 w-20">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={
                                      indicator.category === 'environmental' ? '#16803C' :
                                      indicator.category === 'social' ? '#3B82F6' :
                                      '#F59E0B'
                                    } 
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <span className="text-gray-500">No trend data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddValue(indicator)}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Value
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-gray-500" />
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
          
          {/* Metric Visualizations */}
          {filteredIndicators.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Metric Visualizations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart for Environmental Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle>Environmental Metrics</CardTitle>
                    <CardDescription>Tracking our environmental impact over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={generateChartData(1)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#16803C" name="Carbon Emissions (tons)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Pie Chart for Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Distribution</CardTitle>
                    <CardDescription>Distribution of impact across categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Environmental', value: 42 },
                              { name: 'Social', value: 35 },
                              { name: 'Governance', value: 23 }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Environmental', value: 42 },
                              { name: 'Social', value: 35 },
                              { name: 'Governance', value: 23 }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
