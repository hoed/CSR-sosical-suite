import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertUserSchema, InsertUser } from '@shared/schema';
import { useLocation } from 'wouter';
import { Leaf, ArrowRight, Loader2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type AuthFormMode = 'login' | 'register';

// Extended schema for login that only requires username and password
const loginSchema = insertUserSchema.pick({ 
  username: true, 
  password: true 
});

// Registration schema with password confirmation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [mode, setMode] = useState<AuthFormMode>('login');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "contributor"
    },
  });

  // Handle login submission
  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoggingIn(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoggingIn(false);
      toast({
        title: "Logged in successfully",
        description: "Welcome back to ImpactTrack!",
      });
      navigate('/dashboard');
    }, 1000);
  }

  // Handle registration submission
  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    setIsRegistering(true);
    
    // Simulate registration process
    setTimeout(() => {
      setIsRegistering(false);
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
      navigate('/dashboard');
    }, 1500);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-50">
      {/* Auth Form */}
      <div className="flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary-500">
                <Leaf className="text-white h-6 w-6" />
              </div>
              <span className="ml-2 text-2xl font-semibold text-gray-800">ImpactTrack</span>
            </div>
            <CardTitle className="text-center text-2xl">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login' 
                ? 'Sign in to your account to continue' 
                : 'Sign up to get started with impact tracking'}
            </CardDescription>
          </CardHeader>
          
          <Tabs 
            defaultValue={mode} 
            value={mode} 
            onValueChange={(value) => setMode(value as AuthFormMode)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Sign In
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Create Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex flex-col">
            <div className="mt-4 text-center text-sm text-gray-500">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0" onClick={() => setMode('register')}>
                    Sign up
                  </Button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <Button variant="link" className="p-0" onClick={() => setMode('login')}>
                    Sign in
                  </Button>
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero/info section */}
      <div className="hidden md:flex md:flex-col md:items-center md:justify-center bg-primary-500 p-8 text-white">
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Track, Measure, and Report Your Social Impact
          </h1>
          <p className="text-lg">
            ImpactTrack helps organizations monitor and measure the environmental, social, and governance impact of their programs and initiatives.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Comprehensive ESG Dashboards</h3>
                <p className="text-white/80 text-sm">Visualize your organization's environmental, social, and governance performance.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium">SDG Alignment</h3>
                <p className="text-white/80 text-sm">Map your initiatives to UN Sustainable Development Goals for better reporting.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Custom Data Collection</h3>
                <p className="text-white/80 text-sm">Create and distribute custom forms to gather impact data from your projects.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
