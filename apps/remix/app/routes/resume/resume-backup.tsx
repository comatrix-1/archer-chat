import { trpc } from "@project/trpc/client";
import { useEffect, useState } from "react";
import ResumeList from "~/components/resume-list";
import { useAuth } from "~/contexts/AuthContext";
import { fetchWithAuth } from "~/utils/fetchWithAuth";
import type { Route } from "./+types/index";

export default function ResumeRoute() {
  // const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const [resumeList, setResumeList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.error("User not found");
      return;
    }
    const fetchData = async () => {
      try {
        const resmumeList = await trpc.resume.list.query();
        console.log("resmumeList:", resmumeList);

        // const resumeRes = await fetchWithAuth("/api/resume", { method: "GET" });
        // const resumeListRes = await fetchWithAuth("/api/resume/list", {
        //   method: "GET",
        // });

        // const resumeData = resumeRes.data;
        // const resumeListData = resumeListRes.data;

        // setMasterResumeId(resumeData.resume.id);
        // setResumeList(resumeListData.resumes);
      } catch (error) {
        console.error("Error in fetchData: ", error);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="p-8">Please login.</div>;
  if (!resumeList)
    return <div className="p-8">Loading...</div>;

  return <ResumeList masterResumeId={null} resumeList={resumeList} />;
}
