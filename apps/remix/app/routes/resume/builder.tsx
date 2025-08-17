import { useEffect, useState } from "react";
import ResumeSection from "@project/remix/app/components/resume/resume-section";
import { Button } from "@project/remix/app/components/ui/button";
import {
  EResumeSteps,
  type ResumeFormData,
} from "@project/remix/app/types/resume";
import { fetchWithAuth } from "@project/remix/app/utils/fetchWithAuth";
import { useNavigate, useParams } from "react-router";
import { supabase } from "~/utils/supabaseClient";
import { createPageUrl } from "~/utils/create-page-url";
import { trpc } from "@project/trpc/client";
import { ArrowLeft, FileText, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "~/components/ui/form";

function getQueryParam(name: string) {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default function ResumeGeneratorDetail() {
  const [resume, setResume] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const [resumeStep, setResumeStep] = useState<EResumeSteps>(
    EResumeSteps.CONTACT
  );
  // const id = getQueryParam("id");
  const { id } = useParams<{ id?: string }>();

  console.log("ResumeGeneratorDetail() :: id:", id);

  console.log("ResumeGeneratorDetail() :: resume:", resume);

  const form = useForm<ResumeFormData>({
    defaultValues: {
      summary: "",
      contact: {
        fullName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        address: "",
        linkedin: "",
        github: "",
        portfolio: "",
      },
      experiences: [],
      educations: [
        {
          id: "",
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: new Date(),
          endDate: new Date(),
          location: "",
          gpa: 0,
          gpaMax: 0,
          description: "",
        },
      ],
      skills: [],
      certifications: [],
      projects: [],
      awards: [],
    },
  });

  const handleSave = async () => {
    if (!resume || !user) return;

    setIsSaving(true);
    // TODO: implement function
    // try {
    //   let contactId;

    //   // Save or update contact
    //   if (contact.id) {
    //     await Contact.update(contact.id, contact);
    //     contactId = contact.id;
    //   } else {
    //     const newContact = await Contact.create(contact);
    //     contactId = newContact.id;
    //     setContact(prev => ({ ...prev, id: newContact.id })); // Update contact state with new ID
    //   }

    //   // Save or update resume
    //   const resumeData = {
    //     ...resume,
    //     contactId,
    //     userId: user.id
    //   };

    //   if (resume.id) {
    //     await Resume.update(resume.id, resumeData);
    //   } else {
    //     const newResume = await Resume.create(resumeData);
    //     setResume(prev => ({ ...prev, id: newResume.id })); // Update resume state with new ID
    //     // If creating a new resume, redirect to the URL with the new ID
    //     navigate(createPageUrl("ResumeBuilder", { id: newResume.id }), { replace: true });
    //   }

    //   // If already on the correct URL (existing resume), just show success or no-op
    //   // For new resumes, the above navigate handles the URL update
    //   if (!resume.id) { // Only navigate if it was a new resume being saved for the first time
    //     // This is handled by the above navigate call within the else block
    //   } else {
    //     // Optionally, provide user feedback for successful save
    //     console.log("Resume saved successfully!");
    //   }
    // } catch (error) {
    //   console.error('Error saving resume:', error);
    //   // Provide user feedback about the error
    // }
    setIsSaving(false);
  };

  useEffect(() => {
    if (!resume) return;
    form.setValue("contact", resume.contact);
    form.setValue("summary", resume.summary);
    form.setValue("experiences", resume.experiences);
    form.setValue("educations", resume.educations);
    form.setValue("skills", resume.skills);
    form.setValue("certifications", resume.certifications);
    form.setValue("projects", resume.projects);
    form.setValue("awards", resume.awards);
  }, [resume, form]);

  useEffect(() => {
    const loadResumeData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("loadResumeData data:", data);
        if (!data.session?.user.id || !data.session?.user.email)
          throw new Error("User not authenticated");

        setUser({ id: data.session?.user.id, email: data.session?.user.email });

        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get("id");

        if (resumeId) {
          // Load existing resume
          const { items: existingResumeList } = await trpc.resume.list.query();
          const foundResume = existingResumeList.find(
            (r: any) => r.id === resumeId && r.userId === data.session?.user.id
          );

          if (foundResume) {
            setResume(foundResume);
          } else {
            // If resumeId is present but resume not found or doesn't belong to user, navigate back or handle error
            navigate(createPageUrl("resume")); // Or show an error message
            return;
          }
        } else {
          // Create new resume
          setResume({
            title: "Untitled Resume",
            summary: "",
            userId: data.session?.user.id,
          });
        }
      } catch (error: any) {
        // TODO: change any
        console.error("Error loading resume data:", error);
        // Potentially redirect to login if User.me() fails due to auth issues
        if (error.response && error.response.status === 401) {
          navigate(createPageUrl("login"));
        }
      }
      setIsLoading(false);
    };
    loadResumeData();
  }, [navigate]);

  return (
    <Form {...form}>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(createPageUrl("resume"))}
                  className="smooth-hover"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Resume
                  </h1>
                  {/* TODO: add resume title to resume type */}
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gold-accent text-white smooth-hover hover:shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Resume"}
              </Button>
            </div>
          </div>
        </div>
        <ResumeSection />
      </div>
    </Form>
  );
}
