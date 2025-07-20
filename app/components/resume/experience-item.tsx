import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import type { ResumeFormData } from "~/types/resume";
import { RichTextEditor } from "../rich-text-editor";
import { DatePicker } from "../ui/date-picker";
import { Label } from "../ui/label";

export enum EEmploymentType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    SELF_EMPLOYED = 'SELF_EMPLOYED',
    FREELANCE = 'FREELANCE',
    CONTRACT = 'CONTRACT',
    INTERNSHIP = 'INTERNSHIP',
    APPRENTICESHIP = 'APPRENTICESHIP',
    SEASONAL = 'SEASONAL',
}

export enum ELocationType {
    ON_SITE = 'ON_SITE',
    HYBRID = 'HYBRID',
    REMOTE = 'REMOTE',
}

const experienceItemSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Job title is required'),
    employmentType: z.nativeEnum(EEmploymentType),
    locationType: z.nativeEnum(ELocationType),
    company: z.string().min(1, 'Company is required'),
    location: z.string(),
    startDate: z.date(),
    endDate: z.date().nullable().optional(),
    description: z.string(),
});

const experienceSchema = z.object({
    experiences: z.array(experienceItemSchema),
});

type TExperienceItem = z.infer<typeof experienceSchema>;

interface ExperienceItemProps {
    index: number;
}

const ExperienceItem: React.FC<ExperienceItemProps> = memo(({
    index,
}) => {
    const form = useFormContext<ResumeFormData>();

    const startDateValue = useWatch({
        control: form.control,
        name: `experiences.${index}.startDate`,
    }) ?? new Date();
    const endDateValue = useWatch({
        control: form.control,
        name: `experiences.${index}.endDate`,
    }) ?? null;

    const handleDateSelect = (date: Date | undefined, fieldName: 'startDate' | 'endDate', index: number) => {
        if (date) {
            date.setHours(0, 0, 0, 0);
        }
        form.setValue(`experiences.${index}.${fieldName}`, date, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <>
            <div className="flex gap-2">
                <FormField
                    control={form.control}
                    name={`experiences.${index}.title`}
                    render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col h-full">
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Job title" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


            </div>

            <div className="flex gap-2">
                <FormField
                    control={form.control}
                    name={`experiences.${index}.company`}
                    render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col h-full">
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                                <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`experiences.${index}.employmentType`}
                    render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col h-full">
                            <FormLabel>Employment Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select employment type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(EEmploymentType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace("_", " ").charAt(0).toUpperCase() +
                                                type.replace("_", " ").slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>



            <div className="flex gap-2">
                <FormField
                    control={form.control}
                    name={`experiences.${index}.location`}
                    render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col h-full">
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Johor Bahru, Malaysia"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`experiences.${index}.locationType`}
                    render={({ field }) => (
                        <FormItem className="flex-1 flex flex-col h-full">
                            <FormLabel>Location Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select location type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.values(ELocationType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace("_", " ").charAt(0).toUpperCase() +
                                                type.replace("_", " ").slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <FormLabel>Start Date</FormLabel>
                    <DatePicker selectedDate={startDateValue ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'startDate', index)} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <FormLabel>End Date</FormLabel>

                    </div>

                    <DatePicker selectedDate={endDateValue ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'endDate', index)} disabled={endDateValue === null} />

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`present-${index}`}
                            checked={endDateValue === null}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    form.setValue(`experiences.${index}.endDate`, null, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    });
                                } else {
                                    form.setValue(`experiences.${index}.endDate`, new Date(), {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    });
                                }
                            }}
                        />
                        <Label
                            htmlFor={`present-${index}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I still work here
                        </Label>
                    </div>
                </div>
            </div>

            <FormField
                control={form.control}
                name={`experiences.${index}.description`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <RichTextEditor
                                content={field.value}
                                onChange={field.onChange}
                                placeholder="Describe your responsibilities and achievements..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
},
);

ExperienceItem.displayName = "ExperienceItem";
export default ExperienceItem;