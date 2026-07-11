"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { updateRole } from "@/app/(dashboard)/team/actions";

export function RoleControl({ id, role, self }: { id: string; role: Role; self: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      value={role}
      disabled={pending || self}
      title={self ? "You can't change your own role" : undefined}
      onChange={(e) =>
        start(async () => {
          await updateRole(id, e.target.value as Role);
          router.refresh();
        })
      }
      className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-sm font-medium disabled:opacity-60"
    >
      <option value="admin">Admin</option>
      <option value="staff">Staff (cleaner)</option>
    </select>
  );
}
