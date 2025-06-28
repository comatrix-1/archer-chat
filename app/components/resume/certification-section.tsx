"use client";

import type { LicenseCertification } from "@prisma/client";
import { Plus } from "lucide-react";
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
import { generateUUID } from "~/utils/security";
import { DetailCard } from "./detail-card";
interface CertificationSectionProps {
  certificationFields: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  appendCertification: (certification: LicenseCertification) => void;
  removeCertification: (index: number) => void;
  resumeId: string;
}
interface CertificationItemProps {
  fieldId: string;
  index: number;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  removeCertification: (index: number) => void;
  resumeId: string;
  title: string;
}
const CertificationItem: React.FC<CertificationItemProps> = memo(({
  fieldId,
  index,
  control,
  setValue,
  removeCertification,
  resumeId,
  title,
}) => {
    const issueDateValue = useWatch({
      control,
      name: `licenseCertifications.${index}.issueDate`,
    });

    const expiryDateValue = useWatch({
      control,
      name: `licenseCertifications.${index}.expiryDate`,
    });

    const hasNoExpiry = expiryDateValue === null;

    return (
      <DetailCard
        key={fieldId}
        id={fieldId}
        index={index}
        title={title}
        onDelete={() => removeCertification(index)}
      >
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
                <Input placeholder="e.g. Amazon Web Services" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <div className="flex-1">
            <FormLabel>Issue Date</FormLabel>
            <MonthYearPicker
              date={issueDateValue}
              onSelect={(date) => {
                const newDate = date ? new Date(date) : null;
                if (newDate) {
                  newDate.setHours(0, 0, 0, 0);
                }
                setValue(
                  `licenseCertifications.${index}.issueDate`,
                  newDate,
                  { shouldValidate: true, shouldDirty: true },
                );
              }}
              startDate={new Date(new Date().getFullYear() - 50, 0, 1)}
              endDate={new Date()}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <FormLabel>Expiry Date</FormLabel>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`no-expiry-${index}`}
                  checked={hasNoExpiry}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setValue(
                        `licenseCertifications.${index}.expiryDate`,
                        null,
                        { shouldValidate: true, shouldDirty: true },
                      );
                    } else {
                      setValue(
                        `licenseCertifications.${index}.expiryDate`,
                        new Date(),
                        { shouldValidate: true, shouldDirty: true },
                      );
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
                date={expiryDateValue}
                onSelect={(date) => {
                  const newDate = date ? new Date(date) : null;
                  if (newDate) {
                    newDate.setHours(0, 0, 0, 0);
                  }
                  setValue(
                    `licenseCertifications.${index}.expiryDate`,
                    newDate,
                    { shouldValidate: true, shouldDirty: true },
                  );
                }}
                startDate={new Date(new Date().getFullYear() - 15, 0, 1)}
                endDate={new Date(new Date().getFullYear() + 15, 11, 31)}
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
                <Input
                  placeholder="Credential ID or URL"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </DetailCard>
    );
  },
);

CertificationItem.displayName = "CertificationItem";

const CertificationSection: React.FC<CertificationSectionProps> = ({
  certificationFields,
  control,
  appendCertification,
  removeCertification,
  setValue,
  getValues,
  resumeId,
}) => {
  if (!certificationFields || certificationFields.length === 0) {
    return <p>{NO_ITEMS_DESCRIPTION}</p>;
  }
  return (
    <div className="space-y-4 flex flex-col items-stretch">
      {certificationFields.map((field, index) => {
    const title = getValues(`licenseCertifications.${index}.name`) ?? `Certification #${index + 1}`;
    return (
      <CertificationItem
        key={field.id}
        fieldId={field.id}
        index={index}
        control={control}
        setValue={setValue}
        removeCertification={removeCertification}
        resumeId={resumeId}
        title={title}
      />
    );
  })}
      <Button
        type="button"
        className="w-full max-w-md my-2 mx-auto"
        onClick={(e) => {
          e.stopPropagation();
          appendCertification({
            id: generateUUID(),
            name: "",
            issuer: "",
            issueDate: new Date(),
            expiryDate: null,
            credentialId: null,
            resumeId,
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            appendCertification({
              id: generateUUID(),
              name: "",
              issuer: "",
              issueDate: new Date(),
              expiryDate: null,
              credentialId: null,
              resumeId,
            });
          }
        }}
      >
        <Plus size={16} />
        <span>Add Certification</span>
      </Button>
    </div>
  );
};
export default CertificationSection;
