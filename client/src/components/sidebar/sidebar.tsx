import React from 'react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  FileText,
  ClipboardList,
  Globe,
  UserCog,
  Settings,
  Leaf
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="mr-3 text-lg h-5 w-5" />,
      href: '/',
    },
    {
      title: 'Projects',
      icon: <FolderKanban className="mr-3 text-lg h-5 w-5" />,
      href: '/projects',
    },
    {
      title: 'Metrics & Indicators',
      icon: <BarChart3 className="mr-3 text-lg h-5 w-5" />,
      href: '/metrics',
    },
    {
      title: 'Reports',
      icon: <FileText className="mr-3 text-lg h-5 w-5" />,
      href: '/reports',
    },
    {
      title: 'Data Collection',
      icon: <ClipboardList className="mr-3 text-lg h-5 w-5" />,
      href: '/data-collection',
    },
    {
      title: 'SDG Alignment',
      icon: <Globe className="mr-3 text-lg h-5 w-5" />,
      href: '/sdg-alignment',
    },
  ];
  
  const adminItems = [
    {
      title: 'User Management',
      icon: <UserCog className="mr-3 text-lg h-5 w-5" />,
      href: '/user-management',
    },
    {
      title: 'Settings',
      icon: <Settings className="mr-3 text-lg h-5 w-5" />,
      href: '/settings',
    },
  ];
  
  // Determine if user is admin (if role data is available)
  const isAdmin = user?.role === 'admin';
  
  const sidebarClasses = cn(
    'flex flex-col bg-white border-r border-gray-200 h-full overflow-y-auto transition-all duration-300 ease-in-out',
    isOpen 
      ? 'fixed inset-0 z-40 md:relative md:z-0 w-full md:w-64' 
      : 'hidden md:flex md:w-64'
  );
  
  return (
    <aside className={sidebarClasses} id="sidebar">
      <div className="flex items-center justify-start p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary-500">
            <Leaf className="text-white h-5 w-5" />
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-800">ImpactTrack</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden ml-auto"
          onClick={onToggle}
        >
          <span className="sr-only">Close menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a 
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === item.href
                    ? "bg-primary-50 text-primary-500"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.title}
              </a>
            </Link>
          ))}
        </div>
        
        {(isAdmin || !user) && (
          <div className="mt-8">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </h3>
            <div className="mt-2 space-y-1">
              {adminItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      location === item.href
                        ? "bg-primary-50 text-primary-500"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user.fullName || user.username} />
              <AvatarFallback>{(user.fullName || user.username).substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.fullName || user.username}</p>
              <p className="text-xs font-medium text-gray-500">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
