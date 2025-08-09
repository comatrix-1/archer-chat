import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { JobTrackerTable } from './job-tracker-table';
import { JobTrackerDashboard } from './job-tracker-dashboard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useJobApplications } from '~/contexts/job-applications-context';

const statuses = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
    { id: 'screening', name: 'Screening', color: 'bg-yellow-500' },
    { id: 'interview', name: 'Interview', color: 'bg-purple-500' },
    { id: 'offer', name: 'Offer', color: 'bg-green-500' },
    { id: 'closed', name: 'Closed', color: 'bg-gray-500' },
];

export function JobTracker() {
    const { jobs } = useJobApplications();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && job.status.id === activeTab;
    });

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
                    <p className="text-muted-foreground">
                        Track your job applications and their status
                    </p>
                </div>
                <Button onClick={() => navigate('/job-tracker/add')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Application
                </Button>
            </div>

            {/* Dashboard */}
            <JobTrackerDashboard jobs={jobs} />

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Applications</CardTitle>
                            <CardDescription>
                                {filteredJobs.length} {filteredJobs.length === 1 ? 'application' : 'applications'} found
                            </CardDescription>
                        </div>
                        <div className="w-full md:w-64">
                            <Input
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                        >
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="applied">Applied</TabsTrigger>
                                <TabsTrigger value="screening">Screening</TabsTrigger>
                                <TabsTrigger value="interview">Interview</TabsTrigger>
                                <TabsTrigger value="offer">Offer</TabsTrigger>
                                <TabsTrigger value="closed">Closed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    <JobTrackerTable jobs={filteredJobs} />
                </CardContent>
            </Card>
        </div>
    );
}