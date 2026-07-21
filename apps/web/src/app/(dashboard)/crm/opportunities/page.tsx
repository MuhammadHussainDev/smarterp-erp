"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const stageColors: Record<string, string> = {
  PROSPECTING: "bg-slate-100", QUALIFICATION: "bg-blue-50",
  PROPOSAL: "bg-purple-50", NEGOTIATION: "bg-amber-50",
  CLOSED_WON: "bg-green-50", CLOSED_LOST: "bg-red-50",
};

const stageLabels: Record<string, string> = {
  PROSPECTING: "Prospecting", QUALIFICATION: "Qualification",
  PROPOSAL: "Proposal", NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won", CLOSED_LOST: "Closed Lost",
};

export default function OpportunitiesPage() {
  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ["pipeline"],
    queryFn: () => api.get<any>("/crm/opportunities/pipeline"),
  });

  const pipeline = Array.isArray(pipelineData) ? pipelineData : pipelineData?.data ?? [];

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
        <p className="text-sm text-muted-foreground">Track opportunities through the sales stages</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {pipeline?.map((stage: any) => (
          <div key={stage.stage} className={`rounded-lg border p-4 ${stageColors[stage.stage] || ""}`}>
            <h3 className="font-semibold text-sm">{stageLabels[stage.stage] || stage.stage}</h3>
            <p className="mt-1 text-2xl font-bold">${stage.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{stage.opportunities?.length || 0} deals</p>
            <div className="mt-3 space-y-2">
              {stage.opportunities?.map((opp: any) => (
                <div key={opp.id} className="rounded bg-white/80 p-2 text-xs shadow-sm">
                  <p className="font-medium">{opp.name}</p>
                  <p className="text-muted-foreground">{opp.customer?.name} — ${opp.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

