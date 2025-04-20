import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileComponent from "~/components/profile";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  console.log('Profile() :: profile: ', profile);


  useEffect(() => {
    if (!user) return;
    fetchWithAuth(`/api/profile?email=${encodeURIComponent(user.email)}`, { method: 'GET' })
      .then((res) => res.data)
      .then((data) => {
        setProfile(data.profile);
      })
      .catch(() => {
        setProfile({ name: user.name, email: user.email, role: user.role });
      });
  }, []);

  // TODO: implement methods
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setProfile({ ...profile, [e.target.name]: e.target.value });
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!user) return;
  //   const method = profile.id ? "PUT" : "POST";
  //   const res = await fetch("/api/profile", {
  //     method,
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(profile),
  //   });
  //   if (res.ok) {
  //     setSuccess(true);
  //     setTimeout(() => setSuccess(false), 2000);
  //   }
  // };

  if (!isLoggedIn) return <div className="p-8">Please login.</div>;
  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto py-8 px-4 md:px-8 max-w-3xl mx-auto">
      <ProfileComponent initialProfile={profile} />
    </div>
  );
}