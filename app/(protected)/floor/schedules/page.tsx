import { ModuleShell } from "@/components/dashboard/module-shell";

export default function FloorSchedulesPage() {
  return (
    <ModuleShell
      title="Floor Schedules"
      description="Manage floor staffing plans and shift balancing."
      highlights={[
        { label: "Team on shift", value: "12" },
        { label: "Late check-in", value: "1" },
        { label: "Coverage", value: "96%" },
      ]}
    />
  );
}
