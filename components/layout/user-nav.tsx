"use client";

import { signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function UserNav({ name, role }: { name: string; role: UserRole }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium">{name}</p>
        <Badge variant="outline" className="text-xs">
          {role.toLowerCase().replaceAll("_", " ")}
        </Badge>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </Button>
    </div>
  );
}
