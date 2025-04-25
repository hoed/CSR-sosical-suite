import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FormTemplate, FormSubmission, InsertFormTemplate, InsertFormSubmission, Project } from '@shared/schema';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Clipboard, 
  FileText, 
  ClipboardList, 
  ListChecks, 
  Type, 
  HashIcon, 
  CalendarIcon, 
  Edit, 
  Copy, 
  Trash2,
  EyeIcon,
  CheckCircle,
  AlertCircle,
  ClockIcon
} from 'lucide-react';

// Mock data for forms
const mockTemplates: FormTemplate[] = [
  { 
    id: 1, 
    name: 'Environmental Impact Assessment', 
    description: 'Form for collecting environmental impact data from projects',
    fields: [
      { id: 'field_1', type: 'text', label: 'Project Area (hectares)', required: true },
      { id: 'field_2', type: 'number', label: 'Carbon Emissions Reduced (metric tons)', required: true },
      { id: 'field_3', type: 'checkbox', label: 'Includes Reforestation?', required: false },
      { id: 'field_4', type: 'textarea', label: 'Additional Environmental Observations', required: false },
    ],
    projectId: 1, 
    createdById: 1, 
    createdAt: new Date('2023-08-10') 
  },
  { 
    id: 2, 
    name: 'Community Engagement Survey', 
    description: 'Form for collecting feedback from community beneficiaries',
    fields: [
      { id: 'field_1', type: 'text', label: 'Community Name', required: true },
      { id: 'field_2', type: 'number', label: 'Number of Participants', required: true },
      { id: 'field_3', type: 'select', label: 'Engagement Type', options: ['Training', 'Workshop', 'Information Session'], required: true },
      { id: 'field_4', type: 'textarea', label: 'Feedback from Participants', required: false },
      { id: 'field_5', type: 'rating', label: 'Program Satisfaction (1-5)', required: true },
    ],
    projectId: 2, 
    createdById: 1, 
    createdAt: new Date('2023-07-20') 
  },
  { 
    id: 3, 
    name: 'Board Diversity Report', 
    description: 'Form for collecting board diversity information',
    fields: [
      { id: 'field_1', type: 'number', label: 'Total Board Members', required: true },
      { id: 'field_2', type: 'number', label: 'Female Board Members', required: true },
      { id: 'field_3', type: 'number', label: 'Board Members under 40', required: true },
      { id: 'field_4', type: 'checkbox', label: 'Diversity policy in place?', required: true },
      { id: 'field_5', type: 'textarea', label: 'Diversity Initiatives Planned', required: false },
    ],
    projectId: 3, 
    createdById: 1, 
    createdAt: new Date('2023-09-05') 
  },
];

// Mock submissions
const mockSubmissions: FormSubmission[] = [
  {
    id: 1, 
    formTemplateId: 1, 
    data: {
      field_1: '150',
      field_2: '500',
      field_3: true,
      field_4: 'The reforestation efforts are showing promising results with increased biodiversity in the area.'
    },
    submittedById: 1, 
    submittedAt: new Date('2023-09-10')
  },
  {
    id: 2, 
    formTemplateId: 2, 
    data: {
      field_1: 'Surabaya Community',
      field_2: '78',
      field_3: 'Workshop',
      field_4: 'Participants found the workshop valuable and requested follow-up sessions.',
      field_5: '4'
    },
    submittedById: 1, 
    submittedAt: new Date('2023-09-12')
  },
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
];

// Form builder schema
const formBuilderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  projectId: z.number({
    required_error: "Project is required",
  }),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      label: z.string(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })
  ).min(1, "At least one field is required"),
});

// Form submission schema 
const formSubmissionSchema = z.object({
  formTemplateId: z.number(),
  data: z.record(z.any()),
});

