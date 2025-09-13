import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { CreateUpdateJob } from '~/components/job-tracker/create-update-job';
import { createPageUrl } from '~/utils/create-page-url';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useCreateJobApplication } from '~/hooks/useJobApplications';
import { toast } from 'sonner';
import type { ZJobApplicationInput } from '@project/trpc/server/job-application-router/schema';

export default function AddJobPage() {
  const navigate = useNavigate();
  const createJobApplication = useCreateJobApplication();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ZJobApplicationInput) => {
    try {
      setIsSubmitting(true);
      await createJobApplication.mutateAsync({
        ...data,
        jobLink: data.jobLink || null,
        resumeId: data.resumeId || null,
        coverLetterId: data.coverLetterId || null,
        salary: data.salary || null,
        remarks: data.remarks || null,
      });
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error; // This will be caught by the form's error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl("job-tracker"))}
                className="smooth-hover"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Job application details
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateUpdateJob 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={false}
      />
    </div>
  );
}
