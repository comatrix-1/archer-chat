import { Briefcase, FilePlus, FileText, Home } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";

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
];

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] border-r"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
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
