"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

import ResponsiveOrganizationSwitcher from "./responsive-organization-switcher";
import { ResponsiveUserButton } from "./responsive-user-button";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const page = {
    "/dashboard": "Dashboard",
    "/transactions/*": "Transaksi",
    "/report": "Laporan",
    "/data-master": "Data Master",
    "/transactions/new": "Buat Transaksi",
  };
  const pathname = usePathname();
  const pageName = page[pathname as keyof typeof page];
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium capitalize">{pageName}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />

          <div className="hidden sm:block">
            <ResponsiveOrganizationSwitcher />
          </div>
          <ResponsiveUserButton />
        </div>
      </div>
    </header>
  );
}
