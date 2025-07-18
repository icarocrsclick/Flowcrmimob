import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Phone, Mail, MoreHorizontal, Plus } from "lucide-react"
import { LeadForm } from "@/components/LeadForm"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  status: string
  source?: string
  notes?: string
  created_at: string
  assigned_to: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Novo Lead": return "bg-lead-new text-white"
    case "Qualificado": return "bg-lead-qualified text-white"
    case "Visita": return "bg-lead-visit text-white"
    case "Proposta": return "bg-lead-proposal text-white"
    case "Fechado": return "bg-lead-won text-white"
    default: return "bg-muted text-muted-foreground"
  }
}

function LeadRow({ lead }: { lead: Lead }) {
  const initials = lead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/40 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-foreground">{lead.name}</h4>
            <Badge className={`${getStatusColor(lead.status)} px-2 py-1 text-xs font-medium`}>
              {lead.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {lead.email}
              </span>
            )}
            {lead.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {lead.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right hidden lg:block">
          <p className="text-muted-foreground">{lead.source}</p>
          <p className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeads(data || [])
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar leads",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLeadCreated = () => {
    fetchLeads()
  }

  const totalLeads = leads.length
  const newLeads = leads.filter(lead => lead.status === 'novo').length
  const visitLeads = leads.filter(lead => lead.status === 'visita').length
  const closedLeads = leads.filter(lead => lead.status === 'fechado').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os seus leads em um só lugar
          </p>
        </div>
        <LeadForm onLeadCreated={handleLeadCreated} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar leads..." 
            className="pl-10 border-border/60 focus:border-primary"
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
            <p className="text-sm text-muted-foreground">Total de Leads</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-lead-new">{newLeads}</div>
            <p className="text-sm text-muted-foreground">Novos</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-lead-visit">{visitLeads}</div>
            <p className="text-sm text-muted-foreground">Em Visita</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-lead-won">{closedLeads}</div>
            <p className="text-sm text-muted-foreground">Convertidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <Card className="border-border/40 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Todos os Leads
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum lead cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Leads