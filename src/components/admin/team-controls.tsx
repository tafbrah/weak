"use client";

import { Loader2, Mail, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

function useApiUrl() {
  const searchParams = useSearchParams();
  const lwSession = searchParams.get("lw_session");
  return (path: string) => (lwSession ? `${path}?lw_session=${encodeURIComponent(lwSession)}` : path);
}

const field =
  "w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-sm text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
const label = "mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-fog";

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  photoUrl: string;
  bio: string;
  skills: string;
  status: string;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MemberPhoto({ src, name, size = "md" }: { src: string; name: string; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const text = size === "lg" ? "text-xl" : "text-base";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`${dim} shrink-0 rounded-full border border-edge object-cover`} />;
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full border border-edge bg-panel-2 font-display ${text} font-bold text-ember`}
    >
      {initials(name)}
    </div>
  );
}

/**
 * Photo picker: upload an image (stored as a data URL in the `photoUrl`
 * field), preview it, or paste a URL. Updates a hidden input that the
 * surrounding form submits.
 */
export function PhotoPicker({ initialUrl = "", name }: { initialUrl?: string; name: string }) {
  const [preview, setPreview] = useState(initialUrl);
  const [urlValue, setUrlValue] = useState(initialUrl.startsWith("data:") ? "" : initialUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);

  function commit(v: string) {
    setPreview(v);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErr("Image too large (max 3 MB).");
      return;
    }
    setErr(null);
    const reader = new FileReader();
    reader.onload = () => {
      commit(String(reader.result));
      setUrlValue("");
    };
    reader.readAsDataURL(file);
  }

  function onUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setUrlValue(v);
    commit(v);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Photo preview" className="h-14 w-14 shrink-0 rounded-full border border-edge object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-dashed border-edge bg-panel-2 text-[9px] text-fog">
            No photo
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-xs text-fog transition-colors hover:border-fog hover:text-bone"
          >
            <Upload className="h-3 w-3" /> Upload photo
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => {
                commit("");
                setUrlValue("");
              }}
              className="w-fit text-[11px] text-fog underline-offset-2 transition-colors hover:text-[#f08c82] hover:underline"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
      <input type="hidden" name={name} value={preview} readOnly />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <input
        value={urlValue}
        placeholder="…or paste an image URL"
        onChange={onUrlChange}
        className="mt-2 w-full rounded-md border border-edge bg-panel-2 px-3 py-2 text-xs text-bone placeholder:text-fog/60 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25"
      />
      {err && <p className="mt-1.5 text-[11px] text-[#f08c82]">{err}</p>}
    </div>
  );
}

/* ------------------------------ member card ------------------------------ */

function TeamMemberCardInner({ member }: { member: TeamMember }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const apiUrl = useApiUrl();

  async function save(fd: FormData) {
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/team/${member.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          role: fd.get("role"),
          email: fd.get("email"),
          photoUrl: fd.get("photoUrl"),
          bio: fd.get("bio"),
          skills: fd.get("skills"),
          status: fd.get("status"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
      if (res.ok && data.ok) {
        setEditing(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await fetch(apiUrl(`/api/team/${member.id}`), { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form
        action={save}
        className="flex h-full flex-col rounded-lg border border-ember/40 bg-panel p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-bold text-bone">Edit member</p>
          <button type="button" onClick={() => setEditing(false)} className="text-fog hover:text-bone" aria-label="Cancel">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid flex-1 gap-3">
          <div>
            <label className={label}>Name</label>
            <input name="name" defaultValue={member.name} required className={field} />
          </div>
          <div>
            <label className={label}>Role</label>
            <input name="role" defaultValue={member.role} className={field} />
          </div>
          <div>
            <label className={label}>Email</label>
            <input name="email" type="email" defaultValue={member.email} className={field} />
          </div>
          <div>
            <label className={label}>Photo</label>
            <PhotoPicker initialUrl={member.photoUrl} name="photoUrl" />
          </div>
          <div>
            <label className={label}>Bio / description</label>
            <textarea name="bio" defaultValue={member.bio} rows={3} className={`${field} resize-none`} />
          </div>
          <div>
            <label className={label}>Skills (comma separated)</label>
            <input name="skills" defaultValue={member.skills} className={field} />
          </div>
          <div>
            <label className={label}>Status</label>
            <select name="status" defaultValue={member.status} className={field}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-edge px-3 py-1.5 text-xs text-fog hover:text-bone">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-ember px-3 py-1.5 text-xs font-bold text-shell hover:bg-ember-deep disabled:opacity-60">
            {busy && <Loader2 className="h-3 w-3 animate-spin" />} Save
          </button>
        </div>
      </form>
    );
  }

  const skills = member.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="flex h-full flex-col rounded-lg border border-edge bg-panel p-5 transition-colors hover:border-ember/30">
      <div className="flex items-start gap-4">
        <MemberPhoto src={member.photoUrl} name={member.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-bone">{member.name}</p>
          <p className="truncate font-mono text-[11px] text-ember">{member.role}</p>
          {member.email && (
            <p className="mt-1 flex items-center gap-1 truncate font-mono text-[10px] text-fog">
              <Mail className="h-3 w-3" /> {member.email}
            </p>
          )}
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
            member.status === "active" ? "border-moss/30 bg-moss/10 text-[#7fd4a5]" : "border-edge bg-panel-2 text-fog"
          }`}
        >
          {member.status}
        </span>
      </div>

      {member.bio && <p className="mt-3 text-sm leading-relaxed text-fog">{member.bio}</p>}

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s} className="rounded-full border border-edge px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fog">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-xs text-fog transition-colors hover:border-fog hover:text-bone"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md border border-edge px-2.5 py-1.5 text-xs text-fog transition-colors hover:border-rust hover:text-[#f08c82] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
        </button>
      </div>
    </div>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Suspense fallback={null}>
      <TeamMemberCardInner member={member} />
    </Suspense>
  );
}

