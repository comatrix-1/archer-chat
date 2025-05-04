'use client'

import React from 'react';
import { Input } from '~/components/ui/input'; // Adjust the import path as necessary
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select'; // Adjust the import path as necessary
import { Button } from '~/components/ui/button'; // Adjust the import path as necessary
import { Trash2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';
import { NO_ITEMS_DESCRIPTION } from '~/lib/constants';

interface SkillField {
    id: string;
    name: string;
    proficiency: string;
}

interface SkillsSectionProps {
    skills: SkillField[];
    control: any;
    removeSkill: (index: number) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, control, removeSkill }) => {
    if (!skills || skills.length === 0) {
        return <p>{NO_ITEMS_DESCRIPTION}</p>
    }
    return (
        <div className="space-y-4">
            {skills.map((field, index) => (
                <div
                    key={field.id}
                    className="group flex items-end justify-between w-full gap-2 px-3 py-1 rounded-lg text-sm"
                >
                    <div className="w-3/5">
                        <FormField
                            control={control}
                            name={`skills.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skill Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Skill name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="w-2/5">
                        <FormField
                            control={control}
                            name={`skills.${index}.proficiency`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proficiency Level</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Proficiency level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                                <SelectItem value="Expert">Expert</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeSkill(index)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default SkillsSection;