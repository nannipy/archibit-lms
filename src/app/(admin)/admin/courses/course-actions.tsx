'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, Eye, EyeOff, Plus } from 'lucide-react';
import Link from 'next/link';
import { deleteCourse, toggleCoursePublish } from './actions';
import { toast } from 'sonner';

interface CourseActionsProps {
  courseId: string;
  isPublished: boolean;
}

export function CourseActions({ courseId, isPublished }: CourseActionsProps) {
  const handleTogglePublish = async () => {
    try {
        await toggleCoursePublish(courseId, !isPublished);
        toast.success(isPublished ? 'Course unpublished' : 'Course published');
    } catch {
        toast.error('Something went wrong');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        toast.success('Course deleted');
      } catch {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleTogglePublish}>
          {isPublished ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href={`/admin/courses/${courseId}/lessons/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href={`/admin/courses/${courseId}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
            </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-500">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
