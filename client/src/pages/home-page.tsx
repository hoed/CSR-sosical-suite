import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to dashboard since the homepage is just a redirect
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <span className="ml-2">Redirecting to dashboard...</span>
    </div>
  );
}
