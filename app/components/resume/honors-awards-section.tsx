"use client";

import type { HonorsAwards } from "@prisma/client";
import { Plus } from "lucide-react";
import type React from "react";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { generateUUID } from "~/utils/security";
import { DetailCard } from "./detail-card";

interface HonorsAwardField {
  id: string;
  title: string;
  issuer: string;
  date: Date;
  description: string;
}

interface HonorsAwardItemProps {
  field: Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt"> & { id: string };
  index: number;
  control: any;
  onDelete: () => void;
  title: string;
}

const HonorsAwardItem: React.FC<HonorsAwardItemProps> = ({
  field,
  index,
  control,
  onDelete,
  title,
}) => {
  return (
    <DetailCard
      key={field.id}
      id={field.id}
      index={index}
      title={title}
      onDelete={onDelete}
    >
      <div className="space-y-4">
        <FormField
          control={control}
          name={`honorsAwards.${index}.title`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  className="font-medium text-lg"
                  placeholder="e.g. Best Project Award"
                  {...formField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`honorsAwards.${index}.issuer`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Issuer</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. University of California"
                  {...formField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`honorsAwards.${index}.date`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...formField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`honorsAwards.${index}.description`}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the honors and awards"
                  {...formField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </DetailCard>
  );
};

interface HonorsAwardsSectionProps {
  honorsAwardsFields: (Omit<HonorsAwards, "resumeId" | "createdAt" | "updatedAt"> & {
    id: string;
  })[];
  control: any;
  setValue: any;
  getValues: any;
  appendHonorsAward: (field: HonorsAwardField) => void;
  removeHonorsAward: (index: number) => void;
}

const HonorsAwardsSection: React.FC<HonorsAwardsSectionProps> = ({
  honorsAwardsFields,
  control,
  appendHonorsAward,
  removeHonorsAward,
  getValues,
}) => {
  return (
    <div className="space-y-4">
      {!honorsAwardsFields || honorsAwardsFields.length === 0 ?
        <p className="text-center">{NO_ITEMS_DESCRIPTION}</p>
        : null}
      {honorsAwardsFields.map((field, index) => {
        const title = getValues?.(`honorsAwards.${index}.title`) ?? `Award #${index + 1}`;
        return (
          <HonorsAwardItem
            key={field.id}
            field={field}
            index={index}
            control={control}
            title={title}
            onDelete={() => removeHonorsAward(index)}
          />
        );
      })}
      <Button
        type="button"
        className={cn("w-full max-w-md my-2 mx-auto flex items-center gap-2 justify-center")}
        onClick={(e) => {
          e.stopPropagation();
          appendHonorsAward({
            id: generateUUID(),
            title: "",
            issuer: "",
            date: new Date(),
            description: "",
          });
        }}
      >
        <Plus size={16} />
        <span>Add Award</span>
      </Button>
    </div>
  );
};

export default HonorsAwardsSection;
