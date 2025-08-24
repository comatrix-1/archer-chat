import { useState, useEffect } from 'react';
import { Button } from '@project/remix/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@project/remix/app/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@project/remix/app/components/ui/command';
import { Briefcase } from 'lucide-react';
import { useJobApplications } from '~/hooks/useJobApplications';
import type { ZJobApplicationWithId } from '@project/trpc/server/job-application-router/schema';

interface JobApplicationSelectorDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSelect: (id: string) => void;
}

export default function JobApplicationSelectorDialog({
  isOpen,
  onClose,
  onSelect
}: JobApplicationSelectorDialogProps) {
  const [applications, setApplications] = useState<ZJobApplicationWithId[]>([]);
  const { data: jobApplicationsData, isLoading, error } = useJobApplications({
    // Optional: Add any filters here
    // status: 'APPLIED',
    // limit: 10,
  });

  useEffect(() => {
    if (jobApplicationsData?.items) {
      setApplications(jobApplicationsData.items);
    }
  }, [jobApplicationsData]);

  useEffect(() => {
    if (error) {
      console.error('Error loading job applications:', error);
    }
  }, [error]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Select a Job Application
          </DialogTitle>
          <DialogDescription>
            Choose the job you want to create a customized resume for.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-sm mt-4">
          <CommandInput placeholder="Search job applications..." />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Loading...
              </div>
            ) : applications.length === 0 ? (
              <CommandEmpty>No applications found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {applications.map((application) => (
                  <CommandItem
                    key={application.id}
                    value={`${application.jobTitle} ${application.companyName}`}
                    onSelect={() => {
                      onSelect(application.id);
                      onClose(false);
                    }}
                    className="flex items-center gap-4 py-3 cursor-pointer"
                  >
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <div className="flex flex-col">
                      <p className="font-semibold text-slate-800">Job title: {application.jobTitle}</p>
                      <p className="text-sm text-slate-500">Company name: {application.companyName}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
