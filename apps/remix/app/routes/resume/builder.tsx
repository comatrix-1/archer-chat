import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { trpc } from "@project/trpc/client";
import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";
import { supabase } from "~/utils/supabaseClient";
import { createPageUrl } from "~/utils/create-page-url";
import { useResume } from "~/hooks/useResume";
import ResumeSection from "~/components/resume/resume-section";
import { ArrowLeft, FileText, Save } from "lucide-react";

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string }>();

  const defaultValues = {
    title: "Resume",
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
    educations: [],
    skills: [],
    certifications: [],
    projects: [],
    awards: [],
  };

  const form = useForm<ZResumeWithRelations>({
    defaultValues,
  });

  const { data: resume, isLoading: isResumeLoading } = useResume(
    id || '',
    user?.id || ''
  );

  useEffect(() => {
    const loadResumeData = async () => {
      console.log('loadResumeData()')
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          navigate(createPageUrl("login"));
          return;
        }

        const userData = {
          id: data.session.user.id,
          email: data.session.user.email || ''
        };
        setUser(userData);

        // If no ID, we're creating a new resume
        if (!id) {
          console.log('no id, setting default values: ', defaultValues)
          form.reset({
            ...defaultValues,
            contact: {
              ...defaultValues.contact,
              email: userData.email
            }
          });
          return;
        }

        // If we have an ID, load the existing resume
        if (resume) {
          form.reset({ ...defaultValues, ...resume });
        } else if (!isResumeLoading) {
          // If resume not found and loading is complete, redirect to resume list
          navigate(createPageUrl("resume"));
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, [form, navigate, resume, isResumeLoading, id]);

  const handleSave = async (formData: ZResumeWithRelations) => {
    if (!formData || !user) return;

    setIsSaving(true);
    try {
      const resumeData = {
        ...formData,
        userId: user.id,
        isMaster: false
      };

      if (formData.id) {
        await trpc.resume.update.mutate(resumeData);
      } else {
        const newResume = await trpc.resume.create.mutate(resumeData);
        navigate(createPageUrl("resume/builder", { id: newResume.id }), {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
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
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {resume?.title || "New Resume"}
                  </h1>
                </div>
              </div>
              <Button
                onClick={form.handleSubmit(handleSave)}
                disabled={isSaving}
                className="gold-accent text-white smooth-hover hover:shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Resume'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <ResumeSection />
        </div>
      </div>
    </Form>
  );
}