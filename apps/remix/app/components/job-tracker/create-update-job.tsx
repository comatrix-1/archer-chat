'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateJobApplication } from '~/hooks/useJobApplications';
import { createJobApplicationSchema, type JobApplicationStatus, type ZJobApplicationInput } from '@project/trpc/server/job-application-router/schema';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Combobox } from '~/components/ui/combobox';
import { FileUp, Plus, Wand, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  Form,
} from '../ui/form';

const statuses = [
  { id: 'OPEN', name: 'Open', color: 'bg-gray-300' },
  { id: 'APPLIED', name: 'Applied', color: 'bg-blue-500' },
  { id: 'SCREENING', name: 'Screening', color: 'bg-yellow-500' },
  { id: 'INTERVIEW', name: 'Interview', color: 'bg-purple-500' },
  { id: 'OFFER', name: 'Offer', color: 'bg-green-500' },
  { id: 'CLOSED', name: 'Closed', color: 'bg-gray-500' },
  { id: 'ACCEPTED', name: 'Accepted', color: 'bg-green-700' },
  { id: 'REJECTED', name: 'Rejected', color: 'bg-red-500' },
];

export interface JobFormProps {
  initialData?: Partial<ZJobApplicationInput> & { id?: string };
  onSubmit: (data: ZJobApplicationInput) => Promise<void>;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export function CreateUpdateJob({ 
  initialData, 
  onSubmit, 
  isSubmitting,
  isEditMode = false 
}: Readonly<JobFormProps>) {
  const navigate = useNavigate();

  const form = useForm<ZJobApplicationInput>({
    defaultValues: {
      companyName: initialData?.companyName || '',
      jobTitle: initialData?.jobTitle || '',
      status: (initialData?.status as JobApplicationStatus) || 'OPEN',
      jobLink: initialData?.jobLink || '',
      resumeId: initialData?.resumeId || '',
      coverLetterId: initialData?.coverLetterId || '',
      salary: initialData?.salary || '',
      jobDescription: initialData?.jobDescription || '',
      remarks: initialData?.remarks || '',
    },
  });

  const resumes = [
    { id: '1', name: 'Resume 1' },
  ];

  const handleSubmit = async (data: ZJobApplicationInput) => {
    try {
      await onSubmit(data);
      // Navigate back to the job tracker on success if not in edit mode
      if (!isEditMode) {
        navigate('/job-tracker');
      } else {
        toast.success('Job application updated successfully');
      }
    } catch (error) {
      toast.error(
        isEditMode 
          ? 'Failed to update job application' 
          : 'Failed to create job application'
      );
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit' : 'Add'} Job Application</CardTitle>
          <CardDescription>
            {isEditMode ? 'Edit' : 'Add'} the details of the job you're applying for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Controller
                          name="status"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" className="w-full" />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Salary (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. $100,000"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobLink"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Job Link (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. https://example.com/job/123" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Job Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste the job description here..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Remarks (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes about this application..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/job-tracker')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                      />
                    </svg>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </span>
                ) : isEditMode ? 'Update Application' : 'Create Application'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>
);
}
