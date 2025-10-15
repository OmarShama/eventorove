import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Shield, User, UserCheck, Trash2 } from "lucide-react";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User as UserType } from "@/types/api";

interface UserTableProps {
  users: UserType[];
  isLoading?: boolean;
}

export default function UserTable({ users, isLoading }: UserTableProps) {
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'guest' | 'host' | 'admin' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' | 'banned' }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteUserId(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'destructive',
      host: 'default',
      guest: 'secondary',
    } as const;
    
    const icons = {
      admin: Shield,
      host: UserCheck,
      guest: User,
    };
    
    const Icon = icons[role as keyof typeof icons] || User;
    
    return (
      <Badge variant={variants[role as keyof typeof variants] || 'secondary'} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const handleRoleChange = (userId: string, newRole: 'guest' | 'host' | 'admin') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></TableCell>
                <TableCell><div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-sm font-medium">Change Role</div>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'guest')}
                          disabled={user.role === 'guest'}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Guest
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'host')}
                          disabled={user.role === 'host'}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Host
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          disabled={user.role === 'admin'}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <div className="px-2 py-1.5 text-sm font-medium">Status</div>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                          Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'banned')}>
                          Ban
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              The user will lose access to their account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
