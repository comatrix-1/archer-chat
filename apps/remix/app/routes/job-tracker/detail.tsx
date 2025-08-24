import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ArrowLeft, FileText } from 'lucide-react';
import { createPageUrl } from '~/utils/create-page-url';
import { useJobApplication } from '~/hooks/useJobApplications';
import { useAuth } from '../../contexts/AuthContext'

type Status = {
    id: string;
    name: string;
    color: string;
};

type JobApplication = {
    id?: string;
    companyName: string;
    jobTitle: string;
    status: string;
    jobLink?: string | null;
    resumeId?: string | null;
    coverLetterId?: string | null;
    salary?: string | null;
    remarks?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export default function JobDetailPage() {
    console.log('JobDetailPage()')
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: job, isLoading, error } = useJobApplication(id || '', user?.id || '');

    const statuses = [
        { id: 'APPLIED', name: 'Applied', color: 'bg-blue-500' },
        { id: 'SCREENING', name: 'Screening', color: 'bg-yellow-500' },
        { id: 'INTERVIEW', name: 'Interview', color: 'bg-purple-500' },
        { id: 'OFFER', name: 'Offer', color: 'bg-green-500' },
        { id: 'REJECTED', name: 'Rejected', color: 'bg-red-500' },
        { id: 'CLOSED', name: 'Closed', color: 'bg-gray-500' },
    ] as const;

    const defaultStatus = statuses[0];

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[200px]">Loading job application...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error loading job application: {error.message}</div>;
    }

    if (!job) {
        return <div className="p-4">Job application not found</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // TODO: Implement update functionality using trpc.jobApplication.update.mutate
            console.log('Updating job application:', job);
        } catch (error) {
            console.error('Error updating job application:', error);
        }
    };

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

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                defaultValue={job.companyName}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                name="jobTitle"
                                defaultValue={job.jobTitle}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={job?.status || 'APPLIED'}
                                onValueChange={(value) => {
                                    // Handle status change
                                    const newStatus = statuses.find(s => s.id === value) || defaultStatus;
                                    // TODO: Update job status
                                    console.log('Status changed to:', newStatus);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.id} value={status.id}>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${status.color}`} />
                                                {status.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salary">Salary</Label>
                            <Input
                                id="salary"
                                name="salary"
                                defaultValue={job?.salary || ''}
                                placeholder="e.g. $100,000 - $120,000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="resume"
                                    value={job?.resumeId || ''}
                                    placeholder="Resume file name"
                                    disabled
                                />
                                {job?.resumeId && (
                                    <a
                                        href={`/api/files/${job.resumeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline mt-1 block"
                                    >
                                        View Resume
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverLetter">Cover Letter</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="coverLetter"
                                    value={job?.coverLetterId || ''}
                                    placeholder="Cover letter file name"
                                    disabled
                                />
                                {job?.coverLetterId && (
                                    <a
                                        href={`/api/files/${job.coverLetterId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline mt-1 block"
                                    >
                                        View Cover Letter
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobLink">Job Posting URL</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="jobLink"
                                    type="url"
                                    value={job?.jobLink || ''}
                                    placeholder="https://example.com/job/123"
                                />
                                {job?.jobLink && (
                                    <a
                                        href={job.jobLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline mt-1 block"
                                    >
                                        View Job Posting
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            name="remarks"
                            defaultValue={job?.remarks || ''}
                            placeholder="Add any additional notes or remarks"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
