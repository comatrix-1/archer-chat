import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

export interface ResumeItem {
  id: string;
  title: string;
  jobDescription: string;
  resume: string;
  coverLetter: string;
}

export default function ResumeGenerator() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [adding, setAdding] = useState(false);
  const form = useForm<{ title: string; jobDescription: string }>();

  const onSubmit = async (data: { title: string; jobDescription: string }) => {
    const res = await fetchWithAuth('/api/resume/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.data;
    setResumes((prev) => [
      { id: Date.now().toString(), title: data.title, jobDescription: data.jobDescription, resume: result.resume, coverLetter: result.coverLetter },
      ...prev,
    ]);
    setAdding(false);
    form.reset();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Resume Generator</h1>
        <Button onClick={() => setAdding(true)}>Add New</Button>
      </div>
      {adding && (
        <Form {...form}>
          <a onClick={() => console.log(form.getValues())}>check form</a>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded shadow mb-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title (e.g. Software Engineer at Meta)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste the job description here" rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>Generate</Button>
              <Button type="button" variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        </Form>
      )}
      <div className="space-y-4">
        {resumes.length === 0 && <div className="text-gray-500">No resumes generated yet.</div>}
        {resumes.map((resume) => (
          <div key={resume.id} className="bg-white rounded shadow p-4">
            <div className="font-semibold text-lg mb-1">{resume.title}</div>
            <div className="mb-2 text-gray-600">{resume.jobDescription}</div>
            <div className="mb-2">
              <strong>Resume:</strong>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{resume.resume}</pre>
            </div>
            <div>
              <strong>Cover Letter:</strong>
              <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{resume.coverLetter}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
