import "dotenv/config";
import i18nDict from "./i18n.json";
import { db } from "./index";
import { clients, languages, leads, payments, plans, runs, translations, users, workflows } from "./schema";

/** Deterministic PRNG so the demo data is stable between seeds. */
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function seedUsers(): Promise<boolean> {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) return false;
  const now = Date.now();
  const dayMs = 86_400_000;
  await db.insert(users).values([
    {
      name: "Lotte Bakker",
      email: "lotte@loopwerk.studio",
      role: "admin",
      status: "active",
      lastActiveAt: new Date(now - Math.floor(dayMs / 6)),
      createdAt: new Date(now - 210 * dayMs),
    },
    {
      name: "Jonas Weber",
      email: "jonas@loopwerk.studio",
      role: "manager",
      status: "active",
      lastActiveAt: new Date(now - Math.floor(dayMs / 3)),
      createdAt: new Date(now - 160 * dayMs),
    },
    {
      name: "Sofia Lindqvist",
      email: "sofia@loopwerk.studio",
      role: "member",
      status: "active",
      lastActiveAt: new Date(now - dayMs),
      createdAt: new Date(now - 90 * dayMs),
    },
    {
      name: "Ravi Anand",
      email: "ravi@parcelry.io",
      role: "member",
      status: "invited",
      lastActiveAt: null,
      createdAt: new Date(now - 5 * dayMs),
    },
    {
      name: "Daan Prinsen",
      email: "daan@atlasverz.nl",
      role: "viewer",
      status: "suspended",
      lastActiveAt: new Date(now - 40 * dayMs),
      createdAt: new Date(now - 140 * dayMs),
    },
  ]);
  return true;
}

async function seedPlans(): Promise<boolean> {
  const existing = await db.select({ id: plans.id }).from(plans).limit(1);
  if (existing.length > 0) return false;
  await db.insert(plans).values([
    { key: "starter", name: "Starter", price: 1900, blurb: "One high-value loop, built and monitored." },
    { key: "growth", name: "Growth", price: 4500, blurb: "A dedicated automation engineer + AI agents." },
    { key: "scale", name: "Scale", price: 0, blurb: "We run your whole ops layer on n8n." },
  ]);
  return true;
}

const I18N = i18nDict as Record<string, Record<string, string>>;



async function seedI18n(): Promise<boolean> {
  const existing = await db.select({ code: languages.code }).from(languages).limit(1);
  if (existing.length > 0) return false;
  await db.insert(languages).values([
    { code: "en", name: "English", isDefault: 1, enabled: 1 },
    { code: "fr", name: "Français", isDefault: 0, enabled: 1 },
  ]);
  for (const [code, entries] of Object.entries(I18N)) {
    await db.insert(translations).values(
      Object.entries(entries).map(([key, value]) => ({ languageCode: code, key, value })),
    );
  }
  return true;
}

async function seedPayments(): Promise<boolean> {
  const existing = await db.select({ id: payments.id }).from(payments).limit(1);
  if (existing.length > 0) return false;
  const now = Date.now();
  const dayMs = 86_400_000;
  const d = (days: number) => new Date(now - days * dayMs);
  await db.insert(payments).values([
    { customer: "Nordwind Logistics", email: "merel@nordwind-logistics.eu", description: "Growth retainer — monthly invoice #2024-041", amountCents: 450000, status: "succeeded", method: "card", gatewayRef: "pi_3PxK2mLkQ7aRstVw01", createdAt: d(38), paidAt: d(37) },
    { customer: "Nordwind Logistics", email: "merel@nordwind-logistics.eu", description: "Growth retainer — monthly invoice #2024-042", amountCents: 450000, status: "succeeded", method: "card", gatewayRef: "pi_3PxK9nMlR8bStuWx02", createdAt: d(8), paidAt: d(7) },
    { customer: "Nordwind Logistics", email: "merel@nordwind-logistics.eu", description: "Growth retainer — monthly invoice #2024-043", amountCents: 450000, status: "pending", method: "card", createdAt: d(1) },
    { customer: "Klarheit Health", email: "j.weber@klarheit.health", description: "Growth retainer — monthly invoice #2024-039", amountCents: 450000, status: "succeeded", method: "card", gatewayRef: "pi_3PxJ1kLmN5pQrsTu03", createdAt: d(42), paidAt: d(41) },
    { customer: "Klarheit Health", email: "j.weber@klarheit.health", description: "Growth retainer — monthly invoice #2024-040", amountCents: 450000, status: "succeeded", method: "card", gatewayRef: "pi_3PxJ8jKlM4oPqrSt04", createdAt: d(12), paidAt: d(11) },
    { customer: "Fjord & Co", email: "sofia@fjordco.se", description: "Starter retainer — monthly invoice #2024-038", amountCents: 190000, status: "succeeded", method: "card", gatewayRef: "pi_3PxH5gHiJ2lMnoPq05", createdAt: d(15), paidAt: d(14) },
    { customer: "Fjord & Co", email: "sofia@fjordco.se", description: "Starter retainer — monthly invoice #2024-044", amountCents: 190000, status: "pending", method: "card", createdAt: d(2) },
    { customer: "Parcelry", email: "ravi@parcelry.io", description: "Scale retainer — monthly invoice #2024-041", amountCents: 780000, status: "succeeded", method: "card", gatewayRef: "pi_3PxK4pQrS9cUvXyZ06", createdAt: d(6), paidAt: d(5) },
    { customer: "Atlas Verzekerd", email: "daan@atlasverz.nl", description: "Starter retainer — monthly invoice #2024-035", amountCents: 190000, status: "refunded", method: "card", gatewayRef: "pi_3PxE2mNoP6qRstUv07", createdAt: d(55), paidAt: d(54) },
    { customer: "Atlas Verzekerd", email: "daan@atlasverz.nl", description: "Starter retainer — retry invoice #2024-036", amountCents: 190000, status: "failed", method: "card", gatewayRef: "pi_3PxF3nOpQ7rStuVw08", createdAt: d(50) },
  ]);
  return true;
}

