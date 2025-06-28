import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
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
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export interface ResumeItem {
  id: string;
  title: string;
  jobDescription: string;
  resume: string;
  coverLetter: string;
  conversation?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    resumeId?: string;
    userId?: string;
  };
}
function safeNavigateToDetail(id: string) {
  if (typeof window !== "undefined") {
    window.location.href = `/resume/detail?id=${id}`;
  }
}
interface ResumeListProps {
  readonly masterResumeId: string | null;
  readonly resumeList: ResumeItem[];
}

export default function ResumeList({
  masterResumeId,
  resumeList,
}: ResumeListProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const openDeleteDialog = (id: string) => {
    setResumeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    setLoading(true);
    try {
      await fetchWithAuth(`/api/resume/${resumeToDelete}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting resume:", error);
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Master resume</h2>
          </div>

          {masterResumeId && (
            <div
              key={masterResumeId}
              className="bg-white rounded shadow p-4 flex justify-between items-center"
            >
              <div className="font-semibold text-lg mb-1">Master Resume</div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    safeNavigateToDetail(masterResumeId);
                  }}
                  disabled={loading}
                >
                  View
                </Button>
              </div>
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Resumes</h2>
            <Button onClick={() => navigate("/resume/generator")}>
              Generate New
            </Button>
          </div>
          <div className="space-y-4">
            {loading && resumeList.length === 0 && (
              <div className="text-gray-500 text-center">
                Loading resumes...
              </div>
            )}
            {!loading && resumeList.length === 0 && (
              <div className="text-gray-500 text-center text-sm">
                No resumes generated yet.
              </div>
            )}
            {resumeList.map((resume) => (
              <div key={resume.id} className="bg-white rounded shadow p-4">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-lg mb-1">
                    {resume.conversation?.title ?? "Untitled Conversation"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        safeNavigateToDetail(resume.id);
                      }}
                      disabled={loading}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(resume.id);
                      }}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isDeleteDialogOpen && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                resume.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setResumeToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
