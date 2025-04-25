import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/header';
import { Sidebar } from '@/components/sidebar/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when location changes (especially on mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // If the page is the auth page, don't show the sidebar and header
  if (location === '/auth') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
