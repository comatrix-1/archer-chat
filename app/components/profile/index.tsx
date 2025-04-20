"use client"

import type {
  Contact,
  Education,
  Experience,
  HonorsAwards,
  LicenseCertification,
  Profile,
  Skill,
} from "@prisma/client";
import { Plus } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useBlocker } from "react-router";
import CertificationSection from "~/components/profile/certification-section";
import ContactSection from "~/components/profile/contact-section";
import EducationSection from "~/components/profile/education-section";
import ExperienceSection from "~/components/profile/experience-section";
import HonorsAwardsSection from "~/components/profile/honors-awards-section";
import SkillsSection from "~/components/profile/skills-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button, buttonVariants } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { generateUUID } from "~/utils/security";
import { fetchWithAuth } from '../../utils/fetchWithAuth';

function convertDatesToISO<T>(data: T): T {
  if (typeof data === "object" && data !== null) {
    if (data instanceof Date) {
      return data.toISOString() as T;
    }
    if (Array.isArray(data)) {
      return data.map((item) => convertDatesToISO(item)) as T;
    }
    const newData: Record<string, unknown> = {};
    Object.keys(data).forEach((key) => {
      newData[key] = convertDatesToISO((data as Record<string, unknown>)[key]);
    });
    return newData as T;
  }
  return data;
}

type ProfileFormData = {
  objective: string;
  contact: Contact;
  experiences: Omit<Experience, "profileId" | "createdAt" | "updatedAt">[];
  educations: Omit<Education, "profileId" | "createdAt" | "updatedAt">[];
  skills: Omit<Skill, "profileId" | "createdAt" | "updatedAt">[];
  licenseCertifications: Omit<
    LicenseCertification,
    "profileId" | "createdAt" | "updatedAt"
  >[];
  honorsAwards: Omit<HonorsAwards, "profileId" | "createdAt" | "updatedAt">[];
};

