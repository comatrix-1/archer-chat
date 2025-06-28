import React, { useEffect, useState } from "react";
import ResumeComponent from "~/components/resume";
import { ResumeSection } from "~/components/resume/resume-section";
import { Button } from "~/components/ui/button";
import { EResumeSteps } from "~/lib/constants";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

function getQueryParam(name: string) {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default function ResumeGeneratorDetail() {
  const [resume, setResume] = useState<any>(null);
  const [resumeStep, setResumeStep] = useState<EResumeSteps>(EResumeSteps.PERSONAL);
  const id = getQueryParam("id");
  console.log("ResumeGeneratorDetail() :: resume:", resume);

  useEffect(() => {
    async function fetchResume() {
      if (!id) return;
      const res = await fetchWithAuth(`/api/resume/${id}`);
      if (res.data && res.data.resume) {
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
        // <ResumeComponent initialResume={resume} />
        <ResumeSection initialResume={resume} resumeStep={resumeStep} />
      ) : (
        <div>resume not found.</div>
      )}
    </div>
  );
}
