import type { ZJobApplicationInput } from '@project/trpc/server/job-application-router/schema';
import { ArrowLeft, FileText } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CreateUpdateJob } from '~/components/job-tracker/create-update-job';
import { Button } from '~/components/ui/button';
import { useJobApplication, useUpdateJobApplication } from '~/hooks/useJobApplications';
import { createPageUrl } from '~/utils/create-page-url';
import { useAuth } from '../../contexts/AuthContext';

export default function JobDetailPage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: job, isLoading, error } = useJobApplication(id || '', user?.id || '');

    const updateJobApplication = useUpdateJobApplication();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: ZJobApplicationInput) => {
        console.log('handleSubmit data: ', data);
        if (!id) return;

        try {
            setIsSubmitting(true);
            await updateJobApplication.mutateAsync({
                id,
                ...data,
                jobLink: data.jobLink || null,
                resumeId: data.resumeId || null,
                coverLetterId: data.coverLetterId || null,
                salary: data.salary || null,
                remarks: data.remarks || null,
            });
        } catch (error) {
            console.error('Error updating job application:', error);
            throw error; // This will be caught by the form's error handling
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[200px]">Loading job application...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error loading job application: {error.message}</div>;
    }

    if (!job) {
        return <div className="p-4">Job application not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
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

            {job && (
                <CreateUpdateJob
                    initialData={job}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    isEditMode={true}
                />
            )}
        </div>
    );
}
