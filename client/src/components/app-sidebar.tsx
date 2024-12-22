import { Calendar, ExternalLink, MessageCircle, Twitter } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
    {
        title: "About aiKOL DAO",
        url: "charter",
        icon: Calendar,
        isExternal: false
    },
    {
        title: "Follow aiKOL Lea",
        url: "https://x.com/aikollea",
        icon: Twitter,
        isExternal: true
    },
    {
        title: "Follow aiKOL DAO",
        url: "https://x.com/aikoldao",
        icon: Twitter,
        isExternal: true
    },
    {
        title: "DM aiKOL Lea",
        url: "https://t.me/aiKOLLea_bot",
        icon: Twitter,
        isExternal: true
    },
];

export function AppSidebar() {
    const location = useLocation();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a
                                            href={item.isExternal ? item.url : `/${item.url}`}
                                            target={item.isExternal ? "_blank" : undefined}
                                            rel={item.isExternal ? "noopener noreferrer" : undefined}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span>{item.title}</span>
                                            {item.isExternal && <ExternalLink className="w-3 h-3 ml-1" />}
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <Link
                                to="/how-to-use-lea"
                                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <span className="ml-2">How to Use Lea</span>
                            </Link>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
