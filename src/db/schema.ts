import { integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
]);

export const workflowStatusEnum = pgEnum("workflow_status", ["active", "paused", "draft"]);

export const clientPlanEnum = pgEnum("client_plan", ["starter", "growth", "scale"]);

export const clientStatusEnum = pgEnum("client_status", [
  "onboarding",
  "active",
  "paused",
  "churned",
]);

export const runStatusEnum = pgEnum("run_status", ["success", "failed"]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  customer: text("customer").notNull(),
  email: text("email").notNull().default(""),
  description: text("description").notNull().default(""),
  /** Amount in cents. */
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  method: text("method").notNull().default("card"),
  gatewayRef: text("gateway_ref").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const conferenceStatusEnum = pgEnum("conference_status", [
  "scheduled",
  "live",
  "done",
  "cancelled",
]);

export const conferences = pgTable("conferences", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull().default(""),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  meetLink: text("meet_link").notNull().default(""),
  notes: text("notes").notNull().default(""),
  participants: text("participants").notNull().default(""),
  status: conferenceStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messageKindEnum = pgEnum("message_kind", ["email", "sms"]);

export const messageStatusEnum = pgEnum("message_status", [
  "draft",
  "scheduled",
  "sent",
  "delivered",
  "failed",
]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  kind: messageKindEnum("kind").notNull().default("email"),
  subject: text("subject").notNull().default(""),
  body: text("body").notNull().default(""),
  recipientName: text("recipient_name").notNull().default(""),
  recipientEmail: text("recipient_email").notNull().default(""),
  recipientPhone: text("recipient_phone").notNull().default(""),
  clientName: text("client_name").notNull().default(""),
  status: messageStatusEnum("status").notNull().default("draft"),
  provider: text("provider").notNull().default(""),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  kind: messageKindEnum("kind").notNull().default("email"),
  name: text("name").notNull(),
  subject: text("subject").notNull().default(""),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cacheEntries = pgTable("cache_entries", {
  id: serial("id").primaryKey(),
  cacheKey: text("cache_key").notNull(),
  store: text("store").notNull().default("redis"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  ttlSec: integer("ttl_sec").notNull().default(3600),
  hits: integer("hits").notNull().default(0),
  misses: integer("misses").notNull().default(0),
  status: text("status").notNull().default("active"),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accountStatusEnum = pgEnum("account_status", ["active", "locked"]);

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  status: accountStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose").notNull().default("login"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: integer("used").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default("Member"),
  email: text("email").notNull().default(""),
  photoUrl: text("photo_url").notNull().default(""),
  bio: text("bio").notNull().default(""),
  skills: text("skills").notNull().default(""),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cookieCategories = pgTable("cookie_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  required: integer("required").notNull().default(0),
  enabled: integer("enabled").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cookies = pgTable("cookies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => cookieCategories.id),
  provider: text("provider").notNull().default(""),
  purpose: text("purpose").notNull().default(""),
  duration: text("duration").notNull().default(""),
  dataTypes: text("data_types").notNull().default(""),
  thirdParty: integer("third_party").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "member", "viewer"]);

export const cmsContent = pgTable("cms_content", {
  id: serial("id").primaryKey(),
  contentKey: text("content_key").notNull().unique(),
  section: text("section").notNull(),
  label: text("label").notNull(),
  content: text("content").notNull().default(""),
  contentType: text("content_type").notNull().default("text"),
  enabled: integer("enabled").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cmsPages = pgTable("cms_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  published: integer("published").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditFormFields = pgTable("audit_form_fields", {
  id: serial("id").primaryKey(),
  step: integer("step").notNull().default(1),
  fieldKey: text("field_key").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull().default("text"),
  options: text("options").notNull().default(""),
  placeholder: text("placeholder").notNull().default(""),
  required: integer("required").notNull().default(0),
  enabled: integer("enabled").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userStatusEnum = pgEnum("user_status", ["active", "invited", "suspended"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").notNull().default("member"),
  status: userStatusEnum("status").notNull().default("active"),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull().default(""),
  budget: text("budget").notNull().default("Not sure yet"),
  message: text("message").notNull().default(""),
  status: leadStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** n8n template generated from the questionnaire brief (by Claude or rules). */
  templateSummary: text("template_summary"),
  templateJson: text("template_json"),
  templateSource: text("template_source"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  /** State of the push to the n8n instance via its API. */
  n8nWorkflowId: text("n8n_workflow_id"),
  n8nPushedAt: timestamp("n8n_pushed_at", { withTimezone: true }),
  n8nError: text("n8n_error"),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("Operations"),
  status: workflowStatusEnum("status").notNull().default("draft"),
  nodes: integer("nodes").notNull().default(0),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  plan: clientPlanEnum("plan").notNull().default("starter"),
  status: clientStatusEnum("status").notNull().default("onboarding"),
  mrr: integer("mrr").notNull().default(0),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  /** Subscription details. */
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  nextRenewal: timestamp("next_renewal", { withTimezone: true }),
});

export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  status: runStatusEnum("status").notNull().default("success"),
  durationMs: integer("duration_ms").notNull().default(0),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Key/value store for console-managed API configuration (n8n, Claude…). */
export const configuration = pgTable("configuration", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Languages available on the frontend. */
export const languages = pgTable("languages", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  isDefault: integer("is_default").notNull().default(0),
  enabled: integer("enabled").notNull().default(1),
});

/** Frontend translations, keyed per language. */
export const translations = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    languageCode: text("language_code")
      .notNull()
      .references(() => languages.code, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull().default(""),
  },
  (table) => [
    { uniq: uniqueIndex("translations_lang_key_uniq").on(table.languageCode, table.key) },
  ],
);

/** Subscription packages — prices are editable from the console. */
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  /** Monthly price in EUR. 0 means "custom pricing". */
  price: integer("price").notNull().default(0),
  blurb: text("blurb").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
