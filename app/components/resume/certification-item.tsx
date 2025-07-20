import { useFormContext } from "react-hook-form";
import type { ResumeFormData } from "~/types/resume";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface CertificationItemProps {
    index: number;
}

export const CertificationItem = ({ index }: CertificationItemProps) => {
    const form = useFormContext<ResumeFormData>();

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
                            <Input
                                type="date"
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`certifications.${index}.expirationDate`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expiration Date (if applicable)</FormLabel>
                        <FormControl>
                            <Input
                                type="date"
                                value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
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
                            <Input placeholder="e.g., ABC123" {...field} />
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