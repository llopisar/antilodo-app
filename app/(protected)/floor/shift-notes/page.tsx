import { UserRole } from "@prisma/client";

import { createShiftNoteAction } from "@/features/operations/actions";
import { canManageShiftNotes, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, listShiftNotes } from "@/features/operations/queries";
import {
  FilterForm,
  InlineStat,
  ListCard,
  ModuleHeader,
  emptyState,
  formGridClass,
  formInputClass,
  formTextAreaClass,
  noteVisibilityBadge,
} from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "floor" as const;
type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function FloorShiftNotesPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const params = await searchParams;
  const [notes, options] = await Promise.all([
    listShiftNotes(scope, params.q, params.status),
    getFormOptions(scope),
  ]);
  const canManage = canManageShiftNotes(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title="Floor Shift Notes" description="Service notes and shift communication for floor operations." />
      <div className="grid gap-3 sm:grid-cols-3">
        <InlineStat label="Notes" value={String(notes.length)} />
        <InlineStat label="Team" value={String(notes.filter((n) => n.visibility === "TEAM").length)} />
        <InlineStat label="Management" value={String(notes.filter((n) => n.visibility === "MANAGEMENT").length)} />
      </div>

      <FilterForm action="/floor/shift-notes" query={params.q} status={params.status} statusOptions={["PRIVATE", "TEAM", "MANAGEMENT"]} />

      {canManage ? (
        <form action={createShiftNoteAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Create Shift Note</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} name="title" placeholder="Title" required />
            <select className={formInputClass()} name="visibility" required>
              <option value="TEAM">team</option>
              <option value="MANAGEMENT">management</option>
              <option value="PRIVATE">private</option>
            </select>
            <select className={formInputClass()} name="serviceId">
              <option value="">No linked service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} name="content" placeholder="Note content" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create note</button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {notes.length === 0 ? emptyState("No shift notes found for the selected filters.") : null}
        {notes.map((note) => (
          <ListCard
            key={note.id}
            title={note.title}
            subtitle={note.content}
            href={`/floor/shift-notes/${note.id}`}
            badges={noteVisibilityBadge(note.visibility)}
            meta={`${note.author.name} · ${note.createdAt.toLocaleString("en-US")} · ${note.service?.name ?? "No linked service"}`}
          />
        ))}
      </div>
    </div>
  );
}


