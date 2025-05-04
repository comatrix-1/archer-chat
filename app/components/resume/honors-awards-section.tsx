'use client'

import React from 'react';
import type { HonorsAwards } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { NO_ITEMS_DESCRIPTION } from '~/lib/constants';

interface HonorsAwardField {
    id: string;
    title: string;
    issuer: string;
    date: Date;
    description: string;
}

interface HonorsAwardsSectionProps {
    honorsAwardsFields: Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt">[];
    control: any;
    removeHonorsAward: (index: number) => void;
}

const HonorsAwardsSection: React.FC<HonorsAwardsSectionProps> = ({ honorsAwardsFields, control, removeHonorsAward }) => {
    if (!honorsAwardsFields || honorsAwardsFields.length === 0) {
        return <p>{NO_ITEMS_DESCRIPTION}</p>
    }
    return (
        <div className="space-y-4">
            {honorsAwardsFields.map((field, index) => (
                <div key={field.id} className="group relative space-y-2 p-4 border rounded-lg">
                    <div className="space-y-4 flex-1">
                        <FormField
                            control={control}
                            name={`honorsAwards.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input className="font-medium text-lg" placeholder="e.g. Best Project Award" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`honorsAwards.${index}.issuer`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Issuer</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. University of California" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`honorsAwards.${index}.date`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`honorsAwards.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the honors and awards" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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