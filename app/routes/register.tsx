import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"JOBSEEKER" | "RECRUITER">("JOBSEEKER");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register({ email, password, name, role, confirmPassword });
    if (ok) {
      navigate("/resume");
    } else {
      setError("Email already registered");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          type="text"
          placeholder="Name"
          className="input input-bordered w-full mb-2"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full mb-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="input input-bordered w-full mb-4"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              name="role"
              value="JOBSEEKER"
              checked={role === "JOBSEEKER"}
              onChange={() => setRole("JOBSEEKER")}
            /> Jobseeker
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="RECRUITER"
              checked={role === "RECRUITER"}
              onChange={() => setRole("RECRUITER")}
            /> Recruiter
          </label>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Register
        </button>
        <div className="mt-2 text-sm text-center">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
}