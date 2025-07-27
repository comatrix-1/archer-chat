import { Button } from '@project/remix/app/components/ui/button';
import { Card } from '@project/remix/app/components/ui/card';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EEmploymentType, ELocationType, EResumeSteps, steps, type IResumeItem, type ResumeFormData } from '@project/remix/app/types/resume';
import CertificationSection from './certification-section';
import { ContactSection } from './contact-section';
import { SummarySection } from './summary-section';
import { Form } from '../ui/form';
import { EducationSection } from './education-section';
import ExperienceSection from './experience-section';
import { SkillsSection } from './skills-section';
import ProjectSection from './project-section';
import { AwardsSection } from './awards-section';
import { ResumeNav } from './resume-nav';

const ResumeSection = ({
  resume,
}: {
  resume: ResumeFormData;
}) => {
  const [currentStep, setCurrentStep] = useState<EResumeSteps>(EResumeSteps.CONTACT);

  const form = useForm<ResumeFormData>({
    defaultValues: {
      summary: '',
      contact: {
        fullName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        address: '',
        linkedin: '',
        github: '',
        portfolio: '',
      },
      experiences: [],
      educations: [{
        id: '',
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: new Date(),
        endDate: new Date(),
        location: '',
        gpa: 0,
        gpaMax: 0,
        description: ''
      }],
      skills: [],
      certifications: [],
      projects: [],
      awards: [],
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
            <ResumeNav currentStep={currentStep} setCurrentStep={setCurrentStep} />
            {renderStep()}
          </Card>
        </Form>
      </main>
    </div>
  );
};

export default ResumeSection;