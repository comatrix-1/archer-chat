import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@project/remix/app/components/ui/form";
import { Input } from "@project/remix/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@project/remix/app/components/ui/select";
import { EEmploymentType, ELocationType } from "@project/remix/app/types/resume";
import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { RichTextEditor } from "../rich-text-editor";
import { DatePicker } from "../ui/date-picker";
import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";

interface ExperienceItemProps {
    index: number;
}

const ExperienceItem: React.FC<ExperienceItemProps> = memo(({
    index,
}) => {
    const form = useFormContext<ZResumeWithRelations>();

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name={`experiences.${index}.title`}
                render={({ field }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Job title" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`experiences.${index}.company`}
                render={({ field }) => (
                    <FormItem className="col-span-1">
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
                    <FormItem className="col-span-1">
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

            <FormField
                control={form.control}
                name={`experiences.${index}.location`}
                render={({ field }) => (
                    <FormItem className="col-span-1">
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
                    <FormItem className="col-span-1">
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

            <FormField
                control={form.control}
                name={`experiences.${index}.startDate`}
                render={({ field }) => (
                    <FormItem className="col-span-1">
                        <FormLabel>Start Date</FormLabel>
                        <DatePicker selectedDate={startDateValue ? new Date(startDateValue) : undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'startDate', index)} isClearable={false} />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`experiences.${index}.endDate`}
                render={({ field }) => (
                    <FormItem className="col-span-1">
                        <FormLabel>End Date</FormLabel>
                        <DatePicker selectedDate={endDateValue ? new Date(endDateValue) : undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'endDate', index)} isClearable={true} />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`experiences.${index}.description`}
                render={({ field }) => (
                    <FormItem className='col-span-2'>
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
        </div>
    );
},
);

ExperienceItem.displayName = "ExperienceItem";
export default ExperienceItem;