import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminFetch } from "@/lib/useAdminFetch";
import { fetchUsers } from "@/lib/adminData";

export default function AdminUsers() {
  const { data, loading, error } = useAdminFetch(fetchUsers);

  return (
    <AdminLayout title="Users">
      {loading && <p className="text-[13px] text-text2">Loading…</p>}
      {error && <div className="rounded-xl border border-border bg-card p-4 text-[13px] text-text2">Couldn't load users: {error}</div>}
      {data && (
        <div className="overflow-x-auto rounded-[16px] border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg-elevated text-[11px] uppercase tracking-wide text-text3">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Age</th>
                <th className="px-4 py-3 font-semibold">Education</th>
                <th className="px-4 py-3 font-semibold">Career path</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-text3">
                    No users yet.
                  </td>
                </tr>
              )}
              {data.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name || "—"}</td>
                  <td className="px-4 py-3 text-text2">{u.age ?? "—"}</td>
                  <td className="px-4 py-3 text-text2">{u.education_level || "—"}</td>
                  <td className="px-4 py-3 text-text2">{u.career_path || "—"}</td>
                  <td className="px-4 py-3 text-text2">{u.overall_progress}%</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" ? (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">admin</span>
                    ) : (
                      <span className="text-text3">user</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text3">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
