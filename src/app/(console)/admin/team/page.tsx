import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { AddTeamMemberForm, TeamMemberCard, type TeamMember } from "@/components/admin/team-controls";
import { Empty, PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { getConsoleI18n } from "@/lib/i18n";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";

export const metadata: Metadata = { title: "Team — Loopwerk console" };

export default async function TeamPage() {
  const { t } = await getConsoleI18n();
  const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.name));

  const active = rows.filter((m) => m.status === "active").length;
  const inactive = rows.length - active;
  const roles = new Set(rows.map((m) => m.role).filter(Boolean)).size;

  return (
    <>
      <PageHeader
        title={t("console.team.title", "Team")}
        sub={`${rows.length} members · collaborate on client automations`}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label={t("team.kpi.total", "Team members")} value={String(rows.length)} sub={`${roles} distinct roles`} />
        <StatCard label={t("team.kpi.active", "Active")} value={String(active)} tone="moss" sub="currently collaborating" />
        <StatCard label={t("team.kpi.inactive", "Inactive")} value={String(inactive)} tone={inactive > 0 ? "fog" : "fog"} sub="paused members" />
        <StatCard label={t("team.kpi.roles", "Roles")} value={String(roles)} sub="across the team" />
      </div>

      <div className="mt-6 mb-6">
        <AddTeamMemberForm />
      </div>

      {rows.length === 0 ? (
        <Panel>
          <Empty>No team members yet. Add the first one above.</Empty>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((m) => (
            <TeamMemberCard
              key={m.id}
              member={{
                id: m.id,
                name: m.name,
                role: m.role,
                email: m.email,
                photoUrl: m.photoUrl,
                bio: m.bio,
                skills: m.skills,
                status: m.status,
              } satisfies TeamMember}
            />
          ))}
        </div>
      )}

      <p className="mt-4 font-mono text-[11px] text-fog">
        add, edit and remove team members · photos accept a URL or fall back to initials · bios & skills help collaboration
      </p>
    </>
  );
}
