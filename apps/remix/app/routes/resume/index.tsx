import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { createPageUrl } from "~/utils/create-page-url";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  User as UserIcon,
  BrainCircuit,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
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
import { trpc } from "@project/trpc/client";
import type { ZResumeWithRelations } from "@project/trpc/server/resume-router/schema";
import { supabase } from "~/utils/supabaseClient";
import JobApplicationSelectorDialog from "~/components/applications/JobApplicationSelectorDialog";
import { useDeleteResume } from "~/hooks/useResume";

export default function Resumes() {
  const [resumeList, setResumeList] = useState<ZResumeWithRelations[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<ZResumeWithRelations[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: deleteResume } = useDeleteResume();

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    const filtered = resumeList.filter(
      (resume) =>
        resume.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResumes(filtered);
  }, [resumeList, searchTerm]);


  const loadResumes = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setIsLoading(true);
      const { items: resumeList } = await trpc.resume.list.query();
      console.log("resumeList:", resumeList);

      const nonMasterResumeList = resumeList.filter(
        (r) => r.userId === data.session?.user.id && !r.isMaster
      );
      setResumeList(nonMasterResumeList);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchData: ", error);
    }
  };

  const handleSelectJobApplication = (jobApplicationId: string) => {
    setIsSelectorOpen(false);
    navigate(createPageUrl('resume/custom', { jobApplicationId }));
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteResume({ id: deleteId });
        setResumeList((prev) => prev.filter((resume) => resume.id !== deleteId));
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting resume:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Resumes</h1>
            <p className="text-slate-600">
              Manage and create professional resumes for your career
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsSelectorOpen(true)} variant="outline" className="smooth-hover">
              <BrainCircuit className="w-4 h-4 mr-2" />
              Create with AI
            </Button>
            <Link to={createPageUrl("ResumeBuilder")}>
              <Button className="gold-accent text-white smooth-hover hover:shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                New Resume
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search resumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Resumes Grid */}
      {filteredResumes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-slate-900 mb-4">
            {searchTerm ? "No resumes found" : "No resumes yet"}
          </h3>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            {searchTerm
              ? "Try adjusting your search terms or create a new resume."
              : "Get started by creating your first professional resume. Our AI will help you craft the perfect document."}
          </p>
          <Link to={createPageUrl("resume/builder")}>
            <Button className="gold-accent text-white smooth-hover hover:shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Resume
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm smooth-hover hover:shadow-xl group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 smooth-hover">
                      <Link to={createPageUrl(`resume/builder?id=${resume.id}`)}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => setDeleteId(resume.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 mb-2">
                    {resume.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-sm line-clamp-3">
                    {resume.summary || "No summary added yet"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{resume.updatedAt && format(new Date(resume.updatedAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>You</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link to={createPageUrl(`resume/builder?id=${resume.id}`)}>
                      <Button className="w-full gold-accent text-white smooth-hover hover:shadow-lg">
                        Edit Resume
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <JobApplicationSelectorDialog
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleSelectJobApplication}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
