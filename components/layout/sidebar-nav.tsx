"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";

import { navByRole } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navByRole(role);

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
