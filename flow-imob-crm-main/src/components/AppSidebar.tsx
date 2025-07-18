import { useState } from "react"
import { Home, Users, Building, BarChart3, Settings, Plus, Network, HomeIcon, FileText, Megaphone } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { LeadForm } from "@/components/LeadForm"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Funil de Vendas", url: "/pipeline", icon: BarChart3 },
  { title: "Leads", url: "/leads", icon: Users },
  { title: "Imóveis", url: "/properties", icon: Building },
  { title: "Captações", url: "/captacoes", icon: HomeIcon },
  { title: "Campanhas", url: "/campaigns", icon: Megaphone },
  { title: "Documentação", url: "/documentacao-imovel", icon: FileText },
  { title: "Conexões", url: "/conexoes", icon: Network },
  { title: "Configurações", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  
  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }
  
  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
  }

  return (
    <Sidebar
      className={!open ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/40 p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h2 className="font-semibold text-foreground">ImovelCRM</h2>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {open && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {open && (
          <div className="mt-8 px-3">
            <LeadForm />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}