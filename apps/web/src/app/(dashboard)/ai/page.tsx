"use client";



export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

const SUGGESTIONS = [
  "How are my sales?",
  "Show low stock items",
  "Employee headcount",
  "Recent invoices",
];

export default function AIPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; data?: any }[]>([
    { role: "assistant", content: "Hello! I'm your SmartERP AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => api.post<any>("/ai/chat", { message }),
    onSuccess: (res) => {
      const reply = res.data || res;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.message || reply.text || JSON.stringify(reply), data: reply.data || reply.tables || undefined },
      ]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const handleSend = (text: string) => {
    if (!text.trim() || mutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    mutation.mutate(text);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask anything about your business</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 rounded-lg border bg-card p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.data && (
                <div className="mt-2 space-y-2 border-t pt-2">
                  {Array.isArray(msg.data) ? (
                    msg.data.length > 0 && typeof msg.data[0] === "object" ? (
                      <div className="overflow-x-auto rounded-md border bg-background">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              {Object.keys(msg.data[0]).map((key) => (
                                <th key={key} className="p-2 font-medium capitalize">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {msg.data.map((row: any, ri: number) => (
                              <tr key={ri}>
                                {Object.values(row).map((val: any, ci: number) => (
                                  <td key={ci} className="p-2">{typeof val === "object" ? JSON.stringify(val) : String(val ?? "-")}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {msg.data.map((item: any, ri: number) => (
                          <span key={ri} className="rounded-md bg-background px-2 py-1 text-xs">{typeof item === "object" ? JSON.stringify(item) : String(item)}</span>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="rounded-md bg-background p-3 text-xs">{JSON.stringify(msg.data, null, 2)}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {mutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted px-4 py-2">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSend(suggestion)}
            disabled={mutation.isPending}
            className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(input); }}
          placeholder="Ask the AI assistant..."
          disabled={mutation.isPending}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim() || mutation.isPending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

