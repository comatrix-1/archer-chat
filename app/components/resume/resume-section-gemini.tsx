import React, { useState } from 'react';
import type { EducationFormItem } from '../resume-sections/Education';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContactInfo } from '../resume-sections/ContactInfo';
import { Summary } from '../resume-sections/Summary';
import { Experience } from '../resume-sections/Experience';
import { Education } from '../resume-sections/Education';
import { Skills } from '../resume-sections/Skills';
import { Projects } from '../resume-sections/Projects';
import { Certifications } from '../resume-sections/Certifications';
import ExperienceSection from './experience-section';
import { useForm } from 'react-hook-form';
import { Form } from '../ui/form';
import { EducationSection } from './education-section';

enum EEmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FREELANCE = 'FREELANCE',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  APPRENTICESHIP = 'APPRENTICESHIP',
  SEASONAL = 'SEASONAL',
}

enum ELocationType {
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE',
}

const experienceData = [
  {
    "id": "45cf45b4-7055-42fb-8df1-9a97511a363c",
    "title": "1",
    "employmentType": EEmploymentType.FULL_TIME,
    "locationType": ELocationType.ON_SITE,
    "company": "test1",
    "location": "",
    "startDate": new Date("2017-07-13T00:00:00.000Z"),
    "endDate": null,
    "description": "<p>test1</p>"
  }
];

enum EResumeSteps {
  CONTACT = 'Contact',
  SUMMARY = 'Summary',
  EXPERIENCE = 'Experience',
  EDUCATION = 'Education',
  SKILLS = 'Skills',
  PROJECTS = 'Projects',
  CERTIFICATIONS = 'Certifications',
}

const steps = [
  { id: EResumeSteps.CONTACT, label: 'Contact Info' },
  { id: EResumeSteps.SUMMARY, label: 'Summary' },
  { id: EResumeSteps.EXPERIENCE, label: 'Experience' },
  { id: EResumeSteps.EDUCATION, label: 'Education' },
  { id: EResumeSteps.SKILLS, label: 'Skills' },
  { id: EResumeSteps.PROJECTS, label: 'Projects' },
  { id: EResumeSteps.CERTIFICATIONS, label: 'Certifications' },
];

const ResumeSteps = ({
  currentStep,
  setCurrentStep,
}: {
  currentStep: EResumeSteps;
  setCurrentStep: (step: EResumeSteps) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <Button
            key={step.id}
            variant={currentStep === step.id ? 'default' : 'outline'}
            onClick={() => setCurrentStep(step.id)}
            className="capitalize"
          >
            {step.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

const ResumeSectionGemini = () => {
  const [currentStep, setCurrentStep] = useState<EResumeSteps>(EResumeSteps.CONTACT);

  const [educationData, setEducationData] = useState<EducationFormItem[]>([]);

  const handleSaveEducation = (data: EducationFormItem[]) => {
    setEducationData(data);
    // Here you would typically save to your backend or state management
    console.log('Education data saved:', data);
  };

  const form = useForm()

  const renderStep = () => {
    switch (currentStep) {
      case EResumeSteps.CONTACT:
        return <ContactInfo />;
      case EResumeSteps.SUMMARY:
        return <Summary />;
      case EResumeSteps.EXPERIENCE:
        return <ExperienceSection />;
      case EResumeSteps.EDUCATION:
        return (
          <EducationSection />
        );
      case EResumeSteps.SKILLS:
        return <Skills />;
      case EResumeSteps.PROJECTS:
        return <Projects />;
      case EResumeSteps.CERTIFICATIONS:
        return <Certifications />;
      default:
        return <ContactInfo />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">
        <Form {...form}>
          <Card className="p-6">
            <Button onClick={() => console.log('experienceData: ', experienceData)}>Save</Button>
            <Button onClick={() => console.log('form: ', form.getValues())}>Check form</Button>
            <ResumeSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
            {renderStep()}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                disabled={currentStep === EResumeSteps.CONTACT}
                onClick={() => {
                  const currentIndex = steps.findIndex((step) => step.id === currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1].id);
                  }
                }}
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  const currentIndex = steps.findIndex((step) => step.id === currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1].id);
                  }
                }}
                disabled={currentStep === EResumeSteps.CERTIFICATIONS}
              >
                Next
              </Button>
            </div>
          </Card>
        </Form>
      </main>
    </div>
  );
};

export default ResumeSectionGemini;