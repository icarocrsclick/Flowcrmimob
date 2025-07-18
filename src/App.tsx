import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Pipeline from "./pages/Pipeline";
import Leads from "./pages/Leads";
import Properties from "./pages/Properties";
import Conexoes from "./pages/Conexoes";
import Captacoes from "./pages/Captacoes";
import DocumentacaoImovel from "./pages/DocumentacaoImovel";
import DocumentacaoIndex from "./pages/DocumentacaoIndex";
import Campaigns from "./pages/Campaigns";
import Campaign from "./pages/Campaign";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const queryClient = new QueryClient();

const AppHeader = () => {
  const { profile, signOut } = useAuth();
  
  return (
    <header className="h-14 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="mr-2" />
        <h1 className="font-semibold text-foreground hidden sm:block">ImovelCRM</h1>
      </div>
      <div className="flex items-center gap-4">
        {profile && (
          <>
            <div className="text-sm text-muted-foreground hidden sm:block">
              {profile.name} ({profile.role === 'gestor' ? 'Gestor' : 'Corretor'})
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Index />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pipeline" element={
              <ProtectedRoute>
                <AppLayout>
                  <Pipeline />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/leads" element={
              <ProtectedRoute>
                <AppLayout>
                  <Leads />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/properties" element={
              <ProtectedRoute>
                <AppLayout>
                  <Properties />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/conexoes" element={
              <ProtectedRoute>
                <AppLayout>
                  <Conexoes />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/captacoes" element={
              <ProtectedRoute>
                <AppLayout>
                  <Captacoes />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/documentacao-imovel" element={
              <ProtectedRoute>
                <AppLayout>
                  <DocumentacaoIndex />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/documentacao-imovel/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <DocumentacaoImovel />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <AppLayout>
                  <Campaigns />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/campaign/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <Campaign />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
