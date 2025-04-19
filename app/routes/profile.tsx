import { useEffect, useState } from "react";
import localforage from "../utils/localforage";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    localforage.getItem(`profile_${user.id}`).then((data) => {
      setProfile(data || { name: user.name, email: user.email, role: user.role });
      setLoading(false);
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await localforage.setItem(`profile_${user.id}`, profile);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (!user) return <div className="p-8">Please login.</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Full Name"
        />
        <input
          name="email"
          value={profile.email}
          disabled
          className="input input-bordered w-full bg-gray-100"
          placeholder="Email"
        />
        <input
          name="role"
          value={profile.role}
          disabled
          className="input input-bordered w-full bg-gray-100"
          placeholder="Role"
        />
        <textarea
          name="summary"
          value={profile.summary || ""}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Professional Summary"
        />
        <input
          name="location"
          value={profile.location || ""}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Location"
        />
        <input
          name="linkedin"
          value={profile.linkedin || ""}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="LinkedIn URL"
        />
        <button type="submit" className="btn btn-primary w-full">Save</button>
        {success && <div className="text-green-600">Profile saved!</div>}
      </form>
    </div>
  );
}