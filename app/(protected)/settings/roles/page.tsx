import { ModuleShell } from "@/components/dashboard/module-shell";

export default function RolesSettingsPage() {
  return (
    <ModuleShell
      title="Role Policies"
      description="Review route guards and permission mapping by hierarchy."
      highlights={[
        { label: "Roles", value: "5" },
        { label: "Policies", value: "22" },
        { label: "Last update", value: "Today" },
      ]}
    />
  );
}

