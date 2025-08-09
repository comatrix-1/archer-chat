'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
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
import { useJobApplications } from '~/contexts/job-applications-context';
import { useResumes } from '~/contexts/resume-context';

const statuses = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-500' },
  { id: 'interview', name: 'Interview', color: 'bg-purple-500' },
  { id: 'offer', name: 'Offer', color: 'bg-green-500' },
  { id: 'closed', name: 'Closed', color: 'bg-gray-500' },
];

type JobFormData = {
  companyName: string;
  jobTitle: string;
  status: string;
  jobLink: string;
  resume: string;
  resumeId?: string; // Added to store the resume ID
  coverLetter: string;
  salary: string;
  jobDescription: string;
  remarks: string;
};

export function AddJobForm() {
  const navigate = useNavigate();
  const { addJob } = useJobApplications();
  const [formData, setFormData] = useState<JobFormData>({
    companyName: '',
    jobTitle: '',
    status: 'applied',
    jobLink: '',
    resume: '',
    resumeId: '',
    coverLetter: '',
    salary: '',
    jobDescription: '',
    remarks: '',
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  
  // Get resumes from the ResumeContext
  const { resumes, isLoading: isLoadingResumes } = useResumes();
  
  // Format resumes for the combobox
  const resumeOptions = useMemo(() => {
    return [
      { value: '', label: 'Select a resume...' },
      ...resumes.map(resume => ({
        value: resume.id,
        label: resume.name,
      })),
    ];
  }, [resumes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value,
    }));
  };

  const handleResumeSelect = (value: string) => {
    const selectedResume = resumes.find(r => r.id === value);
    setFormData(prev => ({
      ...prev,
      resume: selectedResume ? selectedResume.name : '',
      // Store the resume ID if needed for future reference
      resumeId: value,
    }));
  };

  const handleCoverLetterSelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      coverLetter: value,
    }));
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setFormData(prev => ({
        ...prev,
        resume: file.name,
      }));
    }
  };

  const handleCoverLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverLetterFile(file);
      setFormData(prev => ({
        ...prev,
        coverLetter: file.name,
      }));
    }
  };

  const generateResume = () => {
    // TODO: write function
  }

  const generateCoverLetter = () => {
    // TODO: write function
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the selected status object
    const selectedStatus = statuses.find(s => s.id === formData.status) || statuses[0];
    
    // Add the new job application
    addJob({
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      status: selectedStatus,
      jobLink: formData.jobLink,
      resume: formData.resume || null,
      resumeId: formData.resumeId || null, // Include the resume ID
      coverLetter: formData.coverLetter || null,
      salary: formData.salary,
      remarks: formData.remarks,
    });
    
    // Navigate back to the job tracker
    navigate('/job-tracker');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Job Application</CardTitle>
          <CardDescription>
            Fill in the details of the job you're applying for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" className="w-full"/>
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
                <Label htmlFor="salary">Salary (optional)</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="text"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g. $100,000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobLink">Job Posting URL *</Label>
              <Input
                id="jobLink"
                name="jobLink"
                type="url"
                value={formData.jobLink}
                onChange={handleChange}
                placeholder="https://example.com/job/123"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Resume</Label>
                  {formData.resume && (
                    <span className="text-sm text-muted-foreground">
                      {formData.resume}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Combobox
                    list={resumeOptions}
                    value={formData.resumeId || ''}
                    onSelect={handleResumeSelect}
                  />
                  <div className="relative">
                    <Button
                      type="button"
                      onClick={generateResume}
                    >
                      <WandSparkles className="h-4 w-4" />
                      <span>Generate</span>
                    </Button>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={handleResumeFileChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cover Letter</Label>
                  {formData.coverLetter && (
                    <span className="text-sm text-muted-foreground">
                      {formData.coverLetter}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Combobox
                    list={[
                      { value: '', label: 'Select a cover letter...' }
                    ]}
                    value={formData.coverLetter}
                    onSelect={handleCoverLetterSelect}
                  />
                  <div className="relative">
                  <Button
                      type="button"
                      onClick={generateCoverLetter}
                    >
                      <WandSparkles className="h-4 w-4" />
                      <span>Generate</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job description (optional)</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this application..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Notes (optional)</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional notes about this application..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/job-tracker')}
              >
                Cancel
              </Button>
              <Button type="submit">Save Application</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
