import { Button } from "@project/remix/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@project/remix/app/components/ui/card";
import {
  EResumeSteps,
  type ResumeFormData,
} from "@project/remix/app/types/resume";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Briefcase,
  FileText,
  FolderOpen,
  GraduationCap,
  Save,
  Star,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { createPageUrl } from "~/utils/create-page-url";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AwardsSection } from "./awards-section";
import CertificationSection from "./certification-section";
import { ContactSection } from "./contact-section";
import { EducationSection } from "./education-section";
import ExperienceSection from "./experience-section";
import ProjectSection from "./project-section";
import { SkillsSection } from "./skills-section";
import { SummarySection } from "./summary-section";
import { Form } from "~/components/ui/form";
import { supabase } from "~/utils/supabaseClient";
import { trpc } from "@project/trpc/client";

type TUser = {
  id: string;
  email: string;
};

const ResumeSection = (props: { resume?: ResumeFormData }) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<TUser>();
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basics");
  const [currentStep, setCurrentStep] = useState<EResumeSteps>(
    EResumeSteps.CONTACT
  );

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

  const tabs = [
    { id: "basics", label: "Basics", icon: UserIcon },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Star },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "certifications", label: "Certifications", icon: BadgeCheck },
    { id: "awards", label: "Awards", icon: Award },
  ];

  const updateResume = (field: string, value: string) => {
    setResume((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

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
    if (!props.resume) return;
    form.setValue("contact", props.resume.contact);
    form.setValue("summary", props.resume.summary);
    form.setValue("experiences", props.resume.experiences);
    form.setValue("educations", props.resume.educations);
    form.setValue("skills", props.resume.skills);
    form.setValue("certifications", props.resume.certifications);
    form.setValue("projects", props.resume.projects);
    form.setValue("awards", props.resume.awards);
  }, [props.resume, form]);

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

  useEffect(() => {
    loadResumeData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
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
                  New Resume
                </h1>
                {/* TODO: add resume title to resume type */}
              </div>
            </div>
            <Button
              // onClick={handleSave}
              // disabled={isSaving}
              className="gold-accent text-white smooth-hover hover:shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Resume"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <div className="rounded-xl shadow-sm border border-slate-200 p-2">
            <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-1 bg-transparent h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg smooth-hover data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <Form {...form}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="basics" className="space-y-6">
                <Card className="border shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Resume Title</Label>
                        <Input
                          id="title"
                          value=""
                          onChange={(e) =>
                            updateResume("title", e.target.value)
                          }
                          placeholder="e.g., Software Engineer Resume"
                          className="border-slate-200 focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={props.resume?.summary || ""}
                        onChange={(e) =>
                          updateResume("summary", e.target.value)
                        }
                        placeholder="Write a brief professional summary highlighting your key skills and experience..."
                        rows={4}
                        className="border-slate-200 focus:border-amber-500"
                      />
                    </div>

                    <ContactSection />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <ExperienceSection />
              </TabsContent>

              <TabsContent value="education">
                <EducationSection />
              </TabsContent>

              <TabsContent value="skills">
                <SkillsSection />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectSection />
              </TabsContent>

              <TabsContent value="certifications">
                <CertificationSection />
              </TabsContent>

              <TabsContent value="awards">
                <AwardsSection />
              </TabsContent>
            </motion.div>
          </Form>
        </Tabs>
      </div>
    </div>

    // TODO: remove if not needed
    // return (
    //   <div className="flex min-h-screen">
    //     <main className="flex-1 p-8">
    //       <Form {...form}>
    //         <Card className="p-6">
    //           <Button onClick={() => console.log("form: ", form.getValues())}>
    //             Check form
    //           </Button>
    //           <ResumeNav
    //             currentStep={currentStep}
    //             setCurrentStep={setCurrentStep}
    //           />
    //         </Card>
    //         {renderStep()}
    //       </Form>
    //     </main>
    //   </div>
    // );
  );
};

export default ResumeSection;
