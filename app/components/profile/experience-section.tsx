'use client'

import React from 'react';
import { Input } from '~/components/ui/input'; // Adjust the import path as per your UI components
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import type { Experience } from '@prisma/client';
import { Trash2 } from 'lucide-react';

interface ExperienceSectionProps {
    experienceSectionFields: Omit<Experience, "profileId" | "createdAt" | "updatedAt">[];
    register: any;
    removeExperience: (index: number) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experienceSectionFields: experienceFields, register, removeExperience }) => {
    return (
        <div className="space-y-4">
            {experienceFields.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                    <div>
                        <label htmlFor={`exp-title-${field.id}`} className="text-sm font-medium block">Title</label>
                        <Input id={`exp-title-${field.id}`} {...register(`experiences.${index}.title`)} placeholder="Job title" />
                    </div>
                    <div>
                        <label htmlFor={`exp-type-${field.id}`} className="text-sm font-medium block">Employment Type</label>
                        <Input id={`exp-type-${field.id}`} {...register(`experiences.${index}.employmentType`)} placeholder="Full-time, Part-time, Contract, etc." />
                    </div>
                    <div>
                        <label htmlFor={`exp-company-${field.id}`} className="text-sm font-medium block">Company</label>
                        <Input id={`exp-company-${field.id}`} {...register(`experiences.${index}.company`)} placeholder="Company name" />
                    </div>
                    <div>
                        <label htmlFor={`exp-desc-${field.id}`} className="text-sm font-medium block">Description</label>
                        <Textarea id={`exp-desc-${field.id}`} {...register(`experiences.${index}.description`)} placeholder="Describe your responsibilities and achievements" />
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeExperience(index)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default ExperienceSection;