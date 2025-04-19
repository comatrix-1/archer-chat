'use client'

import React from 'react';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import type { Education } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { MonthYearPicker } from '~/components/month-year-picker';


interface EducationSectionProps {
    educationFields: Omit<Education, "profileId" | "createdAt" | "updatedAt">[];
    register: any;
    setValue: any;
    removeEducation: (index: number) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ educationFields, register, setValue, removeEducation }) => {
    console.log('EducationSection()')
    return (
        <div className="space-y-4">
            {educationFields.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                    <div>
                        <label htmlFor={`edu-school-${field.id}`} className="text-sm font-medium block">School</label>
                        <Input id={`edu-school-${field.id}`} {...register(`educations.${index}.school`)} placeholder="School name" />
                    </div>
                    <div>
                        <label htmlFor={`edu-degree-${field.id}`} className="text-sm font-medium block">Degree</label>
                        <Input id={`edu-degree-${field.id}`} {...register(`educations.${index}.degree`)} placeholder="Degree" />
                    </div>
                    <div>
                        <label htmlFor={`edu-field-${field.id}`} className="text-sm font-medium block">Field of Study</label>
                        <Input id={`edu-field-${field.id}`} {...register(`educations.${index}.fieldOfStudy`)} placeholder="Field of study" />
                    </div>
                    <div className="flex gap-2">
                        <div className='flex-1'>
                            <label htmlFor={`edu-start-${field.id}`} className="text-sm font-medium block">Start Date</label>
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
                            <label htmlFor={`edu-end-${field.id}`} className="text-sm font-medium block">End Date</label>
                            <MonthYearPicker
                                date={setValue(`educations.${index}.endDate`)} // Set the initial date as needed
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
                            <label htmlFor={`edu-location-${field.id}`} className="text-sm font-medium block">Location</label>
                            <Input id={`edu-location-${field.id}`} {...register(`educations.${index}.location`)} placeholder="Location" />
                        </div>
                        <div className="flex flex-1 gap-2">
                            <div className=''>
                                <label htmlFor={`edu-gpa-${field.id}`} className="text-sm font-medium block">GPA</label>
                                <Input id={`edu-gpa-${field.id}`} {...register(`educations.${index}.gpa`, {
                                    valueAsNumber: true
                                })} type="number" placeholder="GPA" step={0.1} />
                            </div>
                            <div className=''>
                                <label htmlFor={`edu-gpaMax-${field.id}`} className="text-sm font-medium block">Maximum GPA</label>
                                <Input id={`edu-gpaMax-${field.id}`} {...register(`educations.${index}.gpaMax`, {
                                    valueAsNumber: true
                                })} type="number" placeholder="Max GPA" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 gap-2">
                        <div className='flex-1'>
                            <label htmlFor={`edu-description-${field.id}`} className="text-sm font-medium block">Description</label>
                            <Textarea
                                id={`edu-description-${field.id}`}
                                {...register(`educations.${index}.description`)}
                                placeholder="Additional details about your education"
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