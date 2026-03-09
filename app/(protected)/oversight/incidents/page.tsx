import { ModuleShell } from "@/components/dashboard/module-shell";

export default function IncidentsPage() {
  return (
    <ModuleShell
      title="Incidents"
      description="Track alert lifecycle, ownership, and resolution outcomes."
      highlights={[
        { label: "Open", value: "4" },
        { label: "Escalated", value: "1" },
        { label: "Avg resolve", value: "38m" },
      ]}
    />
  );
}
