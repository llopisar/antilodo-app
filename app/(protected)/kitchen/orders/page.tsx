import { ModuleShell } from "@/components/dashboard/module-shell";

export default function KitchenOrdersPage() {
  return (
    <ModuleShell
      title="Kitchen Orders"
      description="Track order queue, station load, and preparation flow."
      highlights={[
        { label: "Queue", value: "18 active" },
        { label: "Ready", value: "5 tickets" },
        { label: "Avg prep", value: "11m" },
      ]}
    />
  );
}
