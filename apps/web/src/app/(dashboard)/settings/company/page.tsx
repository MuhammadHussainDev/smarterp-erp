"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const { data: company, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: () => api.get<any>("/companies/current"),
  });

  const [form, setForm] = useState<any>({});

  const mutation = useMutation({
    mutationFn: (data: any) => api.patch("/companies/current", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  const values = Object.keys(form).length ? form : company;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Company Name</label>
            <input name="name" defaultValue={values.name} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Tax Number</label>
            <input name="taxNumber" defaultValue={values.taxNumber || ""} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Currency</label>
            <input name="currency" defaultValue={values.currency} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Timezone</label>
            <input name="timezone" defaultValue={values.timezone} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>

        {mutation.isSuccess && (
          <p className="text-sm text-green-600">Settings saved successfully</p>
        )}
      </form>
    </div>
  );
}

