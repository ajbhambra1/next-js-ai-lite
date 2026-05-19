import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SurveyPayload = {
  name?: string;
  email?: string;
  phone?: string;
  practice?: string;
  practicesOwned?: string;
  bothered?: string;
  wishKnew?: string;
  useful?: string[];
  mostImportant?: string | null;
  monthlyCost?: string | null;
  missing?: string;
  pilot?: "yes" | "no" | null;
  ts?: string;
};

export async function POST(request: Request) {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!url) {
    console.error("GOOGLE_APPS_SCRIPT_URL is not set");
    return NextResponse.json(
      { ok: false, error: "Form receiver not configured" },
      { status: 500 }
    );
  }

  let data: SurveyPayload;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!data.name?.trim() || !data.email?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      redirect: "follow",
    });

    if (!upstream.ok) {
      throw new Error(`Upstream returned ${upstream.status}`);
    }

    const result = await upstream.json().catch(() => ({ ok: true }));
    return NextResponse.json(result);
  } catch (err) {
    console.error("Survey submission failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not record submission" },
      { status: 502 }
    );
  }
}
