import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { fetchWithAuth } from '~/utils/fetchWithAuth';

// Define the type for a resume item (can be shared or redefined if needed)
export interface ResumeItem {
  id: string;
  title: string;
  jobDescription: string;
  resume: string;
  coverLetter: string;
  conversation?: { // Use 'conversation' to match API response
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
  if (typeof window !== 'undefined') {
    // Assuming the detail route remains the same or adjust as needed
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
      const res = await fetchWithAuth('/api/resume/list');
      if (res.data && res.data.resumes) {
        setResumes(res.data.resumes);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      setLoading(true); // Indicate loading during delete
      try {
        await fetchWithAuth(`/api/resume/${id}`, {
          method: 'DELETE',
        });
        await fetchResumes(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting resume:', error);
        setLoading(false); // Ensure loading is turned off on error
      }
      // setLoading(false) is handled in fetchResumes' finally block
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Generated Resumes</h1>
        <Button onClick={() => navigate('/resume-generator')}>Generate New</Button>
      </div>
      {loading && resumes.length === 0 && <div className="text-gray-500">Loading resumes...</div>}
      {!loading && resumes.length === 0 && <div className="text-gray-500">No resumes generated yet.</div>}
      <div className="space-y-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded shadow p-4 hover:bg-gray-50 cursor-pointer" // Added cursor-pointer
            onClick={() => safeNavigateToDetail(resume.id)}
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg mb-1">
                {/* Use conversation.title from the API response */}
                {resume.conversation?.title || 'Untitled Conversation'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking delete
                  handleDelete(resume.id);
                }}
                disabled={loading} // Disable delete button while any loading is happening
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}