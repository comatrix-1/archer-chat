import { useFormContext } from "react-hook-form";
import type { ResumeFormData } from "@project/remix/app/types/resume";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";

interface CertificationItemProps {
    index: number;
}

export const CertificationItem = ({ index }: CertificationItemProps) => {
    const form = useFormContext<ZResumeWithRelations>();

    const handleDateSelect = (date: Date | undefined, fieldName: 'issueDate' | 'expiryDate', index: number) => {
        if (date) {
            date.setHours(0, 0, 0, 0);
        }
        form.setValue(`certifications.${index}.${fieldName}`, date, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
                control={form.control}
                name={`certifications.${index}.name`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Certification Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., AWS Certified Solutions Architect" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`certifications.${index}.issuer`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Issuing Organization</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Amazon Web Services" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`certifications.${index}.issueDate`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                            <DatePicker selectedDate={field.value ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'issueDate', index)} isClearable={false} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`certifications.${index}.expiryDate`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expiration Date (if applicable)</FormLabel>
                        <FormControl>
                            <DatePicker selectedDate={field.value ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'expiryDate', index)} isClearable={true} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`certifications.${index}.credentialId`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Credential ID (if applicable)</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., ABC123"
                                {...field}
                                value={field.value ?? ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`certifications.${index}.credentialUrl`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Credential URL (if available)</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="https://example.com/credential/123"
                                type="url"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}