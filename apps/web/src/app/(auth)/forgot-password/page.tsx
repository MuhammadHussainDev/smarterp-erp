"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api.post("/auth/forgot-password", { email });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <h1 className="text-3xl font-bold">Check Your Email</h1>
        <p className="text-sm text-muted-foreground">
          If an account with that email exists, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
