import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
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
    window.location.href = `/resume-generator-detail?id=${id}`;
  }
}
export default function ResumeList() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/resume/list");
      if (res.data?.resumes) {
        setResumes(res.data.resumes);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchResumes();
  }, []);
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      setLoading(true);
      try {
        await fetchWithAuth(`/api/resume/${id}`, {
          method: "DELETE",
        });
        await fetchResumes();
      } catch (error) {
        console.error("Error deleting resume:", error);
        setLoading(false);
      }
    }
  };
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Generated Resumes</h1>
        <Button onClick={() => navigate("/resume-generator")}>
          Generate New
        </Button>
      </div>
      {loading && resumes.length === 0 && (
        <div className="text-gray-500">Loading resumes...</div>
      )}
      {!loading && resumes.length === 0 && (
        <div className="text-gray-500">No resumes generated yet.</div>
      )}
      <div className="space-y-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded shadow p-4"
          >
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
                    handleDelete(resume.id);
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
  );
}
