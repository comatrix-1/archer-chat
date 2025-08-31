import { trpc } from "@project/trpc/client";
import type {
  ZResumeWithRelations
} from "@project/trpc/server/resume-router/schema";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Crown,
  FolderOpen,
  GraduationCap,
  Save,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import ResumeSection from "~/components/resume/resume-section";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { useMasterResume, useResume } from "~/hooks/useResume";
import type { TUser } from "~/types";
import { createPageUrl } from "~/utils/create-page-url";
import { supabase } from "~/utils/supabaseClient";

export default function MasterResume() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<TUser>();
  const [activeTab, setActiveTab] = useState("basics");

  const defaultValues = {
    title: "Master Resume",
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

  const { data: masterResume } = useMasterResume();

  useEffect(() => {
    const validateAuth = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("loadMasterResume session data:", data);
      if (!data.session?.user.id || !data.session?.user.email)
        return navigate(createPageUrl("login"));

      setUser({ id: data.session?.user.id, email: data.session?.user.email });
    }
    const loadMasterResume = async () => {
      if (masterResume) {
        form.reset({ ...defaultValues, ...masterResume });
      }
      setIsLoading(false);
    };
    validateAuth();
    loadMasterResume();
  }, [form.reset, masterResume, navigate]);

  const handleSave = async (formData: ZResumeWithRelations) => {
    console.log("formData to be sent to server", formData);
    if (!formData || !user) return;

    setIsSaving(true);
    try {
      const resumeData = {
        ...formData,
        userId: user.id,
        isMaster: true
      };

      if (formData.id) {
        await trpc.resume.update.mutate(resumeData);
      } else {
        const newResume = await trpc.resume.create.mutate(resumeData);
        console.log("New resume created:", newResume);
      }

      console.log("Master resume saved successfully!");
    } catch (error) {
      console.error("Error saving master resume:", error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                      Master Resume
                    </h1>
                    <p className="text-sm text-slate-600">
                      Your comprehensive professional profile
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={form.handleSubmit(handleSave)}
                  disabled={isSaving}
                  className="gold-accent text-white smooth-hover hover:shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Master Resume"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-amber-100/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Your Master Resume
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      This is your comprehensive professional profile containing
                      all your experiences, skills, and achievements. You can
                      create tailored versions from this master document for
                      specific job applications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <ResumeSection />
        </div>
      </div>
    </Form>
  );
}
