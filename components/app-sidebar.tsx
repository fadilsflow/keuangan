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
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Building } from "lucide-react";


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
    <Sidebar variant={variant} >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild

            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Cashlog.</span>
                
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-1">
         <Building className="ml-2.5 w-3 h-3"/> <p className=" text-xs font-semibold">Rumah Tempe Indonesia.</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
     
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
