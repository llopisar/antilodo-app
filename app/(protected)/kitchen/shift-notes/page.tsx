import { ModuleShell } from "@/components/dashboard/module-shell";

export default function ShiftNotesPage() {
  return (
    <ModuleShell
      title="Shift Notes"
      description="Capture handoff notes, issues, and operational context per shift."
      highlights={[
        { label: "Notes today", value: "14" },
        { label: "Mgmt visibility", value: "4" },
        { label: "Pending review", value: "2" },
      ]}
    />
  );
}
