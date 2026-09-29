import { useState } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { fetchAllClasses, createClass, updateClass, deleteClass, type AdminLiveClass, type NewLiveClass } from "@/lib/adminData";

const EMPTY_FORM: NewLiveClass = {
  title: "",
  description: "",
  format: "online",
  host: "WorthScope",
  starts_at: "",
  ends_at: "",
  location: "",
  join_url: "",
  career_tags: [],
  apply_url: "",
  apply_email: "",
  seats_note: "",
};

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminClasses() {
  const { data, loading, error, reload } = useAdminFetch(fetchAllClasses);
  const [editing, setEditing] = useState<AdminLiveClass | null>(null);
  const [form, setForm] = useState<NewLiveClass>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setTagsInput("");
    setShowForm(true);
  }

  function openEdit(c: AdminLiveClass) {
    setEditing(c);
    setForm({ ...c, starts_at: toLocalInput(c.starts_at), ends_at: toLocalInput(c.ends_at) });
    setTagsInput((c.career_tags ?? []).join(", "));
    setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.starts_at || !form.ends_at) {
      toast.error("Title, start time and end time are required.");
      return;
    }
    setSaving(true);
    const payload: NewLiveClass = {
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      career_tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      location: form.location || null,
      join_url: form.join_url || null,
      apply_url: form.apply_url || null,
      apply_email: form.apply_email || null,
      seats_note: form.seats_note || null,
    };
    try {
      if (editing) await updateClass(editing.id, payload);
      else await createClass(payload);
      toast.success(editing ? "Class updated" : "Class added");
      setShowForm(false);
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the class.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: AdminLiveClass) {
    if (!confirm(`Delete "${c.title}"? This can't be undone.`)) return;
    try {
      await deleteClass(c.id);
      toast.success("Class deleted");
      reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete the class.");
    }
  }

  const inputCls = "w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-[13px] text-foreground placeholder:text-text3 focus:outline-none focus:border-accent/50";

  return (
    <AdminLayout title="Live Classes">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] text-text2">WorthScope-hosted and partner-facility sessions. Visible to every user on /classes.</p>
        <button onClick={openNew} className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-dark">
          + Add class
        </button>
      </div>

      {loading && <p className="text-[13px] text-text2">Loading…</p>}
      {error && <div className="rounded-xl border border-border bg-card p-4 text-[13px] text-text2">Couldn't load classes: {error}</div>}
      {data && data.length === 0 && <p className="text-[13px] text-text2">No classes yet — add the first one.</p>}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3 rounded-[14px] border border-border bg-card p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {c.format === "online" ? "🌐 Online" : "📍 Physical"}
                  </span>
                  <span className="text-[11.5px] text-text3">{new Date(c.starts_at).toLocaleString()}</span>
                </div>
                <div className="mt-1.5 text-[14px] font-semibold text-foreground">{c.title}</div>
                <div className="text-[12px] text-text3">Hosted by {c.host}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(c)} className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:border-accent/40">
                  Edit
                </button>
                <button onClick={() => remove(c)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[12.5px] font-medium text-red-400 hover:bg-red-500/10">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[700] grid place-items-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-foreground">{editing ? "Edit class" : "Add a class"}</h3>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <input className={inputCls} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className={inputCls} placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <select className={inputCls} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as "online" | "physical" })}>
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                </select>
                <input className={inputCls} placeholder="Host (e.g. WorthScope)" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-text3">Starts</label>
                  <input type="datetime-local" className={inputCls} value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-text3">Ends</label>
                  <input type="datetime-local" className={inputCls} value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                </div>
              </div>

              {form.format === "physical" ? (
                <input className={inputCls} placeholder="Venue / address" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              ) : (
                <input className={inputCls} placeholder="Join link (shown once live)" value={form.join_url ?? ""} onChange={(e) => setForm({ ...form, join_url: e.target.value })} />
              )}

              <input className={inputCls} placeholder="Career tags, comma separated (e.g. Content Creator, Digital Marketer)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />

              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} placeholder="Apply URL (registration link)" value={form.apply_url ?? ""} onChange={(e) => setForm({ ...form, apply_url: e.target.value })} />
                <input className={inputCls} placeholder="Or apply email" value={form.apply_email ?? ""} onChange={(e) => setForm({ ...form, apply_email: e.target.value })} />
              </div>
              <input className={inputCls} placeholder="Seats note (optional, e.g. 'Limited to 20 seats')" value={form.seats_note ?? ""} onChange={(e) => setForm({ ...form, seats_note: e.target.value })} />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-[13px] font-semibold text-foreground">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Save changes" : "Add class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
