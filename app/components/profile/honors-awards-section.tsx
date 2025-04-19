'use client'

import React from 'react';
import type { HonorsAwards } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';

interface HonorsAwardField {
    id: string;
    title: string;
    issuer: string;
    date: Date;
    description: string;
}

interface HonorsAwardsSectionProps {
    honorsAwardsFields: Omit<HonorsAwards, "profileId" | "createdAt" | "updatedAt">[];
    register: any;
    removeHonorsAward: (index: number) => void;
}

const HonorsAwardsSection: React.FC<HonorsAwardsSectionProps> = ({ honorsAwardsFields, register, removeHonorsAward }) => {
    return (
        <div className="space-y-4">
            {honorsAwardsFields.map((field, index) => (
                <div key={field.id} className="group relative space-y-2 p-4 border rounded-lg">

                    <div className="space-y-4 flex-1">
                        <div>
                            <label htmlFor={`award-title-${field.id}`} className="text-sm font-medium block">Title</label>
                            <Input id={`award-title-${field.id}`} className="font-medium text-lg" {...register(`honorsAwards.${index}.title`)} placeholder="e.g. Best Project Award" />
                        </div>
                        <div>
                            <label htmlFor={`award-issuer-${field.id}`} className="text-sm font-medium block">Issuer</label>
                            <Input id={`award-issuer-${field.id}`} {...register(`honorsAwards.${index}.issuer`)} placeholder="e.g. University of California" />
                        </div>
                        <div>
                            <label htmlFor={`award-date-${field.id}`} className="text-sm font-medium block">Date</label>
                            <Input id={`award-date-${field.id}`} {...register(`honorsAwards.${index}.date`)} type="date" />
                        </div>
                        <div>
                            <label htmlFor={`award-desc-${field.id}`} className="text-sm font-medium block">Description</label>
                            <Textarea id={`award-desc-${field.id}`} {...register(`honorsAwards.${index}.description`)} placeholder="Describe the honors and awards" />
                        </div>
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeHonorsAward(index)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default HonorsAwardsSection;