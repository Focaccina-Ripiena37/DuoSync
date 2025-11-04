"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const links = [
    { href: "/calendar", label: "Calendario", icon: CalendarDays },
    { href: "/wishlist", label: "Wishlist", icon: Gift },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 md:hidden">
      <ul className="mx-auto flex max-w-xl items-stretch justify-around p-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname === `${href}/`;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center rounded-md text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5 mb-1", active && "scale-110 transition-transform")}/>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
