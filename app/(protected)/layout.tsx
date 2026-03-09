import { ReactNode } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserNav } from "@/components/layout/user-nav";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/authz";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr] md:p-6">
        <aside className="hidden rounded-xl border bg-card p-4 md:block">
          <p className="mb-4 text-sm font-semibold">Operations</p>
          <SidebarNav role={user.role} />
        </aside>
        <div className="space-y-4">
          <header className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <MobileNav role={user.role} />
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>
            <UserNav name={user.name ?? "Team Member"} role={user.role} />
          </header>
          <Separator />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
