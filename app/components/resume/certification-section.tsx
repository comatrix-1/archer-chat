'use client'

import React from 'react';
import type { LicenseCertification } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { MonthYearPicker } from '~/components/month-year-picker';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '~/components/ui/form';

interface CertificationSectionProps {
    certificationFields: Omit<LicenseCertification, "resumeId" | "createdAt" | "updatedAt">[];
    control: any;
    setValue: any;
    getValues: any;
    removeCertification: (index: number) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({ certificationFields, control, removeCertification, setValue, getValues }) => {
    console.log('CertificationSection()')

    const [issueDate, setIssueDate] = React.useState<Date>();
    const [expiryDate, setExpiryDate] = React.useState<Date>();

    return (
        <div className="space-y-4">
            {certificationFields.map((field, index) => (
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
                                            <Input className="font-medium text-lg" placeholder="e.g. AWS Solutions Architect" {...field} />
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
                                        date={getValues(`licenseCertifications.${index}.issueDate`)} // Set the initial date as needed
                                        onSelect={(date) => {
                                            console.log('date', date)
                                            if (!date) return;
                                            const newDate = date;
                                            newDate.setHours(0, 0, 0, 0);
                                            setValue(`licenseCertifications.${index}.issueDate`, date);

                                            console.log('Form Values:', getValues(`licenseCertifications.${index}.issueDate`));
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormLabel>Expiry Date</FormLabel>
                                    <MonthYearPicker
                                        date={getValues(`licenseCertifications.${index}.expiryDate`)} // Set the initial date as needed
                                        onSelect={(date) => {
                                            if (!date) return;
                                            const newDate = date;
                                            newDate.setHours(0, 0, 0, 0);
                                            setValue(`licenseCertifications.${index}.expiryDate`, date);
                                        }}
                                    />
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
                        <div className="space-y-4">
                        </div>
                    </div>
                    <Button type="button" variant="destructive" onClick={() => removeCertification(index)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default CertificationSection;