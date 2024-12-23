import { Calendar, ExternalLink, Info, Star, MessageCircle, Twitter, Code } from "lucide-react";
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
        icon: Star,
        isExternal: false
    },
    {
        title: "How to Use Lea",
        url: "how-to-use-lea",
        icon: Info,
        isExternal: false
    },
    {
        title: "How It's Built",
        url: "how-its-built",
        icon: Code,
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
        icon: MessageCircle,
        isExternal: true
    }
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

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
