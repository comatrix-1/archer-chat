"use client";

import type { Project } from "@prisma/client";
import { Trash2 } from "lucide-react";
import type React from "react";
import { memo } from "react";
import {
	type Control,
	type UseFormGetValues,
	type UseFormSetValue,
	useWatch,
} from "react-hook-form";
import { MonthYearPicker } from "~/components/month-year-picker";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { RichTextEditor } from "../rich-text-editor";

interface ProjectSectionProps {
	projectFields: Omit<Project, "resumeId">[];
	control: Control<any>;
	removeProject: (index: number) => void;
	setValue: UseFormSetValue<any>;
	getValues: UseFormGetValues<any>;
}

interface ProjectItemProps {
	fieldId: string;
	index: number;
	control: Control<any>;
	removeProject: (index: number) => void;
	setValue: UseFormSetValue<any>;
	getValues: UseFormGetValues<any>;
}

const ProjectItem: React.FC<ProjectItemProps> = memo(
	({ fieldId, index, control, getValues, setValue, removeProject }) => {
		const startDateValue = useWatch({
			control,
			name: `projects.${index}.startDate`,
		});
		const endDateValue = useWatch({
			control,
			name: `projects.${index}.endDate`,
		});
		const isPresent = endDateValue === null;

		return (
			<div key={fieldId} className="space-y-4 border p-4 rounded-lg">
				<FormField
					control={control}
					name={`projects.${index}.title`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Project Title</FormLabel>
							<FormControl>
								<Input placeholder="Project title" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex gap-2">
					<div className="flex-1">
						<FormLabel>Start Date</FormLabel>
						<MonthYearPicker
							date={startDateValue}
							onSelect={(date) => {
								const newDate = date ? new Date(date) : null;
								if (newDate) newDate.setHours(0, 0, 0, 0);
								setValue(`projects.${index}.startDate`, newDate, {
									shouldValidate: true,
									shouldDirty: true,
								});
							}}
						/>
					</div>
					<div className="flex-1">
						<div className="flex items-center justify-between mb-1">
							<FormLabel>End Date</FormLabel>
							<div className="flex items-center space-x-2">
								<Checkbox
									id={`project-present-${index}`}
									checked={isPresent}
									onCheckedChange={(checked) => {
										setValue(
											`projects.${index}.endDate`,
											checked ? null : new Date(),
											{ shouldValidate: true, shouldDirty: true },
										);
									}}
								/>
								<label
									htmlFor={`project-present-${index}`}
									className="text-sm font-medium"
								>
									Present
								</label>
							</div>
						</div>
						{!isPresent && (
							<MonthYearPicker
								date={endDateValue}
								onSelect={(date) => {
									const newDate = date ? new Date(date) : null;
									if (newDate) newDate.setHours(0, 0, 0, 0);
									setValue(`projects.${index}.endDate`, newDate, {
										shouldValidate: true,
										shouldDirty: true,
									});
								}}
							/>
						)}
					</div>
				</div>
				<FormField
					control={control}
					name={`projects.${index}.description`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description (Optional)</FormLabel>
							<FormControl>
								<RichTextEditor
									content={field.value}
									onChange={field.onChange}
									placeholder="Describe the project..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="button"
					variant="destructive"
					onClick={() => removeProject(index)}
				>
					<Trash2 size={16} />
				</Button>
			</div>
		);
	},
);
ProjectItem.displayName = "ProjectItem";

const ProjectSection: React.FC<ProjectSectionProps> = ({
	projectFields,
	control,
	getValues,
	setValue,
	removeProject,
}) => {
	if (!projectFields || projectFields.length === 0) {
		return <p>{NO_ITEMS_DESCRIPTION}</p>;
	}
	return (
		<div className="space-y-4">
			{projectFields.map((field, index) => (
				<ProjectItem
					key={field.id}
					fieldId={field.id}
					index={index}
					control={control}
					getValues={getValues}
					setValue={setValue}
					removeProject={removeProject}
				/>
			))}
		</div>
	);
};

export default ProjectSection;
