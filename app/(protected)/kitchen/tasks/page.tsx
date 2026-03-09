import { ModuleShell } from "@/components/dashboard/module-shell";

export default function KitchenTasksPage() {
  return (
    <ModuleShell
      title="Kitchen Tasks"
      description="Coordinate internal task assignments and completion status."
      highlights={[
        { label: "Open", value: "11" },
        { label: "In progress", value: "6" },
        { label: "Blocked", value: "1" },
      ]}
    />
  );
}
