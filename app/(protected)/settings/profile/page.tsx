import { ModuleShell } from "@/components/dashboard/module-shell";

export default function ProfileSettingsPage() {
  return (
    <ModuleShell
      title="Profile"
      description="Manage account preferences and security settings."
      highlights={[
        { label: "MFA", value: "Planned" },
        { label: "Session", value: "Active" },
        { label: "Language", value: "English" },
      ]}
    />
  );
}

