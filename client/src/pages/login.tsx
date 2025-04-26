import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth';

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, login, register, isLoading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  
  // Loading states
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoginLoading(true);
    try {
      const userData = await login(username, password);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.fullName || userData.username}!`,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerUsername || !registerPassword || !registerFullName || !registerEmail) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsRegisterLoading(true);
    try {
      // Use the register function from our auth hook
      const userData = await register({
        username: registerUsername,
        password: registerPassword,
        fullName: registerFullName,
        email: registerEmail,
        role: 'user'
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome to ImpactTrack, ${userData.fullName || userData.username}!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Username may already be taken",
        variant: "destructive",
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        <div className="flex-1 flex items-center justify-center p-4 md:p-10">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                      <path d="M12 2v2"/>
                      <path d="M12 20v2"/>
                      <path d="M2 12h2"/>
                      <path d="M20 12h2"/>
                    </svg>
                  </div>
                  <CardTitle className="text-2xl">ImpactTrack</CardTitle>
                </div>
              </div>
              <CardDescription>
                Track, measure, and report your social impact initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="Enter your username" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={isLoginLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="link" className="px-0 font-normal h-auto" size="sm">
                          Forgot password?
                        </Button>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoginLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoginLoading}>
                      {isLoginLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-fullname">Full Name</Label>
                      <Input 
                        id="register-fullname" 
                        placeholder="Enter your full name" 
                        value={registerFullName}
                        onChange={e => setRegisterFullName(e.target.value)}
                        disabled={isRegisterLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input 
                        id="register-email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={registerEmail}
                        onChange={e => setRegisterEmail(e.target.value)}
                        disabled={isRegisterLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        placeholder="Choose a username" 
                        value={registerUsername}
                        onChange={e => setRegisterUsername(e.target.value)}
                        disabled={isRegisterLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        placeholder="Choose a password" 
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        disabled={isRegisterLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                      {isRegisterLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-center text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center p-10 bg-primary bg-opacity-10 dark:bg-opacity-20">
          <div className="max-w-md space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Measure your social impact
              </h1>
              <p className="text-gray-500 dark:text-gray-400 md:text-xl">
                Track, visualize, and report on your organization's social and environmental initiatives.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Data-driven insights</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Collect and analyze impact data with powerful tools</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">SDG alignment</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Map projects to UN Sustainable Development Goals</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Beautiful reports</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generate ESG reports for stakeholders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}