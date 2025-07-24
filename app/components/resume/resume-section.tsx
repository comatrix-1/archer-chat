import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EEmploymentType, ELocationType, EResumeSteps, steps, type IResumeItem, type ResumeFormData } from '~/types/resume';
import CertificationSection from './certification-section';
import { ContactSection } from './contact-section';
import { SummarySection } from './summary-section';
import { Form } from '../ui/form';
import { EducationSection } from './education-section';
import ExperienceSection from './experience-section';
import { SkillsSection } from './skills-section';
import ProjectSection from './project-section';
import { AwardsSection } from './awards-section';
import { ResumeSteps } from '../resume-steps';

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

const educationData = [
  {
    "id": "45cf45b4-7055-42fb-8df1-9a97511a363c",
    "school": "test1",
    "degree": "test1",
    "fieldOfStudy": "test1",
    "startDate": new Date("2017-07-13T00:00:00.000Z"),
    "endDate": null,
    "location": "test1",
    "gpa": 4.0
  }
];

const ResumeSection = ({
  resume,
}: {
  resume: ResumeFormData;
}) => {
  const [currentStep, setCurrentStep] = useState<EResumeSteps>(EResumeSteps.CONTACT);

  const form = useForm<ResumeFormData>({
    defaultValues: {
      summary: '',
      experiences: experienceData,
      educations: educationData,
    },
  })

  useEffect(() => {
    if (!resume) return;
    form.setValue('contact', resume.contact);
    form.setValue('summary', resume.summary);
    form.setValue('experiences', resume.experiences);
    form.setValue('educations', resume.educations);
    form.setValue('skills', resume.skills);
    form.setValue('certifications', resume.certifications);
    form.setValue('projects', resume.projects);
    form.setValue('awards', resume.awards);

  }, [resume, form])

  const renderStep = () => {
    switch (currentStep) {
      case EResumeSteps.CONTACT:
        return <ContactSection />;
      case EResumeSteps.SUMMARY:
        return <SummarySection />;
      case EResumeSteps.EXPERIENCE:
        return <ExperienceSection />;
      case EResumeSteps.EDUCATION:
        return <EducationSection />;
      case EResumeSteps.SKILLS:
        return <SkillsSection />;
      case EResumeSteps.PROJECTS:
        return <ProjectSection />;
      case EResumeSteps.CERTIFICATIONS:
        return <CertificationSection />;
      case EResumeSteps.AWARDS:
        return <AwardsSection />;
      default:
        return <ContactSection />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">
        <Form {...form}>
          <Card className="p-6">
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

export default ResumeSection;