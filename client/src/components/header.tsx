import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, HelpCircle, Menu, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HeaderProps {
  toggleSidebar: () => void;
}

// User data for development
const userProfile = {
  fullName: "Demo User",
  username: "demo",
  role: "admin"
};

export function Header({ toggleSidebar }: HeaderProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Project Update', message: 'Reforestation Project completion updated to 90%', read: false },
    { id: 2, title: 'New Form Submission', message: 'A new data collection form has been submitted', read: false },
    { id: 3, title: 'Deadline Approaching', message: 'Community Education Program deadline in 3 days', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-gray-500" />
            </Button>

            <div className="md:hidden ml-2 flex items-center">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary-500">
                <svg className="text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
                  <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-800">ImpactTrack</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative" 
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-500" />
                  {unreadCount > 0 && (
                    <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs" variant="destructive">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.read ? 'opacity-70' : 'bg-blue-50/50'}`}
                        onClick={() => handleNotificationRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 flex justify-center">
                  <Button variant="link" size="sm" className="text-xs">
                    Mark all as read
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-500" 
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h3 className="font-medium">Need help?</h3>
                  <p className="text-sm text-gray-500">
                    Get support and learn how to use ImpactTrack effectively.
                  </p>
                  <div className="space-y-1">
                    <Button variant="link" size="sm" className="w-full justify-start p-0 h-auto text-left">Documentation</Button>
                    <Button variant="link" size="sm" className="w-full justify-start p-0 h-auto text-left">Video tutorials</Button>
                    <Button variant="link" size="sm" className="w-full justify-start p-0 h-auto text-left">Contact support</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src="" alt={userProfile.fullName} />
                    <AvatarFallback>{userProfile.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="flex items-center">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth">
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
