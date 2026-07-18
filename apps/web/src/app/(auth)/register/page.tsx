"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">SmartERP AI</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create your company account</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium">Company Name</label>
          <input name="companyName" value={form.companyName} onChange={handleChange} required
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