/* ----------------------------- add member form ----------------------------- */

function AddTeamMemberFormInner() {
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
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell transition-colors hover:bg-ember-deep"
        >
          <Plus className="h-4 w-4" /> Add team member
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setBusy(true);
            setError(null);
            fetch(apiUrl("/api/team"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: fd.get("name"),
                role: fd.get("role"),
                email: fd.get("email"),
                photoUrl: fd.get("photoUrl"),
                bio: fd.get("bio"),
                skills: fd.get("skills"),
                status: fd.get("status"),
              }),
            })
              .then(async (res) => {
                const data = (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
                if (!res.ok || !data.ok) {
                  setError(data.error ?? "Could not add the member.");
                  return;
                }
                e.currentTarget.reset();
                setOpen(false);
                router.refresh();
              })
              .catch(() => setError("Could not add the member."))
              .finally(() => setBusy(false));
          }}
          className="rounded-lg border border-edge bg-panel p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-bone">Add a team member</h3>
            <button type="button" onClick={() => setOpen(false)} className="text-fog hover:text-bone" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Name *</label>
              <input name="name" required placeholder="Jane Doe" className={field} />
            </div>
            <div>
              <label className={label}>Role</label>
              <input name="role" placeholder="Automation Engineer" className={field} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input name="email" type="email" placeholder="jane@loopwerk.studio" className={field} />
            </div>
            <div>
              <label className={label}>Photo</label>
              <PhotoPicker name="photoUrl" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Bio / description</label>
              <textarea name="bio" rows={3} placeholder="What this person does on the team…" className={`${field} resize-none`} />
            </div>
            <div>
              <label className={label}>Skills (comma separated)</label>
              <input name="skills" placeholder="n8n, AI agents, RAG" className={field} />
            </div>
            <div>
              <label className={label}>Status</label>
              <select name="status" defaultValue="active" className={field}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {error && <p className="rounded-md border border-rust/40 bg-rust/10 px-3 py-2 text-sm text-[#f2b8b3] sm:col-span-2">{error}</p>}
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-2 text-sm font-bold text-shell hover:bg-ember-deep disabled:opacity-60">
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add member
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddTeamMemberForm() {
  return (
    <Suspense fallback={null}>
      <AddTeamMemberFormInner />
    </Suspense>
  );
}
