import { useEffect, useState } from "react";
import ResumeSection from "@project/remix/app/components/resume/resume-section";
import { Button } from "@project/remix/app/components/ui/button";
import { EResumeSteps } from "@project/remix/app/types/resume";
import { fetchWithAuth } from "@project/remix/app/utils/fetchWithAuth";

function getQueryParam(name: string) {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default function ResumeGeneratorDetail() {
  const [resume, setResume] = useState(null);
  const [resumeStep, setResumeStep] = useState<EResumeSteps>(EResumeSteps.CONTACT);
  const id = getQueryParam("id");
  console.log("ResumeGeneratorDetail() :: resume:", resume);

  useEffect(() => {
    async function fetchResume() {
      if (!id) return;
      const res = await fetchWithAuth(`/api/resume/${id}`);
      if (res.data?.resume) {
        setResume(res.data.resume);
      }
    }
    fetchResume();
  }, [id]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Button
        variant="link"
        onClick={() => window.history.back()}
      >
        &larr; Back to list
      </Button>
      {resume ? (
        <ResumeSection resume={resume} />
      ) : (
        <div>resume not found.</div>
      )}
    </div>
  );
}
