import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import type { ReactNode } from "react";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="w-full px-4 md:px-6 py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 