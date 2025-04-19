import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileComponent from "~/components/profile";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/profile?email=${encodeURIComponent(user.email)}`)
      .then(async (res) => {
        if (res.ok) return res.json();
        // If not found, use default from user context
        return { name: user.name, email: user.email, role: user.role };
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, [user]);

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

  if (!user) return <div className="p-8">Please login.</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 overflow-y-auto py-8 px-4 md:px-8 max-w-3xl mx-auto">
      <ProfileComponent initialProfile={profile} />
    </div>
  );
}