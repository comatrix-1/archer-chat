import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useResumeStore } from '../../states/resumeStore';

const summarySchema = z.object({
  summary: z.string().min(50, 'Summary should be at least 50 characters'),
});

type SummaryFormValues = z.infer<typeof summarySchema>;

export function Summary() {
  const summary = useResumeStore((state) => state.resume.summary);
  const updateSummary = useResumeStore((state) => state.updateSummary);

  const { register, handleSubmit, formState: { errors } } = useForm<SummaryFormValues>({
    resolver: zodResolver(summarySchema),
    defaultValues: { summary: summary },
  });

  const onSubmit = (data: SummaryFormValues) => {
    updateSummary(data.summary);
    console.log("Summary Updated:", data.summary);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="summary-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                className="min-h-[200px]"
                {...register('summary')}
                placeholder="Write a compelling summary of your professional experience and skills."
              />
              {errors.summary && <p className="text-red-500 text-sm">{errors.summary.message}</p>}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="summary-form">Save Summary</Button>
      </CardFooter>
    </Card>
  );
}