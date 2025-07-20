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
        <div className="space-y-4">
            <FormField
                control={form.control}
                name={`educations.${index}.school`}
                render={({ field: formField }) => (
                    <FormItem>
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
                    <FormItem>
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
                    <FormItem>
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                            <Input placeholder="Field of study" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex gap-2">
                <div className="flex-1">
                    <FormLabel>Start Date</FormLabel>
                    <DatePicker selectedDate={startDateValue ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'startDate', index)} />
                </div>
                <div className="flex-1">
                    <FormLabel>End Date</FormLabel>
                    <DatePicker selectedDate={endDateValue ?? undefined} onSelect={(date: Date | undefined) => handleDateSelect(date, 'endDate', index)} />
                </div>
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name={`educations.${index}.location`}
                        render={({ field: formField }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Location" {...formField} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-1 gap-2">
                    <div>
                        <FormField
                            control={form.control}
                            name={`educations.${index}.gpa`}
                            render={({ field: formField }) => (
                                <FormItem>
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
                    </div>
                    <div>
                        <FormField
                            control={form.control}
                            name={`educations.${index}.gpaMax`}
                            render={({ field: formField }) => (
                                <FormItem>
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
                    </div>
                </div>
            </div>
            <div className="flex flex-1 gap-2">
                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name={`educations.${index}.description`}
                        render={({ field: formField }) => (
                            <FormItem>
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
            </div>
        </div>
    );
}