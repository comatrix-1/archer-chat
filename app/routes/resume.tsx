import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ResumeComponent from "~/components/resume";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function resume() {
  const { user, isLoggedIn } = useAuth();
  const [resume, setResume] = useState<any>(null);
  console.log('resume() :: resume: ', resume);


  useEffect(() => {
    if (!user) return;
    fetchWithAuth(`/api/resume?email=${encodeURIComponent(user.email)}`, { method: 'GET' })
      .then((res) => res.data)
      .then((data) => {
        setResume(data.resume);
      })
      .catch(() => {
        setResume({ name: user.name, email: user.email, role: user.role });
      });
  }, []);

  // TODO: implement methods
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setResume({ ...resume, [e.target.name]: e.target.value });
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!user) return;
  //   const method = resume.id ? "PUT" : "POST";
  //   const res = await fetch("/api/resume", {
  //     method,
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(resume),
  //   });
  //   if (res.ok) {
  //     setSuccess(true);
  //     setTimeout(() => setSuccess(false), 2000);
  //   }
  // };

  if (!isLoggedIn) return <div className="p-8">Please login.</div>;
  if (!resume) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto py-8 px-4 md:px-8 max-w-3xl mx-auto">
      <ResumeComponent initialResume={resume} />
    </div>
  );
}