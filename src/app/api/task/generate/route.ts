import { NextRequest, NextResponse } from "next/server";

// ===== レートリミット =====
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 86400000; // 24h

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  cleanupRateLimit();
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const { goalTitle, goalDeadline, locale } = await request.json();

    if (!goalTitle || !goalDeadline) {
      return NextResponse.json({ error: "Missing goalTitle or goalDeadline" }, { status: 400 });
    }

    const lang = locale === "ja" ? "日本語" : locale === "zh" ? "中文" : locale === "ko" ? "한국어" : "English";

    const prompt = `You are a goal planning expert. Given a goal and its deadline, break it down into actionable milestones and tasks.

Goal: "${goalTitle}"
Deadline: ${goalDeadline}
Today: ${(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()}

Rules:
- Create 3-5 milestones that form a logical progression toward the goal
- Each milestone should have 2-4 concrete, actionable tasks
- Space milestone due dates evenly between now and the deadline
- Tasks should be specific enough to complete in 1-3 hours each
- Respond in ${lang}
- Set task priority: "high" for critical path items, "medium" for important but flexible, "low" for nice-to-have

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "milestones": [
    {
      "title": "Milestone title",
      "dueDate": "YYYY-MM-DD",
      "tasks": [
        { "title": "Task title", "priority": "high" | "medium" | "low" }
      ]
    }
  ]
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[generate] Anthropic API error:", response.status, err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    // JSONパース（コードブロックで囲まれている場合にも対応）
    const jsonStr = text.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[generate] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
