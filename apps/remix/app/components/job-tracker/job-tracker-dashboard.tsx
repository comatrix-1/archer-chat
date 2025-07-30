import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Badge } from '~/components/ui/badge';

// Define the job type for better type safety
type Job = {
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

type StatusCounts = {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    closed: number;
};

type DashboardStats = {
    total: number;
    active: number;
    statusCounts: StatusCounts;
    interviewRate: number;
    offerRate: number;
};

export function JobTrackerDashboard({ jobs }: Readonly<{ jobs: Job[] }>) {
    console.log('JobTrackerDashboard()')
    // Calculate stats from jobs data
    const stats: DashboardStats = jobs.reduce(
        (acc, job) => {
            const status = job.status?.id || 'applied';
            const isActive = status !== 'closed' && status !== 'rejected';
            
            return {
                total: acc.total + 1,
                active: isActive ? acc.active + 1 : acc.active,
                statusCounts: {
                    ...acc.statusCounts,
                    [status]: (acc.statusCounts[status as keyof StatusCounts] || 0) + 1,
                },
                interviewRate: status === 'interview' ? acc.interviewRate + 1 : acc.interviewRate,
                offerRate: status === 'offer' ? acc.offerRate + 1 : acc.offerRate,
            };
        },
        {
            total: 0,
            active: 0,
            statusCounts: {
                applied: 0,
                screening: 0,
                interview: 0,
                offer: 0,
                closed: 0,
            },
            interviewRate: 0,
            offerRate: 0,
        }
    );

    // Calculate percentages
    const interviewPercentage = stats.total > 0 ? Math.round((stats.interviewRate / stats.total) * 100) : 0;
    const offerPercentage = stats.total > 0 ? Math.round((stats.offerRate / stats.total) * 100) : 0;

    const statusColors = {
        applied: 'bg-blue-500',
        screening: 'bg-yellow-500',
        interview: 'bg-purple-500',
        offer: 'bg-green-500',
        closed: 'bg-gray-500',
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active} active applications
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interview Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{interviewPercentage}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.interviewRate} out of {stats.total} applications
                        </p>
                        <Progress value={interviewPercentage} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{offerPercentage}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.offerRate} out of {stats.total} applications
                        </p>
                        <Progress value={offerPercentage} className="h-2 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.statusCounts).map(([status, count]) => (
                                count > 0 && (
                                    <Badge 
                                        key={status}
                                        className={`${statusColors[status as keyof typeof statusColors]} text-white`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                                    </Badge>
                                )
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
