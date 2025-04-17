"use client";

import * as React from "react";
import {

  IconChartBar,

  IconFolder,
  IconInnerShadowTop,
  IconHome,
  IconReceipt2,
} from "@tabler/icons-react";


import { NavMain } from "@/components/nav-main";

import {
  Sidebar,
  SidebarContent,

  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";






const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/next.svg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconHome,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: IconReceipt2,
    },

    {
      title: "Laporan",
      url: "/report",
      icon: IconChartBar,
    },
    {
      title: "Data Master",
      url: "/data-master",
      icon: IconFolder,
    },
  ],
};

interface AppSidebarProps {
  variant?: "inset" | "sidebar" | "floating";
}

export function AppSidebar({ variant = "inset" }: AppSidebarProps) {
  return (
    <Sidebar variant={variant} collapsible="icon" >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
            className="hover:bg-transparent active:bg-transparent"
            >
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Cashlog.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
     
        <NavMain items={data.navMain} />

      </SidebarContent>
      {/* <SidebarFooter >
      </SidebarFooter> */}
      
    </Sidebar>
  );
}
