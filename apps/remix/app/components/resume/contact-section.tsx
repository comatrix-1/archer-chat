import { Input } from "@project/remix/app/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { ResumeFormData } from "@project/remix/app/types/resume";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@project/remix/app/components/ui/form";
import { SectionCard } from "@project/remix/app/components/resume/section-card";
import { Textarea } from "../ui/textarea";

export const BasicsSection = () => {
  const form = useFormContext<ResumeFormData>();

  return (
    <SectionCard
      title="Basic Information"
      description="Add your basic information."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="summary"
          render={({ field: formField }) => (
            <FormItem className="md:col-span-2">
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

        <FormField
          control={form.control}
          name="contact.fullName"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Full name" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.email"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.city"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.country"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Country" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.phone"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.address"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Address" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.linkedin"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Linkedin</FormLabel>
              <FormControl>
                <Input placeholder="Linkedin" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.github"
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>GitHub</FormLabel>
              <FormControl>
                <Input placeholder="GitHub" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact.portfolio"
          render={({ field: formField }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Portfolio</FormLabel>
              <FormControl>
                <Input placeholder="Portfolio" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </SectionCard>
  );
};
