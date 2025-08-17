import { trpc } from "@project/trpc/client";
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
  User as UserIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import ResumeSection from "~/components/resume/resume-section";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import type { ResumeFormData } from "~/types/resume";
import { supabase } from "~/utils/supabaseClient";

type TUser = {
  id: string;
  email: string;
};

export default function MasterResume() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<TUser>();
  const [activeTab, setActiveTab] = useState("basics");

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

  useEffect(() => {
    const loadMasterResume = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("loadResumeData data:", data);
        if (!data.session?.user.id || !data.session?.user.email)
          throw new Error("User not authenticated");

        setUser({ id: data.session?.user.id, email: data.session?.user.email });

        const { items: existingResumeList } = await trpc.resume.list.query();
        const masterResume = existingResumeList.find(
          (r) => r.userId === data.session?.user.id && r.conversationId === ""
        );

        if (masterResume) {
          setResume(masterResume);
        } else {
          setResume({
            title: "Master Resume",
            summary: "",
            userId: data.session?.user.id,
          });
        }
      } catch (error) {
        console.error("Error loading master resume:", error);
      }
      setIsLoading(false);
    };
    loadMasterResume();
  }, []);

  const handleSave = async () => {
    if (!resume || !user) return;

    setIsSaving(true);
    try {
      const resumeData = {
        ...resume,
        userId: user.id,
      };

      if (resume.id) {
        // await trpc.resume.update.mutate(); // TODO: enable update
      } else {
        // const newResume  =await trpc.resume.create.mutate(resumeData); // TODO: enable create
        // setResume({ ...resume, id: newResume.id });
      }

      // Show success feedback (you can add a toast notification here)
      console.log("Master resume saved successfully!");
    } catch (error) {
      console.error("Error saving master resume:", error);
    }
    setIsSaving(false);
  };

  const updateResume = (field: string, value: string) => {
    setResume((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  const tabs = [
    { id: "basics", label: "Basics", icon: UserIcon },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Star },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "certifications", label: "Certifications", icon: BadgeCheck },
    { id: "awards", label: "Awards", icon: Award },
  ];

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
                  onClick={handleSave}
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
