"use client";

import type { HonorsAwards } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
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
import { generateUUID } from "~/utils/security";

interface HonorsAwardField {
  id: string;
  title: string;
  issuer: string;
  date: Date;
  description: string;
}

interface HonorsAwardsSectionProps {
  honorsAwardsFields: Omit<
    HonorsAwards,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  control: any;
  appendHonorsAward: (field: HonorsAwardField) => void;
  removeHonorsAward: (index: number) => void;
}

const HonorsAwardsSection: React.FC<HonorsAwardsSectionProps> = ({
  honorsAwardsFields,
  control,
  appendHonorsAward,
  removeHonorsAward,
}) => {
  return (
    <div className="space-y-4 flex flex-col items-stretch">
      {!honorsAwardsFields || honorsAwardsFields.length === 0
        ?
        <p className="text-center">{NO_ITEMS_DESCRIPTION}</p>
        : null
      }
      {honorsAwardsFields.map((field, index) => (
        <div
          key={field.id}
          className="group relative space-y-2 p-4 border rounded-lg"
        >
          <div className="space-y-4 flex-1">
            <FormField
              control={control}
              name={`honorsAwards.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      className="font-medium text-lg"
                      placeholder="e.g. Best Project Award"
                      {...field}
                    />
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
                    <Input
                      placeholder="e.g. University of California"
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Describe the honors and awards"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => removeHonorsAward(index)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        className="w-full max-w-md mx-auto"
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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            appendHonorsAward({
              id: generateUUID(),
              title: "",
              issuer: "",
              date: new Date(),
              description: "",
            });
          }
        }}
      >
        <Plus size={16} />
        <span>Add Award</span>
      </Button>
    </div>
  );
};

export default HonorsAwardsSection;
