'use client'

import React, { memo } from 'react'; // Import memo
import { useWatch, type Control, type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button'; // Keep Button import
import { Textarea } from '~/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import type { Experience } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { NO_ITEMS_DESCRIPTION } from '~/lib/constants';
import { MonthYearPicker } from '~/components/month-year-picker'; // Import MonthYearPicker
import { Checkbox } from '~/components/ui/checkbox'; // Import Checkbox
import { RichTextEditor } from '../rich-text-editor'; // Import RichTextEditor

// Define a more specific type for the form data if possible, otherwise use a generic
// type FormData = { experiences: Omit<Experience, "resumeId" | "createdAt" | "updatedAt">[] };

interface ExperienceSectionProps {
    experienceSectionFields: Omit<Experience, "resumeId" | "createdAt" | "updatedAt">[];
    control: Control<any>; // Use Control type
    removeExperience: (index: number) => void;
    setValue: UseFormSetValue<any>; // Use UseFormSetValue type
    getValues: UseFormGetValues<any>; // Use UseFormGetValues type
}

interface ExperienceItemProps {
    fieldId: string; // Pass the unique ID for the key prop
    index: number;
    control: Control<any>;
    removeExperience: (index: number) => void;
    setValue: UseFormSetValue<any>;
    getValues: UseFormGetValues<any>;
}

// Create a separate component for each experience item
const ExperienceItem: React.FC<ExperienceItemProps> = memo(({ fieldId, index, control, getValues, setValue, removeExperience }) => {
    // Watch the end date value for reactivity - Now called at the top level of ExperienceItem
    const endDateValue = useWatch({
        control,
        name: `experiences.${index}.endDate`
    });
    const isPresent = endDateValue === null;

    return (
        <div key={fieldId} className="space-y-4 border p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-4 flex-1">
                    <FormField
                        control={control}
                        name={`experiences.${index}.title`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Job title" {...field} />
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
                                <FormControl>
                                    <Input placeholder="e.g. Full-time, Part-time, Contract" {...field} />
                                </FormControl>
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
                                        <Input placeholder="e.g. Johor Bahru, Malaysia" {...field} />
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
                                    <FormControl>
                                        <Input placeholder="e.g. On-site, Remote, Hybrid" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <FormLabel>Start Date</FormLabel>
                            <MonthYearPicker
                                date={getValues(`experiences.${index}.startDate`)}
                                onSelect={(date) => {
                                    const newDate = date ? new Date(date) : null;
                                    if (newDate) {
                                        newDate.setHours(0, 0, 0, 0);
                                    }
                                    setValue(`experiences.${index}.startDate`, newDate, { shouldValidate: true, shouldDirty: true });
                                }}
                            />
                            {/* We might need a FormMessage here if validation is added */}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <FormLabel>End Date</FormLabel>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`present-${index}`}
                                        checked={isPresent}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setValue(`experiences.${index}.endDate`, null, { shouldValidate: true, shouldDirty: true });
                                            } else {
                                                // Set a default date or leave null for user to pick
                                                setValue(`experiences.${index}.endDate`, new Date(), { shouldValidate: true, shouldDirty: true });
                                            }
                                        }}
                                    />
                                    <label htmlFor={`present-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Present
                                    </label>
                                </div>
                            </div>
                            {!isPresent && (
                                <MonthYearPicker
                                    date={endDateValue} // Use watched value
                                    onSelect={(date) => {
                                        const newDate = date ? new Date(date) : null;
                                        if (newDate) {
                                            newDate.setHours(0, 0, 0, 0);
                                        }
                                        setValue(`experiences.${index}.endDate`, newDate, { shouldValidate: true, shouldDirty: true });
                                    }}
                                />
                            )}
                            {/* We might need a FormMessage here if validation is added */}
                        </div>
                    </div>
                    <FormField
                        control={control}
                        name={`experiences.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    {/* Replace Textarea with RichTextEditor */}
                                    <RichTextEditor
                                        content={field.value}
                                        onChange={field.onChange} // Pass the onChange handler from RHF
                                        placeholder="Describe your responsibilities and achievements..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* Keep remove button separate if needed, or integrate */}
            </div>
            <Button type="button" variant="destructive" onClick={() => removeExperience(index)}>
                <Trash2 size={16} />
            </Button>
        </div>
    );
});
ExperienceItem.displayName = 'ExperienceItem'; // Add display name for better debugging

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experienceSectionFields: experienceFields, control, getValues, setValue, removeExperience }) => {
    if (!experienceFields || experienceFields.length === 0) {
        return <p>{NO_ITEMS_DESCRIPTION}</p>;
    }
    return (
        <div className="space-y-4">
            {experienceFields.map((field, index) => {
                return (
                    // Render the new ExperienceItem component
                    <ExperienceItem
                        key={field.id} // Use field.id from useFieldArray for stable keys
                        fieldId={field.id}
                        index={index}
                        control={control}
                        getValues={getValues}
                        setValue={setValue}
                        removeExperience={removeExperience}
                    />
                )
            })}
        </div>
    );
};

export default ExperienceSection;