export default function ProfileComponent({
  initialProfile,
}: Readonly<{
  initialProfile: Profile & {
    contact: Contact;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
    honorsAwards: HonorsAwards[];
    licenseCertifications: LicenseCertification[];
  };
}>) {
  const [profile, setProfile] = useState(initialProfile);
  console.log('ProfileComponent() :: profile: ', profile);
  const hasUnsavedChanges = React.useRef(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const defaultValues = React.useMemo(
    () => ({
      ...profile,
      experiences:
        profile.experiences?.map((exp: Experience) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })) || [],
      educations:
        profile.educations?.map((edu: Education) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        })) || [],
      licenseCertifications:
        profile.licenseCertifications?.map((cert: LicenseCertification) => ({
          ...cert,
          issueDate: cert.issueDate ? new Date(cert.issueDate) : undefined,
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
        })) || [],
      honorsAwards:
        profile.honorsAwards?.map((award: HonorsAwards) => ({
          ...award,
          date: award.date ? new Date(award.date) : undefined,
        })) || [],
    }),
    [profile]
  );

  const form = useForm<ProfileFormData>({
    defaultValues,
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({
    control: form.control,
    name: "licenseCertifications",
  });

  const {
    fields: honorsAwardsFields,
    append: appendHonorsAward,
    remove: removeHonorsAward,
  } = useFieldArray({
    control: form.control,
    name: "honorsAwards",
  });

  const handleAddSkill = () => {
    appendSkill({
      id: generateUUID(),
      name: "",
      proficiency: "",
    });
  };

  const handleAddExperience = () => {
    appendExperience({
      id: generateUUID(),
      title: "",
      employmentType: "",
      company: "",
      startDate: new Date(),
      endDate: null,
      location: "",
      locationType: "",
      description: "",
    });
  };

  const handleAddEducation = () => {
    appendEducation({
      id: generateUUID(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: new Date(),
      endDate: null,
      gpa: null,
      gpaMax: null,
      location: "",
      description: "",
    });
  };

  const handleAddCertification = () => {
    appendCertification({
      id: generateUUID(),
      name: "",
      issuer: "",
      issueDate: new Date(),
      expiryDate: null,
      credentialId: null,
    });
  };

  const handleAddHonorsAward = () => {
    appendHonorsAward({
      id: generateUUID(),
      title: "",
      issuer: "",
      date: new Date(),
      description: "",
    });
  };

  useEffect(() => {
    hasUnsavedChanges.current = form.formState.isDirty;
    // TODO: prompt user for unsaved changes
  }, [form.formState.isDirty]);

  useEffect(() => {
    if (profile) {
      console.log('resetting profile to: ', profile);
      form.reset({
        ...profile,
        experiences: profile.experiences || [],
        educations: profile.educations || [],
        skills: profile.skills || [],
        honorsAwards: profile.honorsAwards || [],
        licenseCertifications: profile.licenseCertifications || [],
        contact: profile.contact || {
          email: "",
          phone: "",
          linkedin: "",
          portfolio: "",
          city: "",
          country: "",
        }
      });
    }
  }, [profile]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!formRef.current) return;

    // Convert dates to ISO strings
    const isoProfileData = convertDatesToISO(data);

    // Construct the payload to send as JSON (no user fields, just profile)
    const payload = {
      profile: isoProfileData,
    };

    try {
      const response = await fetchWithAuth('/api/profile', { method: 'POST', body: JSON.stringify(payload) });

      const result = await response.data;

      if (result.success) {
        alert("Profile updated successfully!");
        setProfile(result.profile);
        form.reset(result.profile);
        hasUnsavedChanges.current = false;
      } else {
        alert(`Error updating profile: ${result.message}, ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while updating the profile. Please try again.");
    }
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges.current &&
      currentLocation.pathname !== nextLocation.pathname
  );

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <a onClick={() => console.log(form.getValues())}>check form</a>
      <Form {...form}>
        {/* <form
          id="profile-form"
          method="post"
          className="space-y-4"
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          action="/api/profile"
        > */}
        <input type="hidden" name="intent" value="update" />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button
            variant={form.formState.isDirty ? "default" : "secondary"}
            disabled={!form.formState.isDirty}
            type="submit"
          >
            {form.formState.isDirty ? "Save Changes" : "No Changes"}
          </Button>
        </div>
        <Accordion
          type="single"
          collapsible
          defaultValue="contact"
          className="w-full space-y-4"
        >
          {/* Contact Information Accordion Item */}
          <AccordionItem value="contact" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ContactSection register={form.register} form={form} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="summary" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">
                  Objective
                </h2>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objective</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Objective" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Skills Accordion Item */}
          <AccordionItem value="skills" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between space-x-2 w-full mr-2">
                <h2 className="text-lg font-semibold">Skills</h2>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                    handleAddSkill();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddSkill();
                    }
                  }}
                >
                  <Plus />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-4 space-y-4">
                <SkillsSection
                  skills={skillFields}
                  register={form.register}
                  removeSkill={removeSkill}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Work Experience Accordion Item */}
          <AccordionItem
            value="experience"
            className="border rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between space-x-2 w-full mr-2">
                <h2 className="text-lg font-semibold">Work Experience</h2>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                    handleAddExperience();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddExperience();
                    }
                  }}
                >
                  <Plus />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ExperienceSection
                experienceSectionFields={experienceFields}
                register={form.register}
                removeExperience={removeExperience}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Education Accordion Item */}
          <AccordionItem value="education" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify_between space-x-2 w-full mr-2">
                <h2 className="text-lg font-semibold">Education</h2>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                    handleAddEducation();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddEducation();
                    }
                  }}
                >
                  <Plus />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <EducationSection
                educationFields={educationFields}
                setValue={form.setValue}
                register={form.register}
                removeEducation={removeEducation}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Certifications Accordion Item */}
          <AccordionItem
            value="certifications"
            className="border rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between space-x-2 w-full mr-2">
                <h2 className="text-lg font-semibold">Certifications</h2>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                    handleAddCertification();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddCertification();
                    }
                  }}
                >
                  <Plus />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CertificationSection
                certificationFields={certificationFields}
                register={form.register}
                setValue={form.setValue}
                getValues={form.getValues}
                removeCertification={removeCertification}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Honors and Awards Accordion Item */}
          <AccordionItem
            value="honorsAwards"
            className="border rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between space-x-2 w-full mr-2">
                <h2 className="text-lg font-semibold">Honors and Awards</h2>
                <div
                  role="button"
                  tabIndex={0}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                    handleAddHonorsAward();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation(); // Prevents the click from reaching AccordionTrigger
                      handleAddHonorsAward();
                    }
                  }}
                >
                  <Plus />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <HonorsAwardsSection
                honorsAwardsFields={honorsAwardsFields}
                register={form.register}
                removeHonorsAward={removeHonorsAward}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* </form> */}
      </Form>

      {blocker.state === "blocked" ? (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to leave?
              </AlertDialogTitle>
              <AlertDialogDescription>
                There are unsaved changes
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => blocker.reset()}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => blocker.proceed()}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
