import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContactInfo } from '../resume-sections/ContactInfo';
import { Summary } from '../resume-sections/Summary';
import { Experience } from '../resume-sections/Experience';
import { Education } from '../resume-sections/Education';
import { Skills } from '../resume-sections/Skills';
import { Projects } from '../resume-sections/Projects';
import { Certifications } from '../resume-sections/Certifications';

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

  const renderStep = () => {
    switch (currentStep) {
      case EResumeSteps.CONTACT:
        return <ContactInfo />;
      case EResumeSteps.SUMMARY:
        return <Summary />;
      case EResumeSteps.EXPERIENCE:
        return <Experience />;
      case EResumeSteps.EDUCATION:
        return <Education />;
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
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-8 ml-64">
        <Card className="p-6">
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
      </main>
    </div>
  );
};

export default ResumeSectionGemini;