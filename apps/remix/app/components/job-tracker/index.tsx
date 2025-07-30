import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { JobApplication } from './job-tracker-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { JobTrackerTable } from './job-tracker-table';
import { JobTrackerDashboard } from './job-tracker-dashboard';
import { Plus } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { useNavigate } from 'react-router';

const statuses = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
    { id: 'screening', name: 'Screening', color: 'bg-yellow-500' },
    { id: 'interview', name: 'Interview', color: 'bg-purple-500' },
    { id: 'offer', name: 'Offer', color: 'bg-green-500' },
    { id: 'closed', name: 'Closed', color: 'bg-gray-500' },
];

// Generate mock job applications
const generateMockJobs = (count = 10): JobApplication[] => {
    return Array.from({ length: count }).map(() => ({
        id: faker.string.uuid(),
        companyName: faker.company.name(),
        jobTitle: faker.person.jobTitle(),
        status: faker.helpers.arrayElement(statuses),
        jobLink: faker.internet.url(),
        resume: faker.helpers.arrayElement([
            'Resume_Senior_Dev_2023.pdf',
            'John_Doe_Resume.pdf',
            'Resume_Updated_2023.pdf',
            null
        ]),
        coverLetter: faker.helpers.arrayElement([
            'Cover_Letter_Google_2023.pdf',
            'John_Doe_Cover_Letter.pdf',
            null
        ]),
        salary: `$${faker.number.int({ min: 50000, max: 200000 }).toLocaleString()}`,
        remarks: faker.lorem.sentence(),
        createdAt: faker.date.recent({ days: 30 }),
        updatedAt: faker.date.recent({ days: 7 })
    }));
};

const jobs = generateMockJobs(10);

// Mock data - in a real app, this would come from your API or state management
export function JobTracker() {
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
                <p className="text-muted-foreground">
                    Track your job applications and their status
                </p>
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

                        <Button
                            onClick={() => navigate('/job-tracker/add')}>
                            Add
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <JobTrackerTable jobs={filteredJobs} />
                </CardContent>
            </Card>
        </div>
    );
}