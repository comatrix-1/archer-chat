'use client'

import React from 'react';
import { Input } from '~/components/ui/input'; 
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import type { Experience } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { NO_ITEMS_DESCRIPTION } from '~/lib/constants';

interface ExperienceSectionProps {
    experienceSectionFields: Omit<Experience, "resumeId" | "createdAt" | "updatedAt">[];
    control: any;
    removeExperience: (index: number) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experienceSectionFields: experienceFields, control, removeExperience }) => {
    if (!experienceFields || experienceFields.length === 0) {
        return <p>{NO_ITEMS_DESCRIPTION}</p>;
    }
    return (
        <div className="space-y-4">
            {experienceFields.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-lg">
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
                                    <Input placeholder="Full-time, Part-time, Contract, etc." {...field} />
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
                    <FormField
                        control={control}
                        name={`experiences.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Describe your responsibilities and achievements" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeExperience(index)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default ExperienceSection;