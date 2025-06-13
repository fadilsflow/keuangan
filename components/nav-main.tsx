"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url} passHref>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "hover:cursor-pointer",
                    // when open new transaction page make the /transactions not active
                    pathname === "/transactions/new" &&
                      item.url === "/transactions"
                      ? "bg-transparent active:bg-transparent "
                      : pathname === item.url || pathname.startsWith(item.url)
                      ? "hover:text-background dark:hover:text-foreground hover:bg-primary/80 bg-primary/90 text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                      : " active:bg-muted"
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
