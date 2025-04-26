import React, { useEffect } from 'react';
import { useAuth } from '@/auth';
import { Redirect, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import Layout from '@/layout';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If auth check is complete and user is not authenticated, redirect to login
    if (!isLoading && !user) {
      console.log("Not authenticated in AuthenticatedLayout, redirecting to login");
      setTimeout(() => setLocation("/login"), 100);
    }
  }, [user, isLoading, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Render the layout with the authenticated user
  return <Layout>{children}</Layout>;
}