"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const stageColors: Record<string, string> = {
  LEAD: "bg-slate-100", PROSPECTING: "bg-slate-100", QUALIFICATION: "bg-blue-50",
  PROPOSAL: "bg-purple-50", NEGOTIATION: "bg-amber-50",
  CLOSED_WON: "bg-green-50", CLOSED_LOST: "bg-red-50",
};

const stageLabels: Record<string, string> = {
  LEAD: "Lead", PROSPECTING: "Prospecting", QUALIFICATION: "Qualification",
  PROPOSAL: "Proposal", NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won", CLOSED_LOST: "Closed Lost",
};

export default function OpportunitiesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", customerId: "", stage: "LEAD", amount: "", probability: "", expectedCloseDate: "" });

  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => api.get<any>("/crm/opportunities/pipeline"),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<any>("/crm/customers"),
    enabled: showForm,
  });

  const pipeline = Array.isArray(pipelineData) ? pipelineData : pipelineData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/crm/opportunities", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pipeline"] }); setShowForm(false); setForm({ title: "", customerId: "", stage: "LEAD", amount: "", probability: "", expectedCloseDate: "" }); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track opportunities through the sales stages</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Opportunity"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ title: form.title, customer: form.customerId || undefined, stage: form.stage, amount: Number(form.amount) || 0, probability: Number(form.probability) || 0, expected_close_date: form.expectedCloseDate || undefined }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder="Opportunity title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select customer</option>
              {customersData?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              {Object.entries(stageLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Expected close date" type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {createMutation.isPending ? "Creating..." : "Create Opportunity"}
          </button>
        </form>
      )}

      {pipeline.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No opportunities yet</p>
          <p className="mt-1 text-sm">Create your first opportunity to start tracking your sales pipeline.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {pipeline.map((stage: any) => (
            <div key={stage.stage} className={`rounded-lg border p-4 ${stageColors[stage.stage] || ""}`}>
              <h3 className="font-semibold text-sm">{stageLabels[stage.stage] || stage.stage}</h3>
              <p className="mt-1 text-2xl font-bold">${Number(stage.total || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stage.opportunities?.length || 0} deals</p>
              <div className="mt-3 space-y-2">
                {stage.opportunities?.map((opp: any) => (
                  <div key={opp.id} className="rounded bg-white/80 p-2 text-xs shadow-sm">
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-muted-foreground">{opp.customer_name || opp.customer?.name || "—"} — ${Number(opp.amount || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
