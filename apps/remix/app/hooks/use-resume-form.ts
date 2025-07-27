import type {
  Contact,
  Education,
  Experience,
  awards,
  LicenseCertification,
  Project,
  Resume,
  Skill,
} from "@prisma/client";
import type {
  EmploymentType,
  LocationType,
  SkillCategory,
  SkillProficiency,
} from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useBlocker } from "react-router";
import { EResumeSteps } from "@project/remix/app/lib/constants";
import { fetchWithAuth } from "@project/remix/app/utils/fetchWithAuth";
import { generateUUID } from "@project/remix/app/utils/security";

export type ResumeFormData = {
  objective: string;
  contact: Contact;
  experiences: (Omit<
    Experience,
    "resumeId" | "createdAt" | "updatedAt" | "employmentType" | "locationType"
  > & {
    employmentType: EmploymentType;
    locationType: LocationType;
    current: boolean;
    website?: string | null;
  })[];
  educations: Omit<Education, "resumeId" | "createdAt" | "updatedAt">[];
  skills: (Omit<
    Skill,
    "resumeId" | "createdAt" | "updatedAt" | "category" | "proficiency"
  > & {
    category: SkillCategory;
    proficiency: SkillProficiency;
  })[];
  licenseCertifications: Omit<
    LicenseCertification,
    "resumeId" | "createdAt" | "updatedAt"
  >[];
  awards: Omit<awards, "resumeId" | "createdAt" | "updatedAt">[];
  projects: Omit<Project, "resumeId">[];
};

export function useResumeForm(
  initialResume: Resume & {
    contact: Contact;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
    awards: awards[];
    licenseCertifications: LicenseCertification[];
    projects: Project[];
  }
) {
  const [resume, setResume] = useState(initialResume);
  const [resumeStep, setResumeStep] = useState<EResumeSteps>(
    EResumeSteps.PERSONAL
  );
  const [loadingState, setLoadingState] = useState<{
    isSubmitting: boolean;
    isLoading: boolean;
    error: string | null;
  }>({
    isSubmitting: false,
    isLoading: false,
    error: null,
  });

  const form = useForm<ResumeFormData>({
    defaultValues: {
      objective: initialResume.objective ?? "",
      contact: initialResume.contact
        ? { ...initialResume.contact }
        : {
            id: generateUUID(),
            phone: "",
            email: "",
            name: "",
            linkedin: null,
            portfolio: null,
            city: "",
            country: "",
          },
      experiences:
        initialResume.experiences?.map((exp: Experience & { website?: string | null }) => ({
          ...exp,
          id: exp.id ?? generateUUID(),
          startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          website: exp.website ?? null,
        })) ?? [],
      educations:
        initialResume.educations?.map((edu: Education) => ({
          ...edu,
          id: edu.id ?? generateUUID(),
          startDate: edu.startDate ? new Date(edu.startDate) : new Date(),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          gpa: edu.gpa ?? null,
          gpaMax: edu.gpaMax ?? null,
        })) ?? [],
      skills:
        initialResume.skills?.map((skill: Skill) => ({
          ...skill,
          id: skill.id ?? generateUUID(),
        })) ?? [],
      licenseCertifications:
        initialResume.licenseCertifications?.map(
          (cert: LicenseCertification) => ({
            ...cert,
            id: cert.id ?? generateUUID(),
            issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            credentialId: cert.credentialId ?? null,
          })
        ) ?? [],
      awards:
        initialResume.awards?.map((award: awards) => ({
          ...award,
          id: award.id ?? generateUUID(),
          date: award.date ? new Date(award.date) : new Date(),
        })) ?? [],
      projects:
        initialResume.projects?.map((proj: Project) => ({
          ...proj,
          id: proj.id ?? generateUUID(),
          startDate: proj.startDate ? new Date(proj.startDate) : new Date(),
          endDate: proj.endDate ? new Date(proj.endDate) : null,
        })) ?? [],
    },
  });

  const { control, handleSubmit, reset, formState, setValue, getValues } = form;

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control, name: "skills" });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experiences" });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "educations" });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification,
  } = useFieldArray({ control, name: "licenseCertifications" });

  const {
    fields: honorsAwardsFields,
    append: appendHonorsAward,
    remove: removeHonorsAward,
  } = useFieldArray({ control, name: "awards" });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({ control, name: "projects" });

  const onSubmit = async (data: ResumeFormData) => {
    setLoadingState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const response = await fetchWithAuth("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response) {
        throw new Error("No response from server");
      }

      const responseData = await response.data;
      console.log("responseData", responseData);

      if (responseData.resume) {
        setResume(responseData.resume);
        reset(responseData.resume);
        setLoadingState((prev) => ({ ...prev, isSubmitting: false }));
        return true;
      }

      const errorMsg = responseData.error ?? "Failed to save resume";
      setLoadingState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }));
      console.error("Error saving resume:", responseData);
      return false;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setLoadingState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: errorMsg,
      }));
      console.error("Error saving resume:", error);
      return false;
    }
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      formState.isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker && !formState.isDirty) {
      blocker.reset?.();
    }
  }, [blocker, formState.isDirty]);

  const setLoading = useCallback((isLoading: boolean) => {
    setLoadingState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setLoadingState((prev) => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setLoadingState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    form,
    formState,
    handleSubmit: (e?: React.BaseSyntheticEvent) => handleSubmit(onSubmit)(e),
    setValue,
    getValues,
    reset,

    resume,
    setResume,
    resumeStep,
    setResumeStep,

    loading: {
      ...loadingState,
      setLoading,
      setError,
      clearError,
    },

    skillFields,
    experienceFields,
    educationFields,
    certificationFields,
    honorsAwardsFields,
    projectFields,

    appendSkill,
    appendExperience,
    appendEducation,
    appendCertification,
    appendHonorsAward,
    appendProject,

    removeSkill,
    removeExperience,
    removeEducation,
    removeCertification,
    removeHonorsAward,
    removeProject,

    blocker,
  };
}
