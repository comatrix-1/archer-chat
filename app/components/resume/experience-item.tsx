import { Checkbox } from "@radix-ui/react-checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { memo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form"
import { useResumeStore } from "~/states/resumeStore";
import { MonthYearPicker } from "@/components/month-year-picker";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SortableItem } from "@/components/ui/sortable-item";
import { z } from "zod";
import DetailCard from "./detail-card";

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
    description: z.array(z.string()).transform(arr => arr.filter(Boolean)),
});

const experienceSchema = z.object({
    experiences: z.array(experienceItemSchema),
});

type TExperienceItem = z.infer<typeof experienceSchema>;

interface ExperienceItemProps {
    field: TExperienceItem["experiences"][number];
    index: number;
    control: Control<TExperienceItem>;
    setValue: UseFormSetValue<TExperienceItem>;
    removeExperience: () => void;
}

const ExperienceItem: React.FC<ExperienceItemProps> = memo(({
    field,
    index,
    control,
    setValue,
    removeExperience,
}) => {
    const startDateValue = useWatch({
        control,
        name: `experiences.${index}.startDate`,
    }) ?? new Date();
    const endDateValue = useWatch({
        control,
        name: `experiences.${index}.endDate`,
    }) ?? null;

    const handleDateSelect = (date: Date | null, fieldName: 'startDate' | 'endDate', index: number) => {
        if (date) {
            date.setHours(0, 0, 0, 0);
        }
        setValue(`experiences.${index}.${fieldName}`, date, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <SortableItem
            id={field.id}
            onRemove={removeExperience} // TODO: implement function
            className="mb-4"
            dragHandleAriaLabel="Drag to reorder experience"
            removeButtonAriaLabel="Remove experience"
        >
            {/* <DetailCard
                key={field.id}
                id={field.id}
                index={index}
                title={field.title}
                onDelete={removeExperience}
        > */}
            <FormField
                control={control}
                name={`experiences.${index}.title`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Job title" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`experiences.${index}.employmentType`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
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
                control={control}
                name={`experiences.${index}.company`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                            <Input placeholder="Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex gap-2">
                <FormField
                    control={control}
                    name={`experiences.${index}.location`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
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
                    control={control}
                    name={`experiences.${index}.locationType`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Location Type</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
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
                    <MonthYearPicker
                        date={startDateValue}
                        onSelect={(date: Date | null) => handleDateSelect(date, 'startDate', index)}
                    />
                    { /* Add space here */}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <FormLabel>End Date</FormLabel>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`present-${index}`}
                                checked={endDateValue === null}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setValue(`experiences.${index}.endDate`, null, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    } else {
                                        setValue(`experiences.${index}.endDate`, new Date(), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }
                                }}
                            />
                            <label
                                htmlFor={`present-${index}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Present
                            </label>
                        </div>
                    </div>
                    {endDateValue !== null && (
                        <MonthYearPicker
                            date={endDateValue}
                            onSelect={(date: Date | null) => {
                                const newDate = date ? new Date(date) : null;
                                if (newDate) {
                                    newDate.setHours(0, 0, 0, 0);
                                }
                                setValue(`experiences.${index}.endDate`, newDate, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                });
                            }}
                        />
                    )}
                    { }
                </div>
            </div>
            {/* TODO: re-enable description field  */}
            {/* <FormField
            control={control}
            name={`experiences.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  { }
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
            {/* </DetailCard> */}
        </SortableItem>
    );
},
);

ExperienceItem.displayName = "ExperienceItem";
export default ExperienceItem;