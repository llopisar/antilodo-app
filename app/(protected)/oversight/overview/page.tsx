import { ModuleShell } from "@/components/dashboard/module-shell";

export default function OversightOverviewPage() {
  return (
    <ModuleShell
      title="Operational Overview"
      description="Cross-functional status panel for management visibility."
      highlights={[
        { label: "Services active", value: "3" },
        { label: "Incidents", value: "5" },
        { label: "SLA health", value: "94%" },
      ]}
    />
  );
}

