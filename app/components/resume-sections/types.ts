import type { Control, FieldValues } from 'react-hook-form';

export interface ExperienceType {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description: string[];
}

export type ExperienceFormValues = {
  experiences: ExperienceType[];
};

type TypedControl = Control<ExperienceFormValues>;

export interface SortableExperienceItemProps {
  field: ExperienceType;
  index: number;
  control: TypedControl;
  removeExperience: () => void;
  handleUpdate: (key: keyof ExperienceType, value: string | string[]) => void;
}

export interface DescriptionBulletsProps {
  control: TypedControl;
  index: number;
  fieldId: string;
  onUpdate: (key: keyof ExperienceType, value: string | string[]) => void;
}
