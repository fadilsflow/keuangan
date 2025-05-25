"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ResponsiveOrganizationSwitcher from "./responsive-organization-switcher";
import { BarChart3, Folder, Home, Receipt } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Transaksi",
      url: "/transactions",
      icon: Receipt,
    },

    {
      title: "Laporan",
      url: "/report",
      icon: BarChart3,
    },
    {
      title: "Master Data",
      url: "/data-master",
      icon: Folder,
    },
  ],
};

interface AppSidebarProps {
  variant?: "inset" | "sidebar" | "floating";
}

export function AppSidebar({ variant = "inset" }: AppSidebarProps) {
  return (
    <Sidebar variant={variant} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent active:bg-transparent">
              <Home className="!size-5" />
              <span className="text-base font-semibold">Cashlog.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
      </SidebarContent>
      <SidebarFooter>
        <div className="block sm:hidden">
          <ResponsiveOrganizationSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
