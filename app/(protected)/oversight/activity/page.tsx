import { ModuleShell } from "@/components/dashboard/module-shell";

export default function ActivityPage() {
  return (
    <ModuleShell
      title="Activity History"
      description="Audit trail of critical operational actions by user and module."
      highlights={[
        { label: "Events today", value: "97" },
        { label: "Critical actions", value: "12" },
        { label: "Data retention", value: "90d" },
      ]}
    />
  );
}

