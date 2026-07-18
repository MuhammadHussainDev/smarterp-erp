"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface SmartSuggestionsProps {
  context: "product" | "customer" | "price";
  data?: any;
}

export default function SmartSuggestions({ context, data }: SmartSuggestionsProps) {
  const { data: result, isLoading } = useQuery({
    queryKey: ["ai-suggestions", context, data],
    queryFn: () => api.get<any>(`/ai/suggestions/${context}`),
    enabled: !!context,
  });

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!result) return null;

  const items = Array.isArray(result) ? result : result.data || result.suggestions || [];

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((suggestion: string | { label: string; value?: string }, i: number) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {typeof suggestion === "string" ? suggestion : suggestion.label}
        </span>
      ))}
    </div>
  );
}
