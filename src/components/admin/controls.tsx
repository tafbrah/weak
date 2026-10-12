"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { inputCls, selectCls } from "./ui";

/** Append the session token to API calls when running in cookie-less mode. */
function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

function AutoSelectInner({
  userId,
  field,
  value,
  options,
}: {
  userId: number;
  field: "role" | "status";
  value: string;
  options: { value: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <span className={`inline-flex items-center gap-1.5 ${pending ? "opacity-50" : ""}`}>
      <select
        key={current}
        defaultValue={current}
        disabled={pending}
        className={`${selectCls} cursor-pointer font-mono uppercase tracking-wider`}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setCurrent(next);
          startTransition(async () => {
            const res = await fetch(apiUrl(`/api/users/${userId}`), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ [field]: next }),
            });
            if (!res.ok) setCurrent(value);
            router.refresh();
          });
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3 w-3 animate-spin text-fog" />}
    </span>
  );
}

export function AutoSelect(props: {
  userId: number;
  field: "role" | "status";
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Suspense fallback={null}>
      <AutoSelectInner {...props} />
    </Suspense>
  );
}

function NewUserFormInner({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> Invite user
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            setError(null);
            startTransition(async () => {
              const res = await fetch(apiUrl("/api/users"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: fd.get("name"),
                  email: fd.get("email"),
                  role: fd.get("role"),
                  status: fd.get("status"),
                }),
              });
              const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
              if (!res.ok || !data.ok) {
                setError(data.error ?? "Could not create the user.");
                return;
              }
              form.reset();
              setOpen(false);
              router.refresh();
              onCreated?.();
            });
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">Invite a user</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Full name" className={inputCls} />
            <input name="email" type="email" required placeholder="email@company.com" className={inputCls} />
            <select name="role" defaultValue="member" className={inputCls}>
              <option value="admin">Admin — full console access</option>
              <option value="manager">Manager — modules & data</option>
              <option value="member">Member — standard access</option>
              <option value="viewer">Viewer — read only</option>
            </select>
            <select name="status" defaultValue="invited" className={inputCls}>
              <option value="invited">Invited — awaiting first login</option>
              <option value="active">Active — enabled immediately</option>
            </select>
            {error && (
              <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">
                {error}
              </p>
            )}
            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep disabled:opacity-60"
              >
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create user
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function NewUserForm({ onCreated }: { onCreated?: () => void }) {
  return (
    <Suspense fallback={null}>
      <NewUserFormInner onCreated={onCreated} />
    </Suspense>
  );
}

function LeadStageSelectInner({
  leadId,
  value,
  options,
}: {
  leadId: number;
  value: string;
  options: { value: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <span className={`inline-flex items-center gap-1.5 ${pending ? "opacity-50" : ""}`}>
      <select
        key={current}
        defaultValue={current}
        disabled={pending}
        className={`${selectCls} cursor-pointer font-mono uppercase tracking-wider`}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setCurrent(next);
          startTransition(async () => {
            const res = await fetch(apiUrl(`/api/leads/${leadId}`), {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: next }),
            });
            if (!res.ok) setCurrent(value);
            router.refresh();
          });
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3 w-3 animate-spin text-fog" />}
    </span>
  );
}

export function LeadStageSelect(props: {
  leadId: number;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Suspense fallback={null}>
      <LeadStageSelectInner {...props} />
    </Suspense>
  );
}

function DeleteLeadButtonInner({ leadId }: { leadId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      title="Delete registration"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch(apiUrl(`/api/leads/${leadId}`), { method: "DELETE" });
          router.refresh();
        });
      }}
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export function DeleteLeadButton({ leadId }: { leadId: number }) {
  return (
    <Suspense fallback={null}>
      <DeleteLeadButtonInner leadId={leadId} />
    </Suspense>
  );
}

function DeleteUserButtonInner({ userId }: { userId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      title="Delete user"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch(apiUrl(`/api/users/${userId}`), { method: "DELETE" });
          router.refresh();
        });
      }}
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export function DeleteUserButton({ userId }: { userId: number }) {
  return (
    <Suspense fallback={null}>
      <DeleteUserButtonInner userId={userId} />
    </Suspense>
  );
}
