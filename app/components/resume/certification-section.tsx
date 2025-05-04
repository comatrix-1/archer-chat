"use client";

import React from "react";
import type { LicenseCertification } from "@prisma/client";
import { Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { MonthYearPicker } from "~/components/month-year-picker";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { useWatch } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";
import { NO_ITEMS_DESCRIPTION } from "~/lib/constants";

interface CertificationSectionProps {
  certificationFields: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  control: any;
  setValue: any;
  getValues: any;
  removeCertification: (index: number) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({
  certificationFields,
  control,
  removeCertification,
  setValue,
  getValues,
}) => {
  console.log("CertificationSection()");

  if (!certificationFields || certificationFields.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }
  return (
    <div className="space-y-4">
      {certificationFields.map((field, index) => {
        const expiryDateValue = useWatch({
          control,
          name: `licenseCertifications.${index}.expiryDate`,
        });
        const hasNoExpiry = expiryDateValue === null;
        return (
          <div key={field.id} className="space-y-4 border p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-4 flex-1">
                <FormField
                  control={control}
                  name={`licenseCertifications.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Name</FormLabel>
                      <FormControl>
                        <Input
                          className="font-medium text-lg"
                          placeholder="e.g. AWS Solutions Architect"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`licenseCertifications.${index}.issuer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Organization</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Amazon Web Services"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FormLabel>Issue Date</FormLabel>
                    <MonthYearPicker
                      date={getValues(
                        `licenseCertifications.${index}.issueDate`
                      )} // Set the initial date as needed
                      onSelect={(date) => {
                        console.log("date", date);
                        // Allow setting null, but ensure time is zeroed if date exists
                        const newDate = date ? new Date(date) : null;
                        if (newDate) {
                          newDate.setHours(0, 0, 0, 0);
                        }
                        setValue(
                          `licenseCertifications.${index}.issueDate`,
                          newDate
                        );

                        console.log(
                          "Form Values:",
                          getValues(`licenseCertifications.${index}.issueDate`)
                        );
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    {/* Group Label and Checkbox */}
                    <div className="flex items-center justify-between mb-1">
                      <FormLabel>Expiry Date</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`no-expiry-${index}`}
                          checked={hasNoExpiry}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Set expiry date to null when checked
                              setValue(
                                `licenseCertifications.${index}.expiryDate`,
                                null,
                                { shouldValidate: true, shouldDirty: true }
                              );
                            } else {
                              setValue(`licenseCertifications.${index}.expiryDate`, new Date(), { shouldValidate: true, shouldDirty: true });
                            }
                          }}
                        />
                        <label
                          htmlFor={`no-expiry-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          No expiry
                        </label>
                      </div>
                    </div>
                    {!hasNoExpiry && (
                      <MonthYearPicker
                        date={expiryDateValue} // Use watched value
                        onSelect={(date) => {
                          // Allow setting null, but ensure time is zeroed if date exists
                          const newDate = date ? new Date(date) : null;
                          if (newDate) {
                            newDate.setHours(0, 0, 0, 0);
                          }
                          setValue(
                            `licenseCertifications.${index}.expiryDate`,
                            newDate
                          );
                        }}
                      />
                    )}
                  </div>
                </div>
                <FormField
                  control={control}
                  name={`licenseCertifications.${index}.credentialId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credential ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Credential ID or URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4"></div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeCertification(index)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default CertificationSection;
