'use client'

import React from 'react';
import type { LicenseCertification } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { MonthYearPicker } from '~/components/month-year-picker';

interface CertificationSectionProps {
    certificationFields: Omit<LicenseCertification, "profileId" | "createdAt" | "updatedAt">[];
    register: any;
    setValue: any;
    getValues: any;
    removeCertification: (index: number) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({ certificationFields, register, removeCertification, setValue, getValues }) => {
    console.log('CertificationSection()')

    const [issueDate, setIssueDate] = React.useState<Date>();
    const [expiryDate, setExpiryDate] = React.useState<Date>();

    return (
        <div className="space-y-4">
            {certificationFields.map((field, index) => (
                <div key={field.id} className="space-y-4 border p-4 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-4 flex-1">
                            <div>
                                <label htmlFor={`cert-name-${field.id}`} className="text-sm font-medium block">Certification Name</label>
                                <Input id={`cert-name-${field.id}`} className="font-medium text-lg" {...register(`licenseCertifications.${index}.name`)} placeholder="e.g. AWS Solutions Architect" />
                            </div>
                            <div>
                                <label htmlFor={`cert-issuer-${field.id}`} className="text-sm font-medium block">Issuing Organization</label>
                                <Input id={`cert-issuer-${field.id}`} {...register(`licenseCertifications.${index}.issuer`)} placeholder="e.g. Amazon Web Services" />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label htmlFor={`cert-issue-date-${field.id}`} className="text-sm font-medium block">Issue Date</label>
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
                                    <label htmlFor={`cert-expiry-date-${field.id}`} className="text-sm font-medium block">Expiry Date</label>
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
                            <div>
                                <label htmlFor={`cert-credential-${field.id}`} className="text-sm font-medium block">Credential ID (Optional)</label>
                                <Input id={`cert-credential-${field.id}`} {...register(`licenseCertifications.${index}.credentialId`)} placeholder="Credential ID or URL" />
                            </div>
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