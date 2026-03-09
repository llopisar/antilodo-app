import { ModuleShell } from "@/components/dashboard/module-shell";

export default function FloorAlertsPage() {
  return (
    <ModuleShell
      title="Floor Alerts"
      description="Handle front-of-house incidents and critical service alerts."
      highlights={[
        { label: "Open", value: "2" },
        { label: "Acknowledged", value: "3" },
        { label: "Resolved", value: "12" },
      ]}
    />
  );
}
