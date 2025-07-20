import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { ResumeFormData } from '@/types/resume';
import { Textarea } from '@/components/ui/textarea';

export function Summary() {
  const form = useFormContext<ResumeFormData>()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter>
        <Button type="submit">Save Summary</Button>
      </CardFooter>
    </Card>
  );
}