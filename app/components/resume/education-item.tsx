"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext, useWatch } from "react-hook-form";
import type { ResumeFormData } from "~/types/resume";
import { RichTextEditor } from "../rich-text-editor";
import { DatePicker } from "../ui/date-picker";

interface EducationItemProps {
    index: number;
}

export function EducationItem({ index }: Readonly<EducationItemProps>) {
    const form = useFormContext<ResumeFormData>();

    const startDateValue = useWatch({
        control: form.control,
        name: `educations.${index}.startDate`,
    }) ?? new Date();
    const endDateValue = useWatch({
        control: form.control,
        name: `educations.${index}.endDate`,
    }) ?? null;

    const handleDateSelect = (date: Date | undefined, fieldName: 'startDate' | 'endDate', index: number) => {
        if (date) {
            date.setHours(0, 0, 0, 0);
        }
        form.setValue(`educations.${index}.${fieldName}`, date, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormField
                control={form.control}
                name={`educations.${index}.school`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-4">
                        <FormLabel>School</FormLabel>
                        <FormControl>
                            <Input placeholder="School name" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`educations.${index}.degree`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Degree</FormLabel>
                        <FormControl>
                            <Input placeholder="Degree" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`educations.${index}.fieldOfStudy`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                            <Input placeholder="Field of study" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`educations.${index}.startDate`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Start Date</FormLabel>
                        <DatePicker selectedDate={startDateValue ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'startDate', index)} isClearable={false} />
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`educations.${index}.endDate`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>End Date</FormLabel>
                        <DatePicker selectedDate={endDateValue ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'endDate', index)} isClearable={true} />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`educations.${index}.location`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                            <Input placeholder="Location" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`educations.${index}.gpa`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-1">
                        <FormLabel>GPA</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="GPA"
                                step={0.1}
                                {...formField}
                                onChange={(e) =>
                                    formField.onChange(
                                        e.target.value === ""
                                            ? undefined
                                            : Number(e.target.value)
                                    )
                                }
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name={`educations.${index}.gpaMax`}
                render={({ field: formField }) => (
                    <FormField
                        control={form.control}
                        name={`educations.${index}.gpaMax`}
                        render={({ field: formField }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Maximum GPA</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Max GPA"
                                        {...formField}
                                        onChange={(e) =>
                                            formField.onChange(
                                                e.target.value === ""
                                                    ? undefined
                                                    : Number(e.target.value)
                                            )
                                        }
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            />

            <FormField
                control={form.control}
                name={`educations.${index}.description`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <RichTextEditor
                                content={formField.value}
                                onChange={formField.onChange}
                                placeholder="Additional details about your education (e.g., courses, activities, thesis)..."
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </div>
    );
}