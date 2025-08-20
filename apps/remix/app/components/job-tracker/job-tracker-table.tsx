'use client';

import { ExternalLink, MoreHorizontal, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
// Import table components from shadcn/ui
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';
import { useState, useMemo } from 'react';
import type { JobApplication } from '~/types';

type SortConfig = {
    key: keyof JobApplication | null;
    direction: 'asc' | 'desc' | null;
};

export interface JobTrackerTableProps {
    jobs: JobApplication[];
}

export function JobTrackerTable({ jobs }: JobTrackerTableProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

    const sortedJobs = useMemo(() => {
        const sortableItems = [...jobs];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                // Handle status sorting separately
                if (sortConfig.key === 'status') {
                    const statusA = a.status.name.toLowerCase();
                    const statusB = b.status.name.toLowerCase();

                    if (statusA < statusB) {
                        return sortConfig.direction === 'asc' ? -1 : 1;
                    }
                    if (statusA > statusB) {
                        return sortConfig.direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                }

                // Handle other fields
                const aValue = a[sortConfig.key as keyof JobApplication];
                const bValue = b[sortConfig.key as keyof JobApplication];

                if (aValue === bValue) return 0;

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }

                return 0;
            });
        }
        return sortableItems;
    }, [jobs, sortConfig]);

    const requestSort = (key: keyof JobApplication) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            return setSortConfig({ key: null, direction: null });
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof JobApplication) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100" />;
        if (sortConfig.direction === 'asc') return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />;
    };

    return (
        <div className="rounded-md border min-h-[30vh]">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => requestSort('companyName')}
                        >
                            <div className="flex items-center group">
                                Company
                                {getSortIcon('companyName')}
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => requestSort('jobTitle')}
                        >
                            <div className="flex items-center group">
                                Job Title
                                {getSortIcon('jobTitle')}
                            </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Cover Letter</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedJobs.map((job) => (
                        <TableRow
                            key={job.id}
                            className="hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                                window.location.href = `/job-tracker/detail?id=${job.id}`;
                            }}
                        >
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={`https://logo.clearbit.com/${job.companyName.toLowerCase().replace(/\s+/g, '')}.com`}
                                            alt={job.companyName}
                                        />
                                        <AvatarFallback>{job.companyName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{job.companyName}</span>
                                </div>
                            </TableCell>
                            <TableCell>{job.jobTitle}</TableCell>
                            <TableCell>
                                <Badge className={`${job.status.color} text-white`}>
                                    {job.status.name}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {job.resume ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/documents/${job.resume}`, '_blank');
                                        }}
                                    >
                                        View
                                    </Button>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {job.coverLetter ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/documents/${job.coverLetter}`, '_blank');
                                        }}
                                    >
                                        View
                                    </Button>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                <Link to={`/job-tracker/detail?id=${job.id}`} className="flex items-center w-full">
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit Details</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this job application?')) {
                                                        console.log('Delete job application:', job.id);
                                                        // In a real app, you would call your delete API here
                                                    }
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(job.jobLink, '_blank');
                                                }}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                <span>View Posting</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default JobTrackerTable;