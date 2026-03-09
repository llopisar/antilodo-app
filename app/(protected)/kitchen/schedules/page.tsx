import { ModuleShell } from "@/components/dashboard/module-shell";

export default function KitchenSchedulesPage() {
  return (
    <ModuleShell
      title="Kitchen Schedules"
      description="Review shifts, assignments, and staffing coverage."
      highlights={[
        { label: "Today shifts", value: "9" },
        { label: "Open slots", value: "1" },
        { label: "Overtime", value: "0" },
      ]}
    />
  );
}
