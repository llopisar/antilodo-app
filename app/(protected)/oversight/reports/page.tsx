import { ModuleShell } from "@/components/dashboard/module-shell";

export default function ReportsPage() {
  return (
    <ModuleShell
      title="Reports"
      description="Monitor trends, throughput, and compliance metrics."
      highlights={[
        { label: "Daily reports", value: "6" },
        { label: "Weekly trend", value: "+4.2%" },
        { label: "Export jobs", value: "2" },
      ]}
    />
  );
}
