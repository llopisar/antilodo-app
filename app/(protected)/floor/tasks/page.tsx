import { ModuleShell } from "@/components/dashboard/module-shell";

export default function FloorTasksPage() {
  return (
    <ModuleShell
      title="Floor Tasks"
      description="Coordinate service tasks and shift action items."
      highlights={[
        { label: "Assigned", value: "16" },
        { label: "Completed", value: "9" },
        { label: "Escalated", value: "1" },
      ]}
    />
  );
}