async function main() {
  const usersSeeded = await seedUsers();
  await seedPlans();
  await seedI18n();
  await seedPayments();

  const existing = await db.select({ id: workflows.id }).from(workflows).limit(1);
  if (existing.length > 0) {
    console.log(`Workflows already seeded — skipping. Users seeded: ${usersSeeded}.`);
    return;
  }

  const rand = mulberry32(20260214);

  const wfRows = await db
    .insert(workflows)
    .values([
      {
        name: "Inbound lead triage agent",
        description: "Scores, enriches and routes every inbound lead to the right rep in Slack.",
        category: "Sales",
        status: "active",
        nodes: 14,
      },
      {
        name: "Invoice OCR → ERP sync",
        description: "Reads supplier PDFs, extracts line items and posts them into Exact.",
        category: "Finance",
        status: "active",
        nodes: 11,
      },
      {
        name: "Support ticket classifier",
        description: "Classifies and drafts replies for tier-1 tickets, escalates edge cases.",
        category: "Support",
        status: "active",
        nodes: 17,
      },
      {
        name: "Contract review copilot",
        description: "Flags risky clauses in incoming MSAs and routes to legal for approval.",
        category: "Legal",
        status: "active",
        nodes: 12,
      },
      {
        name: "Content repurpose pipeline",
        description: "Turns webinar recordings into clipped posts, threads and newsletters.",
        category: "Marketing",
        status: "paused",
        nodes: 19,
      },
      {
        name: "Churn-risk weekly digest",
        description: "Aggregates product usage signals and emails a churn-risk digest to CS.",
        category: "RevOps",
        status: "draft",
        nodes: 8,
      },
    ])
    .returning();

  const active = wfRows.filter((w) => w.status === "active");
  const now = Date.now();
  const dayMs = 86_400_000;

  type RunRow = typeof runs.$inferInsert;
  const runRows: RunRow[] = [];
  const lastRun = new Map<number, Date>();

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    for (const wf of active) {
      const count = Math.floor(rand() * 22) + 6;
      for (let i = 0; i < count; i++) {
        const ranAt = new Date(now - dayOffset * dayMs + Math.floor(rand() * dayMs * 0.8));
        const failed = rand() < 0.055;
        runRows.push({
          workflowId: wf.id,
          status: failed ? "failed" : "success",
          durationMs: Math.floor(400 + rand() * 7600),
          ranAt,
        });
        const prev = lastRun.get(wf.id);
        if (!prev || ranAt > prev) lastRun.set(wf.id, ranAt);
      }
    }
  }

  for (let i = 0; i < runRows.length; i += 250) {
    await db.insert(runs).values(runRows.slice(i, i + 250));
  }

  const { eq } = await import("drizzle-orm");
  for (const wf of wfRows) {
    const last = lastRun.get(wf.id);
    if (last) {
      await db.update(workflows).set({ lastRunAt: last }).where(eq(workflows.id, wf.id));
    }
  }

  await db.insert(leads).values([
    {
      name: "Merel van Dijk",
      email: "merel@nordwind-logistics.eu",
      company: "Nordwind Logistics",
      budget: "€5–10k / month",
      message: "Our quoting process takes 6 hours per request. We want an agent on it.",
      status: "won",
      createdAt: new Date(now - 26 * dayMs),
    },
    {
      name: "Jonas Weber",
      email: "j.weber@klarheit.health",
      company: "Klarheit Health",
      budget: "€2–5k / month",
      message: "Patient intake forms are re-keyed by hand into our HIS. Need OCR + sync.",
      status: "qualified",
      createdAt: new Date(now - 9 * dayMs),
    },
    {
      name: "Sofia Lindqvist",
      email: "sofia@fjordco.se",
      company: "Fjord & Co",
      budget: "€2–5k / month",
      message: "Weekly client reporting eats two full days. Want it automated end-to-end.",
      status: "contacted",
      createdAt: new Date(now - 4 * dayMs),
    },
    {
      name: "Ravi Anand",
      email: "ravi@parcelry.io",
      company: "Parcelry",
      budget: "€10k+ / month",
      message: "Looking for a partner to run our whole ops layer on n8n with AI agents.",
      status: "new",
      createdAt: new Date(now - 1 * dayMs),
    },
    {
      name: "Claire Fontaine",
      email: "claire@maisonbrique.fr",
      company: "Maison Brique",
      budget: "Not sure yet",
      message: "Curious what AI automation could do for our order desk.",
      status: "new",
      createdAt: new Date(now - Math.floor(dayMs / 3)),
    },
    {
      name: "Tom Okafor",
      email: "tom@brightledger.co",
      company: "BrightLedger",
      budget: "< €2k / month",
      message: "Small bookkeeping firm; want bank-feed categorisation automated.",
      status: "lost",
      createdAt: new Date(now - 14 * dayMs),
    },
    {
      name: "Sanne de Vries",
      email: "sanne@windmolenpharma.nl",
      company: "Windmolen Pharma",
      budget: "€2–5k / month",
      message: [
        "AUDIT REQUEST — 10-step project questionnaire",
        "1. Contact: Sanne de Vries <sanne@windmolenpharma.nl>",
        "2. Company: Windmolen Pharma · role: Operations · team: 51 – 250",
        "3. Industry: Healthcare · tools: Gmail / Outlook, Excel / Google Sheets, ERP (Exact, SAP…)",
        "4. Processes: Documents & data entry, Invoicing & finance",
        "5. Description: Supplier invoices arrive by mail and get re-keyed by hand into Exact, then matched against purchase orders by two people. (currently: 100% manual today)",
        "6. Volume: 50 – 200 / week · 10 – 30 min per run · est. ≈ 180 h/month",
        "7. Budget: €2–5k / month · timeline: Within 1 – 3 months",
        "8. Goals: Save team hours, Eliminate errors",
        "9. Automation level: Nothing automated yet · compliance: Self-hosted / EU hosting required",
        "10. Preferred slot: Weekday morning",
      ].join("\n"),
      status: "new",
      createdAt: new Date(now - Math.floor(dayMs / 4)),
    },
    {
      name: "Marco Ricci",
      email: "marco@bottegaretail.it",
      company: "Bottega Retail",
      budget: "€5–10k / month",
      message: [
        "AUDIT REQUEST — 10-step project questionnaire",
        "1. Contact: Marco Ricci <marco@bottegaretail.it>",
        "2. Company: Bottega Retail · role: Founder / CEO · team: 11 – 50",
        "3. Industry: E-commerce & retail · tools: Shopify, HubSpot / CRM, WhatsApp / Telegram",
        "4. Processes: Lead handling & follow-up, Support tickets, Reporting & dashboards",
        "5. Description: Every morning the team copies Shopify orders into the CRM, answers the same 20 support questions and builds a sales report by hand. (currently: Semi-manual (templates / macros))",
        "6. Volume: 200 – 1,000 / week · 2 – 10 min per run · est. ≈ 209 h/month",
        "7. Budget: €5–10k / month · timeline: ASAP — this is hurting now",
        "8. Goals: Save team hours, Scale without hiring, Respond faster to customers",
        "9. Automation level: Some Zapier / Make zaps · compliance: Standard cloud is fine",
        "10. Preferred slot: Flexible — email me options",
      ].join("\n"),
      status: "contacted",
      createdAt: new Date(now - dayMs),
    },
  ]);

  await db.insert(clients).values([
    {
      company: "Nordwind Logistics",
      contact: "Merel van Dijk",
      email: "merel@nordwind-logistics.eu",
      plan: "growth",
      status: "active",
      mrr: 4500,
      startDate: new Date(now - 95 * dayMs),
    },
    {
      company: "Klarheit Health",
      contact: "Jonas Weber",
      email: "j.weber@klarheit.health",
      plan: "growth",
      status: "active",
      mrr: 4500,
      startDate: new Date(now - 61 * dayMs),
    },
    {
      company: "Fjord & Co",
      contact: "Sofia Lindqvist",
      email: "sofia@fjordco.se",
      plan: "starter",
      status: "active",
      mrr: 1900,
      startDate: new Date(now - 34 * dayMs),
    },
    {
      company: "Parcelry",
      contact: "Ravi Anand",
      email: "ravi@parcelry.io",
      plan: "scale",
      status: "onboarding",
      mrr: 7800,
      startDate: new Date(now - 6 * dayMs),
    },
    {
      company: "Atlas Verzekerd",
      contact: "Daan Prinsen",
      email: "daan@atlasverz.nl",
      plan: "starter",
      status: "paused",
      mrr: 1900,
      startDate: new Date(now - 140 * dayMs),
    },
  ]);

  const runCount = await db.select({ c: runs.id }).from(runs);
  console.log(`Seeded: ${wfRows.length} workflows, ${runCount.length} runs, 6 leads, 5 clients.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
