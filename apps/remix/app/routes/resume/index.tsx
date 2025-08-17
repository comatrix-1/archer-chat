import { useEffect, useState } from "react";
import ResumeList from "~/components/resume-list";
import { useAuth } from "~/contexts/AuthContext";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

export default function ResumeRoute() {
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const [resumeList, setResumeList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.error("User not found");
      return;
    }
    const fetchData = async () => {
      try {
        const resumeRes = await fetchWithAuth("/api/resume", { method: "GET" });
        const resumeListRes = await fetchWithAuth("/api/resume/list", {
          method: "GET",
        });

        const resumeData = resumeRes.data;
        const resumeListData = resumeListRes.data;

        setMasterResumeId(resumeData.resume.id);
        setResumeList(resumeListData.resumes);
      } catch (error) {
        // handle error if needed
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="p-8">Please login.</div>;
  if (!masterResumeId || !resumeList)
    return <div className="p-8">Loading...</div>;

  return <ResumeList masterResumeId={masterResumeId} resumeList={resumeList} />;
}
