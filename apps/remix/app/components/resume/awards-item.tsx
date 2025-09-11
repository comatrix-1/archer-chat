"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@project/remix/app/components/ui/form";
import { Input } from "@project/remix/app/components/ui/input";
import { useFormContext, useWatch } from "react-hook-form";
import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";
import { RichTextEditor } from "../rich-text-editor";
import { DatePicker } from "../ui/date-picker";

interface HonorsAwardsItemProps {
    index: number;
}

export function AwardsItem({ index }: Readonly<HonorsAwardsItemProps>) {
    const form = useFormContext<ZResumeWithRelations>();

    const dateValue = useWatch({
        control: form.control,
        name: `awards.${index}.date`,
    }) ?? new Date();

    const handleDateSelect = (date: Date | undefined, index: number) => {
        if (date) {
            date.setHours(0, 0, 0, 0);
        }
        form.setValue(`awards.${index}.date`, date, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormField
                control={form.control}
                name={`awards.${index}.title`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-4">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Best Project Award" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`awards.${index}.issuer`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Issuer</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. University of California" {...formField} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`awards.${index}.date`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-2">
                        <FormLabel>Date</FormLabel>
                        <DatePicker
                            selectedDate={dateValue ?? undefined}
                            onSelect={(date: Date | undefined) => handleDateSelect(date, index)}
                            isClearable={false}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name={`awards.${index}.description`}
                render={({ field: formField }) => (
                    <FormItem className="col-span-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <RichTextEditor
                                content={formField.value}
                                onChange={formField.onChange}
                                placeholder="Enter details about the award or honor"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