export default function DataCollection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [formFields, setFormFields] = useState<any[]>([]);

  // Form for creating a template
  const form = useForm<z.infer<typeof formBuilderSchema>>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: {
      name: "",
      description: "",
      projectId: 1,
      fields: [
        { id: "field_" + Date.now(), type: "text", label: "Field 1", required: false }
      ],
    },
  });

  // Form for submitting data
  const submissionForm = useForm<z.infer<typeof formSubmissionSchema>>({
    resolver: zodResolver(formSubmissionSchema),
    defaultValues: {
      formTemplateId: 0,
      data: {},
    },
  });

  // Add a field to the form builder
  const addField = () => {
    const currentFields = form.getValues().fields || [];
    const newField = { 
      id: "field_" + Date.now(), 
      type: "text", 
      label: `Field ${currentFields.length + 1}`, 
      required: false 
    };
    
    form.setValue('fields', [...currentFields, newField]);
  };

  // Remove a field from the form builder
  const removeField = (id: string) => {
    const currentFields = form.getValues().fields || [];
    form.setValue('fields', currentFields.filter(field => field.id !== id));
  };

  // Handle form template creation submission
  function onFormTemplateSubmit(values: z.infer<typeof formBuilderSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a form template.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Form template created",
      description: "Your form template has been created successfully.",
    });
    setIsCreateDialogOpen(false);
    form.reset({
      name: "",
      description: "",
      projectId: 1,
      fields: [
        { id: "field_" + Date.now(), type: "text", label: "Field 1", required: false }
      ],
    });
  }

  // Open the submission dialog with the selected template
  const handleOpenSubmitDialog = (template: FormTemplate) => {
    setSelectedTemplate(template);
    submissionForm.reset({
      formTemplateId: template.id,
      data: {},
    });
    setIsSubmitDialogOpen(true);
  };

  // Handle form data submission
  function onFormSubmissionSubmit(values: z.infer<typeof formSubmissionSchema>) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit form data.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Form submitted",
      description: "Your form data has been submitted successfully.",
    });
    setIsSubmitDialogOpen(false);
    submissionForm.reset();
  }

  // Get field component based on field type
  const getFieldComponent = (field: any, register: any, errors: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            placeholder={`Enter ${field.label.toLowerCase()}`} 
            {...register(`data.${field.id}`)} 
          />
        );
      case 'number':
        return (
          <Input 
            type="number" 
            placeholder={`Enter ${field.label.toLowerCase()}`} 
            {...register(`data.${field.id}`)} 
          />
        );
      case 'textarea':
        return (
          <Textarea 
            placeholder={`Enter ${field.label.toLowerCase()}`} 
            className="resize-none"
            {...register(`data.${field.id}`)} 
          />
        );
      case 'checkbox':
        return (
          <Checkbox 
            {...register(`data.${field.id}`)} 
          />
        );
      case 'select':
        return (
          <Select onValueChange={(value) => register(`data.${field.id}`).onChange({ target: { value } })}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                type="button"
                variant="outline"
                size="sm"
                className={`w-10 h-10 ${submissionForm.watch(`data.${field.id}`) === rating.toString() ? 'bg-primary-100 border-primary-500' : ''}`}
                onClick={() => register(`data.${field.id}`).onChange({ target: { value: rating.toString() } })}
              >
                {rating}
              </Button>
            ))}
          </div>
        );
      default:
        return <Input {...register(`data.${field.id}`)} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Collection</h1>
          <p className="text-gray-500 mt-1">Create forms and collect impact data from your projects</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Form Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create Form Template</DialogTitle>
              <DialogDescription>
                Design a custom form to collect impact data from your projects.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFormTemplateSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Form Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Environmental Impact Assessment" {...field} />
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
                          placeholder="Describe the purpose of this form" 
                          className="resize-none"
                          {...field} 
                        />
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
                      <FormLabel>Associated Project</FormLabel>
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
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium">Form Fields</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addField}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                  </div>
                  
                  {form.watch('fields')?.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Field {index + 1}</h4>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeField(field.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`fields.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Label</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`fields.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="textarea">Text Area</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="select">Dropdown</SelectItem>
                                  <SelectItem value="rating">Rating</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`fields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Required field</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch(`fields.${index}.type`) === 'select' && (
                        <FormField
                          control={form.control}
                          name={`fields.${index}.options`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Options (comma-separated)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Option 1, Option 2, Option 3"
                                  onChange={(e) => {
                                    const options = e.target.value.split(',').map(option => option.trim());
                                    field.onChange(options);
                                  }}
                                  value={field.value?.join(', ') || ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  ))}
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
                    Create Template
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...submissionForm}>
              <form onSubmit={submissionForm.handleSubmit(onFormSubmissionSubmit)} className="space-y-4">
                {selectedTemplate?.fields.map((field: any) => (
                  <FormField
                    key={field.id}
                    control={submissionForm.control}
                    name={`data.${field.id}`}
                    render={({ field: registerField }) => (
                      <FormItem>
                        <FormLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                        <FormControl>
                          {getFieldComponent(field, registerField, submissionForm.formState.errors)}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSubmitDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Form
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-blue-100 mb-3">
                <Clipboard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Form Templates</h3>
              <p className="text-sm text-gray-500 mb-3">Create custom forms for data collection</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setIsCreateDialogOpen(true)}>
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-green-100 mb-3">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Data Submissions</h3>
              <p className="text-sm text-gray-500 mb-3">Collected data from your forms</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => setActiveTab('submissions')}>
                View Submissions
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-amber-100 mb-3">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Data Reports</h3>
              <p className="text-sm text-gray-500 mb-3">Generate reports from collected data</p>
              <Button size="sm" variant="outline" className="w-full">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="templates">Form Templates</TabsTrigger>
          <TabsTrigger value="submissions">Data Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Form Templates</CardTitle>
              <CardDescription>View and manage your data collection forms</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTemplates.map((template) => {
                    const project = mockProjects.find(p => p.id === template.projectId);
                    
                    return (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.description}</div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {project?.name || 'Unknown Project'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(template.fields) && template.fields.map((field: any, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                {field.type === 'text' && <Type className="h-3 w-3 mr-1" />}
                                {field.type === 'number' && <HashIcon className="h-3 w-3 mr-1" />}
                                {field.type === 'checkbox' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {field.type === 'textarea' && <FileText className="h-3 w-3 mr-1" />}
                                {field.type === 'select' && <ListChecks className="h-3 w-3 mr-1" />}
                                {field.type === 'date' && <CalendarIcon className="h-3 w-3 mr-1" />}
                                {field.label}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(template.createdAt).toLocaleDateString('en-US', {
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
                              onClick={() => handleOpenSubmitDialog(template)}
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Fill Form
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4 text-gray-500" />
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
        
        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Data Submissions</CardTitle>
              <CardDescription>View all submitted form data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form Name</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubmissions.map((submission) => {
                    const template = mockTemplates.find(t => t.id === submission.formTemplateId);
                    
                    return (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{template?.name || 'Unknown Form'}</div>
                          <div className="text-sm text-gray-500">
                            {Object.keys(submission.data).length} fields completed
                          </div>
                        </TableCell>
                        <TableCell>
                          John Smith
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center w-fit">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4 text-gray-500" />
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
      </Tabs>
    </div>
  );
}
