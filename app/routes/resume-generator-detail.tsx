import React, { useEffect, useState } from 'react';
// Remove useNavigate/useSearchParams and use window.location for navigation
import { fetchWithAuth } from '~/utils/fetchWithAuth';
import ResumeComponent from '~/components/resume';

function getQueryParam(name: string) {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default function ResumeGeneratorDetail() {
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const id = getQueryParam('id');

  useEffect(() => {
    async function fetchResume() {
      if (!id) return;
      setLoading(true);
      const res = await fetchWithAuth(`/api/resume/${id}`);
      if (res.data && res.data.resume) {
        setResume(res.data.resume);
      }
      setLoading(false);
    }
    fetchResume();
  }, [id]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button className="mb-4 text-blue-500" onClick={() => window.history.back()}>&larr; Back to list</button>
      {loading ? (
        <div>Loading...</div>
      ) : resume ? (
        <ResumeComponent initialResume={resume} />
      ) : (
        <div>resume not found.</div>
      )}
    </div>
  );
}
