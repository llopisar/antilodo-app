import { ModuleShell } from "@/components/dashboard/module-shell";

export default function KitchenServicesPage() {
  return (
    <ModuleShell
      title="Kitchen Services"
      description="Monitor active services and kitchen readiness checkpoints."
      highlights={[
        { label: "Active services", value: "2" },
        { label: "Coverage", value: "100%" },
        { label: "Delays", value: "1" },
      ]}
    />
  );
}
