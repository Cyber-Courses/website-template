"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** Below `md`, the primary nav collapses into a sheet. */
export function MobileNav({
  links,
  label,
}: {
  links: { href: string; label: string }[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={label}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="p-6">
        <SheetTitle className="px-3 text-sm font-medium text-muted-foreground">{label}</SheetTitle>
        <nav className="flex flex-col gap-1" aria-label={label}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
