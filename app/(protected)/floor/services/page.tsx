import { ModuleShell } from "@/components/dashboard/module-shell";

export default function FloorServicesPage() {
  return (
    <ModuleShell
      title="Floor Services"
      description="Track table service flow, pace, and guest-facing operations."
      highlights={[
        { label: "Seated", value: "42" },
        { label: "Turn time", value: "58m" },
        { label: "Waitlist", value: "7" },
      ]}
    />
  );
}
