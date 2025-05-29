import { useEffect, useState } from "react";
import ResumeList from "~/components/resume-list";
import { useAuth } from "~/contexts/AuthContext";
import { fetchWithAuth } from "~/utils/fetchWithAuth";

export default function ResumeRoute() {
	const [resume, setResume] = useState<any>(null);
	const [resumeList, setResumeList] = useState<any>(null);
	const { user, isLoggedIn, loading: authLoading } = useAuth();

	useEffect(() => {
		if (!user) {
			console.error("User not found");
			return;
		}
		fetchWithAuth(`/api/resume`, {
			method: "GET",
		})
			.then((res) => res.data)
			.then((data) => {
				setResume(data.resume);
			})
			.catch(() => {
				setResume({ name: user.name, email: user.email, role: user.role });
			});
		fetchWithAuth(`/api/resume/list`, {
			method: "GET",
		})
			.then((res) => res.data)
			.then((data) => {
				setResumeList(data.resumes);
			})
			.catch(() => {
				setResumeList([]);
			});
	}, [user, isLoggedIn, authLoading]);

	if (!isLoggedIn) return <div className="p-8">Please login.</div>;
	if (!resume || !resumeList) return <div className="p-8">Loading...</div>;

	return <ResumeList masterResume={resume} resumeList={resumeList} />;
}
