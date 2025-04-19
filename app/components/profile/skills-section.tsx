'use client'

import React from 'react';
import { Input } from '~/components/ui/input'; // Adjust the import path as necessary
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '~/components/ui/select'; // Adjust the import path as necessary
import { Button } from '~/components/ui/button'; // Adjust the import path as necessary
import { Trash2 } from 'lucide-react';

interface SkillField {
    id: string;
    name: string;
    proficiency: string;
}

interface SkillsSectionProps {
    skills: SkillField[];
    register: any;
    removeSkill: (index: number) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, register, removeSkill }) => {
    return (
        <div className="space-y-4">
            {skills.map((field, index) => (
                <div
                    key={field.id}
                    className="group flex items-end justify-between w-full gap-2 px-3 py-1 rounded-lg text-sm"
                >
                    <div className="w-3/5">
                        <label htmlFor={`skills.${index}.name`} className="text-sm font-medium block">Skill Name</label>
                        <Input
                            placeholder="Skill name"
                            {...register(`skills.${index}.name`)}
                        />
                    </div>
                    <div className="w-2/5">
                        <label htmlFor={`skills.${index}.proficiency`} className="text-sm font-medium block">Proficiency Level</label>
                        <Select {...register(`skills.${index}.proficiency`)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Proficiency level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                        </Select>
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