import { Button } from "@project/remix/app/components/ui/button";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Briefcase,
  FolderOpen,
  GraduationCap,
  Star,
  User as UserIcon
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { exportResumeToDocx } from "~/utils/docx-exporter";

import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";
import { AwardsSection } from "./awards-section";
import CertificationSection from "./certification-section";
import { BasicsSection } from "./contact-section";
import { EducationSection } from "./education-section";
import ExperienceSection from "./experience-section";
import ProjectSection from "./project-section";
import { SkillsSection } from "./skills-section";
import { toast } from "sonner";

type TUser = {
  id: string;
  email: string;
};

const ResumeSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basics");

  const tabs = [
    { id: "basics", label: "Basics", icon: UserIcon },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Star },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "certifications", label: "Certifications", icon: BadgeCheck },
    { id: "awards", label: "Awards", icon: Award },
  ];

  const form = useFormContext<ZResumeWithRelations>();

  const exportToDocx = () => {
    exportResumeToDocx(form.getValues());
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-8">
        <div className="flex justify-end mb-2">
          <Button onClick={() => exportToDocx()}>Export to DOCX</Button>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <div className="rounded-xl shadow-sm border border-slate-200 p-2">
            <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-1 bg-transparent h-auto w-full">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="basics">
              <BasicsSection />
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
