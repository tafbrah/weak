"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

export type FormField = {
  id: number;
  step: number;
  fieldKey: string;
  label: string;
  fieldType: string;
  options: string;
  placeholder: string;
  required: number;
  enabled: number;
  sortOrder: number;
};

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select (single)" },
  { value: "multiselect", label: "Multi-select" },
  { value: "checkbox", label: "Checkbox" },
];

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

export function AddFieldForm({ nextStep }: { nextStep: number }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-cream transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> Add field
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            const optionsText = String(fd.get("options") ?? "");
            const options = optionsText
              ? optionsText.split(",").map((o) => o.trim()).filter(Boolean)
              : [];
            fetch(apiUrl("/api/audit-form"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                step: Number(fd.get("step")),
                fieldKey: fd.get("fieldKey"),
                label: fd.get("label"),
                fieldType: fd.get("fieldType"),
                options,
                placeholder: fd.get("placeholder"),
                required: fd.get("required") === "on",
                enabled: true,
                sortOrder: Number(fd.get("sortOrder") ?? 0),
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the field.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the field."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">Add a form field</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Label *</label>
              <input name="label" required placeholder="e.g. Company website" className={field} />
            </div>
            <div>
              <label className={label}>Field key</label>
              <input name="fieldKey" placeholder="e.g. website" className={field} />
            </div>
            <div>
              <label className={label}>Step</label>
              <input name="step" type="number" min={1} max={10} defaultValue={nextStep} className={field} />
            </div>
            <div>
              <label className={label}>Field type</label>
              <select name="fieldType" className={field}>
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Options (comma-separated, for select/multiselect)</label>
              <input name="options" placeholder="Option 1, Option 2, Option 3" className={field} />
            </div>
            <div>
              <label className={label}>Placeholder</label>
              <input name="placeholder" placeholder="Placeholder text" className={field} />
            </div>
            <div>
              <label className={label}>Sort order</label>
              <input name="sortOrder" type="number" defaultValue={0} className={field} />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" name="required" id="field-required" className="h-4 w-4 accent-[#e4572e]" />
              <label htmlFor="field-required" className="text-sm text-fog">Required field</label>
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-cream hover:bg-ember-deep disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add field
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function DeleteFieldButton({ fieldId }: { fieldId: number }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();

  async function remove() {
    setBusy(true);
    try {
      await fetch(apiUrl(`/api/audit-form/${fieldId}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      title="Delete field"
      className="rounded-md border border-edge p-1.5 text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export function ToggleFieldEnabled({ fieldId, enabled }: { fieldId: number; enabled: number }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        startTransition(async () => {
          await fetch(apiUrl(`/api/audit-form/${fieldId}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: enabled === 0 }),
          });
          router.refresh();
        });
      }}
      className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
        enabled === 1
          ? "border border-moss/30 bg-moss/10 text-[#7fd4a5]"
          : "border border-edge bg-panel-2 text-fog"
      }`}
    >
      {enabled === 1 ? "enabled" : "disabled"}
    </button>
  );
}

export function ToggleFieldRequired({ fieldId, required }: { fieldId: number; required: number }) {
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  const apiUrl = useApiUrl();

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        startTransition(async () => {
          await fetch(apiUrl(`/api/audit-form/${fieldId}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ required: required === 0 }),
          });
          router.refresh();
        });
      }}
      className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
        required === 1
          ? "border border-ember/30 bg-ember/10 text-ember"
          : "border border-edge bg-panel-2 text-fog"
      }`}
    >
      {required === 1 ? "required" : "optional"}
    </button>
  );
}
