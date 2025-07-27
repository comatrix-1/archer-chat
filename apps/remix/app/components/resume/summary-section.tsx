import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@project/remix/app/components/ui/form';
import { Textarea } from '@project/remix/app/components/ui/textarea';
import type { ResumeFormData } from '@project/remix/app/types/resume';
import { useFormContext } from 'react-hook-form';
import { SectionCard } from './section-card';

export function SummarySection() {
  const form = useFormContext<ResumeFormData>()

  return (
    <SectionCard title="Summary" description="Add a summary of your professional experience and skills.">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <FormField
            control={form.control}
            name="summary"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    id="summary"
                    className="min-h-[200px]"
                    {...formField}
                    placeholder="Write a compelling summary of your professional experience and skills."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </SectionCard>
  );
}