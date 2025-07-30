import { Briefcase, FilePlus, FileText, Home } from "lucide-react";
import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@project/remix/app/components/ui/sidebar";

const sidebarItems = [
  {
    title: "Home",
    icon: Home,
    to: "/",
  },
  {
    title: "ResumAI",
    icon: FileText,
    to: "/resume",
  },
  {
    title: "CoverLetterAI",
    icon: FilePlus,
    to: "#",
  },
  {
    title: "JobBoardAI",
    icon: Briefcase,
    to: "#",
  },
  {
    title: "JobTracker",
    icon: Briefcase,
    to: "/job-tracker",
  },
];

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="w-64 h-full border-r flex-shrink-0 mt-16"
    >
      <SidebarHeader className="ml-auto">
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <Link to={item.to} className="flex items-center gap-2">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ArcherChat
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
