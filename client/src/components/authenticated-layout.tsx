import React from 'react';
import Layout from '@/layout';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  // Temporary simplified version that always renders the content
  return <Layout>{children}</Layout>;
}