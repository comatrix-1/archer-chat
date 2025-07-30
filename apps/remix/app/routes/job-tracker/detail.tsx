import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ArrowLeft } from 'lucide-react';

type JobApplication = {
    id: string;
    companyName: string;
    jobTitle: string;
    status: {
        id: string;
        name: string;
        color: string;
    };
    jobLink: string;
    resume: string | null;
    coverLetter: string | null;
    salary: string;
    remarks: string;
};

// Mock data - in a real app, this would come from your database
const mockJobs: Record<string, JobApplication> = {
    '1': {
        id: '1',
        companyName: 'Example Company',
        jobTitle: 'Senior Software Engineer',
        status: {
            id: 'applied',
            name: 'Applied',
            color: 'bg-blue-500',
        },
        jobLink: 'https://example.com/job/123',
        resume: 'resume.pdf',
        coverLetter: 'cover-letter.pdf',
        salary: '$120,000 - $150,000',
        remarks: 'Great company culture and benefits package.'
    },
    // Add more mock jobs as needed
};

export default function JobDetailPage() {
    console.log('JobDetailPage()')
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id') || '1';
    const [job, setJob] = useState<JobApplication | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // In a real app, you would fetch the job by ID from your API
        const fetchJob = () => {
            const jobData = mockJobs[id] || {
                id,
                companyName: 'New Company',
                jobTitle: 'New Job',
                status: {
                    id: 'applied',
                    name: 'Applied',
                    color: 'bg-blue-500',
                },
                jobLink: '',
                resume: null,
                coverLetter: null,
                salary: '',
                remarks: ''
            };
            setJob(jobData);
        };

        fetchJob();
    }, [id]);

    if (!job) {
        return <div>Loading...</div>;
    }

    const statuses = [
        { id: 'applied', name: 'Applied' },
        { id: 'screening', name: 'Screening' },
        { id: 'interview', name: 'Interview' },
        { id: 'offer', name: 'Offer' },
        { id: 'closed', name: 'Closed' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job Tracker
            </Button>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-8">Job Application Details</h1>
                
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
                            <Select name="status" defaultValue={job.status.id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status.id} value={status.id}>
                                            {status.name}
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
                                defaultValue={job.salary}
                                placeholder="e.g. $100,000 - $120,000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume">Resume</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="resume"
                                    name="resume"
                                    defaultValue={job.resume || ''}
                                    placeholder="Resume file name"
                                />
                                {job.resume && (
                                    <a 
                                        href={`/resumes/${job.resume}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="coverLetter">Cover Letter</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="coverLetter"
                                    name="coverLetter"
                                    defaultValue={job.coverLetter || ''}
                                    placeholder="Cover letter file name"
                                />
                                {job.coverLetter && (
                                    <a 
                                        href={`/cover-letters/${job.coverLetter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobLink">Job Posting URL</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="jobLink"
                                    name="jobLink"
                                    type="url"
                                    defaultValue={job.jobLink}
                                    placeholder="https://example.com/job/123"
                                />
                                <a 
                                    href={job.jobLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                                >
                                    Open
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                            id="remarks"
                            name="remarks"
                            defaultValue={job.remarks}
                            placeholder="Any additional notes about this job application..."
                            rows={4}
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
