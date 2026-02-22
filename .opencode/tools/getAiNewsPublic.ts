import { tool } from "@opencode-ai/plugin"

const BASE_URL = "http://47.245.111.142:18881"

export default tool({
  description: [
    "Fetch a paginated list of AI news records from the public aiNews API by createdAt time range (UTC).",
    "Use this to retrieve news items for a specific day or interval before generating summaries/reports.",
    "",
    "HTTP:",
    "  GET /aiNews/getAiNewsPublic?startCreatedAt=...&endCreatedAt=...&page=...&pageSize=...",
    "",
    "Returns (normalized by this tool):",
    "  {",
    '    "page": number,',
    '    "pageSize": number,',
    '    "total": number,',
    '    "list": NewsItem[]',
    "  }",
    "",
    "NewsItem fields (as returned by upstream API):",
    "  - id: number",
    "  - titleZh: string | null",
    "  - titleEn: string | null",
    "  - url: string",
    "  - website: string",
    "  - publishDate: string (ISO-8601 with timezone, e.g. 2026-02-21T00:00:00+08:00)",
    "  - author: string",
    "  - tags: string (may be a delimited string)",
    "  - contentSummaryZh: string | null",
    "  - contentSummaryEn: string | null",
    "  - aiSummaryZh: string | null",
    "  - aiSummaryEn: string | null",
    "  - matchType: string",
    "  - crawlTime: string (ISO-8601 with timezone)",
    "  - createdAt: string (ISO-8601 with timezone)",
    "  - updatedAt: string (ISO-8601 with timezone)",
    "",
    "Notes:",
    "  - The upstream response shape is: { code: number, msg: string, data: { list, total, page, pageSize } }.",
    "  - This tool throws if code != 0 or if the HTTP status is not OK.",
  ].join("\n"),
  args: {
    startCreatedAt: tool.schema
      .string()
      .describe(
        "Start of the createdAt time range (inclusive). ISO-8601 timestamp, e.g. 2026-02-21T00:00:00Z.",
      ),
    endCreatedAt: tool.schema
      .string()
      .describe(
        "End of the createdAt time range (inclusive). ISO-8601 timestamp, e.g. 2026-02-21T23:59:59Z.",
      ),
    page: tool.schema.number().int().min(1).describe("Pagination page number (1-based)."),
    pageSize: tool.schema.number().int().min(1).max(200).describe("Number of items per page (max 200)."),
  },

  async execute(args) {
    const url = new URL("/aiNews/getAiNewsPublic", BASE_URL)
    url.searchParams.set("startCreatedAt", args.startCreatedAt)
    url.searchParams.set("endCreatedAt", args.endCreatedAt)
    url.searchParams.set("page", String(args.page))
    url.searchParams.set("pageSize", String(args.pageSize))

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    const text = await res.text()

    if (!res.ok) {
      throw new Error(`aiNews.getAiNewsPublic failed: ${res.status} ${res.statusText}\n${text}`)
    }

    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      throw new Error(`aiNews.getAiNewsPublic: upstream returned non-JSON response:\n${text}`)
    }

    if (typeof json?.code !== "number") {
      throw new Error(`aiNews.getAiNewsPublic: unexpected upstream JSON (missing code):\n${text}`)
    }

    if (json.code !== 0) {
      const msg = typeof json?.msg === "string" ? json.msg : "unknown error"
      throw new Error(`aiNews.getAiNewsPublic: upstream error code=${json.code}, msg=${msg}`)
    }

    const data = json?.data ?? {}
    return {
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
      list: Array.isArray(data.list) ? data.list : [],
    }
  },
})

// http://47.245.111.142:18881/aiNews/getAiNewsPublic?startCreatedAt=2026-02-21&endCreatedAt=2026-02-21&page=1&pageSize=1
