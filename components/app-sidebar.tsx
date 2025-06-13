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
import {
  BarChart3,
  Folder,
  Home,
  Receipt,
  PlusCircle,
  DollarSign,
} from "lucide-react";

const data = {
  // susunan fitur menjadi : dashboard, data master, buat transaksi, transaksi, laporan
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      pageName: "Dashboard",
      icon: Home,
    },
    {
      title: "Master Data",
      url: "/master-data",
      pageName: "Master Data",
      icon: Folder,
    },
    {
      title: "Buat Transaksi",
      url: "/transactions/new",
      pageName: "Buat Transaksi",
      icon: PlusCircle,
    },
    {
      title: "Transaksi",
      url: "/transactions",
      pageName: "Transaksi",
      icon: Receipt,
    },

    {
      title: "Laporan",
      url: "/report",
      pageName: "Laporan",
      icon: BarChart3,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-transparent active:bg-transparent  border-b-2 border-primary w-fit">
              <DollarSign />
              <span className="text-base font-semibold ">Cashlog.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <div className="block sm:hidden">
          <ResponsiveOrganizationSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
