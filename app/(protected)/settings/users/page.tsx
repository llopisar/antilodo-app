import { ModuleShell } from "@/components/dashboard/module-shell";

export default function UsersSettingsPage() {
  return (
    <ModuleShell
      title="User Management"
      description="Manage active users, role assignments, and account lifecycle."
      highlights={[
        { label: "Users", value: "5" },
        { label: "Active", value: "5" },
        { label: "Pending", value: "0" },
      ]}
    />
  );
}
