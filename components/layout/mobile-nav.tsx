"use client";

import { Menu } from "lucide-react";
import { UserRole } from "@prisma/client";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({ role }: { role: UserRole }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" />}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Operations</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SidebarNav role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
