import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

import { updateShiftNoteAction } from "@/features/operations/actions";
import { canManageShiftNotes, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, getShiftNote } from "@/features/operations/queries";
import { ModuleHeader, SectionCard, formGridClass, formInputClass, formTextAreaClass, noteVisibilityBadge } from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "floor" as const;
type Props = { params: Promise<{ id: string }> };

export default async function FloorShiftNoteDetailPage({ params }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;
  const { id } = await params;
  const [note, options] = await Promise.all([getShiftNote(id), getFormOptions(scope)]);
  if (!note) notFound();

  const canManage = canManageShiftNotes(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title={note.title} description="Shift note details, visibility, and update controls." />
      <p className="text-sm text-muted-foreground">{note.author.name} · {note.createdAt.toLocaleString("en-US")} · {noteVisibilityBadge(note.visibility)}</p>

      <SectionCard title="Note Content">
        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
        <p className="text-xs text-muted-foreground">Service: {note.service?.name ?? "No linked service"}</p>
      </SectionCard>

      {canManage ? (
        <form action={updateShiftNoteAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <input name="id" type="hidden" value={note.id} />
          <h2 className="text-sm font-semibold">Edit Shift Note</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} defaultValue={note.title} name="title" required />
            <select className={formInputClass()} defaultValue={note.visibility} name="visibility" required>
              <option value="TEAM">team</option>
              <option value="MANAGEMENT">management</option>
              <option value="PRIVATE">private</option>
            </select>
            <select className={formInputClass()} defaultValue={note.serviceId ?? ""} name="serviceId">
              <option value="">No linked service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} defaultValue={note.content} name="content" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Save changes</button>
        </form>
      ) : <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">Read-only access.</p>}

      <Link className="text-sm underline" href="/floor/shift-notes">Back to shift notes</Link>
    </div>
  );
}

