import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requestIsAuthed } from "@/lib/auth";
import { db } from "@/db";
import { cookieCategories, cookies } from "@/db/schema";

export async function GET(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const [categories, cookieList] = await Promise.all([
    db.select().from(cookieCategories).orderBy(asc(cookieCategories.name)),
    db.select().from(cookies).orderBy(asc(cookies.name)),
  ]);
  return NextResponse.json({ ok: true, categories, cookies: cookieList });
}

export async function POST(request: Request) {
  if (!(await requestIsAuthed(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const type = String(data.type ?? "");

  if (type === "category") {
    const name = String(data.name ?? "").trim();
    if (!name) return NextResponse.json({ ok: false, error: "Category name is required." }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const [row] = await db
      .insert(cookieCategories)
      .values({
        name,
        slug,
        description: String(data.description ?? "").trim(),
        required: data.required === true ? 1 : 0,
        enabled: data.enabled !== false ? 1 : 0,
      })
      .returning();

    return NextResponse.json({ ok: true, category: row }, { status: 201 });
  }

  if (type === "cookie") {
    const name = String(data.name ?? "").trim();
    if (!name) return NextResponse.json({ ok: false, error: "Cookie name is required." }, { status: 400 });

    const [row] = await db
      .insert(cookies)
      .values({
        name,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        provider: String(data.provider ?? "").trim(),
        purpose: String(data.purpose ?? "").trim(),
        duration: String(data.duration ?? "").trim(),
        dataTypes: String(data.dataTypes ?? "").trim(),
        thirdParty: data.thirdParty === true ? 1 : 0,
      })
      .returning();

    return NextResponse.json({ ok: true, cookie: row }, { status: 201 });
  }

  return NextResponse.json({ ok: false, error: "Invalid type. Use 'category' or 'cookie'." }, { status: 400 });
}
