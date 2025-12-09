'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, ShieldOff } from 'lucide-react';
import { toggleUserRole } from './actions';
import { toast } from 'sonner';
import { Role } from '@prisma/client';

interface UserRoleToggleProps {
  userId: string;
  currentRole: Role;
  currentUserId: string;
}

export function UserRoleToggle({ userId, currentRole, currentUserId }: UserRoleToggleProps) {
  const handleToggleRole = async () => {
    try {
        await toggleUserRole(userId, currentRole);
        toast.success(`User role updated`);
    } catch (error: any) {
        toast.error(error.message || 'Something went wrong');
    }
  };

  const isSelf = userId === currentUserId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isSelf}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleToggleRole}>
          {currentRole === 'ADMIN' ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4" />
              Remove Admin
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
