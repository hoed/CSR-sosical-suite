import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Edit, Trash2, Lock, Mail, ShieldCheck, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock user data
const mockUsers = [
  { id: 1, username: 'admin_user', fullName: 'Admin User', email: 'admin@example.com', role: 'admin', organizationId: 1, createdAt: new Date('2023-01-15') },
  { id: 2, username: 'data_collector', fullName: 'Data Collector', email: 'collector@example.com', role: 'contributor', organizationId: 1, createdAt: new Date('2023-02-10') },
  { id: 3, username: 'report_viewer', fullName: 'Report User', email: 'reports@example.com', role: 'viewer', organizationId: 1, createdAt: new Date('2023-03-05') },
  { id: 4, username: 'env_manager', fullName: 'Environmental Manager', email: 'envmgr@example.com', role: 'manager', organizationId: 1, createdAt: new Date('2023-04-20') },
  { id: 5, username: 'analyst_user', fullName: 'Impact Analyst', email: 'analyst@example.com', role: 'analyst', organizationId: 1, createdAt: new Date('2023-05-15') },
];

export default function UserManagement() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Get role badge component with appropriate color
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500 hover:bg-red-600">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-violet-500 hover:bg-violet-600">Manager</Badge>;
      case 'analyst':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Analyst</Badge>;
      case 'contributor':
        return <Badge className="bg-green-500 hover:bg-green-600">Contributor</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Viewer</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    toast({
      title: "User deleted",
      description: `${selectedUser?.fullName} has been removed from the platform.`,
    });
    setIsDeleteDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    toast({
      title: "Edit user",
      description: `Edit functionality for ${user.fullName} will be available soon.`,
    });
  };

  const handleResetPassword = (user: User) => {
    toast({
      title: "Password reset",
      description: `Password reset instructions sent to ${user.email}.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage users and their access to the platform</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="p-3 rounded-full bg-primary-100">
                <ShieldCheck className="h-5 w-5 text-primary-500" />
              </div>
              <div className="text-2xl font-semibold">{mockUsers.filter(u => u.role === 'admin').length}</div>
            </div>
            <h3 className="text-sm font-medium mt-3">Administrators</h3>
            <p className="text-xs text-gray-500">Full access users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="p-3 rounded-full bg-violet-100">
                <Shield className="h-5 w-5 text-violet-500" />
              </div>
              <div className="text-2xl font-semibold">{mockUsers.filter(u => u.role === 'manager').length}</div>
            </div>
            <h3 className="text-sm font-medium mt-3">Managers</h3>
            <p className="text-xs text-gray-500">Project management access</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-semibold">{mockUsers.filter(u => u.role === 'contributor').length}</div>
            </div>
            <h3 className="text-sm font-medium mt-3">Contributors</h3>
            <p className="text-xs text-gray-500">Data entry users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-semibold">{mockUsers.length}</div>
            </div>
            <h3 className="text-sm font-medium mt-3">Total Users</h3>
            <p className="text-xs text-gray-500">All platform users</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src="" />
                        <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleResetPassword(user)}>
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteUser(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {selectedUser?.fullName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}