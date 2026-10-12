import type { Metadata } from "next";
import { AutoSelect, DeleteUserButton, NewUserForm } from "@/components/admin/controls";
import {
  Badge,
  Empty,
  Panel,
  PageHeader,
  StatusDot,
  Td,
  Th,
  userRoleTone,
  userStatusTone,
} from "@/components/admin/ui";
import { db } from "@/db";
import { users } from "@/db/schema";
import { fmtDate, timeAgo } from "@/lib/format";
import { getConsoleI18n } from "@/lib/i18n";

export const metadata: Metadata = { title: "User management — Loopwerk console" };

const ROLE_OPTIONS = ["admin", "manager", "member", "viewer"].map((r) => ({ value: r, label: r }));
const STATUS_OPTIONS = ["active", "invited", "suspended"].map((s) => ({ value: s, label: s }));

export default async function UsersPage() {
  const { t } = await getConsoleI18n();
  const rows = await db.select().from(users).orderBy(users.name);
  const activeCount = rows.filter((u) => u.status === "active").length;
  const invitedCount = rows.filter((u) => u.status === "invited").length;

  return (
    <>
      <PageHeader
        title={t("console.users.title", "User management")}
        sub={`${rows.length} users · ${activeCount} active · ${invitedCount} pending invite`}
      />

      <div className="mb-6">
        <NewUserForm />
      </div>

      <Panel>
        {rows.length === 0 ? (
          <Empty>No users yet. Invite the first one above.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-edge">
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Last active</Th>
                  <Th>Member since</Th>
                  <Th className="text-right">Del</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/60">
                {rows.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-panel-2/50">
                    <Td>
                      <p className="flex items-center gap-2 font-medium text-bone">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel-2 font-mono text-[10px] font-bold text-fog">
                          {user.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        {user.name}
                      </p>
                      <p className="pl-9 font-mono text-[11px] text-fog">{user.email}</p>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Badge tone={userRoleTone[user.role]}>{user.role}</Badge>
                        <AutoSelect userId={user.id} field="role" value={user.role} options={ROLE_OPTIONS} />
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <StatusDot tone={userStatusTone[user.status]} pulse={user.status === "active"} />
                        <AutoSelect userId={user.id} field="status" value={user.status} options={STATUS_OPTIONS} />
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap font-mono text-xs text-fog">{timeAgo(user.lastActiveAt)}</Td>
                    <Td className="whitespace-nowrap font-mono text-xs text-fog">{fmtDate(user.createdAt)}</Td>
                    <Td className="text-right">
                      <DeleteUserButton userId={user.id} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-4 font-mono text-[11px] text-fog">
        roles: admin &gt; manager &gt; member &gt; viewer · suspending a user blocks console access instantly
      </p>
    </>
  );
}
