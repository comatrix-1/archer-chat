'use client'

import React from 'react';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import type { Education } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { MonthYearPicker } from '~/components/month-year-picker';
import { NO_ITEMS_DESCRIPTION } from '~/lib/constants';

interface EducationSectionProps {
    educationFields: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
    control: any;
    setValue: any;
    removeEducation: (index: number) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ educationFields, control, setValue, removeEducation }) => {
    console.log('EducationSection()')

    if (!educationFields || educationFields.length === 0) {
        return <p>{NO_ITEMS_DESCRIPTION}</p>;
    }
    return (
        <div className="space-y-4">
            {educationFields.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                    <FormField
                        control={control}
                        name={`educations.${index}.school`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>School</FormLabel>
                                <FormControl>
                                    <Input placeholder="School name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`educations.${index}.degree`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Degree</FormLabel>
                                <FormControl>
                                    <Input placeholder="Degree" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`educations.${index}.fieldOfStudy`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Field of Study</FormLabel>
                                <FormControl>
                                    <Input placeholder="Field of study" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <div className='flex-1'>
                            <FormLabel>Start Date</FormLabel>
                            <MonthYearPicker
                                date={field.startDate ?? null}
                                onSelect={(date) => {
                                    if (!date) return;
                                    const newDate = new Date(date);
                                    setValue(`educations.${index}.startDate`, newDate);
                                }}
                            />
                        </div>
                        <div className='flex-1'>
                            <FormLabel>End Date</FormLabel>
                            <MonthYearPicker
                                date={field.endDate ?? null}
                                onSelect={(date) => {
                                    if (!date) return;
                                    const newDate = new Date(date);
                                    newDate.setHours(0, 0, 0, 0);
                                    setValue(`educations.${index}.endDate`, newDate);
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className='flex-1'>
                            <FormField
                                control={control}
                                name={`educations.${index}.location`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-1 gap-2">
                            <div>
                                <FormField
                                    control={control}
                                    name={`educations.${index}.gpa`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GPA</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="GPA" step={0.1} {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <FormField
                                    control={control}
                                    name={`educations.${index}.gpaMax`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum GPA</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Max GPA" {...field} onChange={e => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 gap-2">
                        <div className='flex-1'>
                            <FormField
                                control={control}
                                name={`educations.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Additional details about your education" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeEducation(index)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default EducationSection;