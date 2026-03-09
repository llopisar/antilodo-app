import { ModuleShell } from "@/components/dashboard/module-shell";

export default function KitchenAlertsPage() {
  return (
    <ModuleShell
      title="Kitchen Alerts"
      description="Monitor incidents, escalation paths, and resolution status."
      highlights={[
        { label: "Open", value: "3" },
        { label: "Critical", value: "1" },
        { label: "Resolved today", value: "5" },
      ]}
    />
  );
}
