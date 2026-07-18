import { Injectable } from "@nestjs/common";

@Injectable()
export class ExportService {
  toCsv(
    data: Record<string, any>[],
    columns?: { key: string; label: string }[],
  ): string {
    if (!data || data.length === 0) return "";

    const cols = columns ?? Object.keys(data[0]).map((k) => ({ key: k, label: k }));

    const escape = (val: any): string => {
      const str = val == null ? "" : String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = cols.map((c) => escape(c.label)).join(",");
    const rows = data.map((row) => cols.map((c) => escape(row[c.key])).join(","));

    return "\uFEFF" + header + "\r\n" + rows.join("\r\n") + "\r\n";
  }

  toJson(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  generateFilename(prefix: string, format: string): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${prefix}-${y}${m}${d}.${format}`;
  }
}
