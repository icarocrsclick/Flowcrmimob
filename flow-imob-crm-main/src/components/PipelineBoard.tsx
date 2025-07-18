import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Mail, Calendar, Plus, Edit } from "lucide-react"
import { LeadForm } from "@/components/LeadForm"
import { EditLeadDialog } from "@/components/EditLeadDialog"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Lead = {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  value: number | null
  created_at: string
  notes: string | null
  source: string | null
}

const stageConfig = {
  "novo": {
    title: "Novo Lead",
    color: "bg-lead-new",
    textColor: "text-white"
  },
  "qualificado": {
    title: "Qualificado",
    color: "bg-lead-qualified",
    textColor: "text-white"
  },
  "visita": {
    title: "Visita Agendada",
    color: "bg-lead-visit",
    textColor: "text-white"
  },
  "proposta": {
    title: "Proposta Enviada",
    color: "bg-lead-proposal",
    textColor: "text-white"
  },
  "fechado": {
    title: "Fechado",
    color: "bg-lead-won",
    textColor: "text-white"
  }
}

function SortableLeadCard({ lead, onRefresh }: { lead: Lead, onRefresh: () => void }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const initials = lead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditDialogOpen(true)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`mb-3 ${isDragging ? 'opacity-50' : ''}`}
      >
        <Card className="border-border/40 shadow-card hover:shadow-card-hover cursor-grab active:cursor-grabbing transition-all duration-200 bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{lead.name}</h4>
                  <p className="text-xs text-muted-foreground">{lead.source || 'Sem origem'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.value && (
                  <Badge variant="outline" className="text-xs font-medium">
                    R$ {new Intl.NumberFormat('pt-BR').format(lead.value)}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={handleEditClick}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditLeadDialog
        lead={lead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onLeadUpdated={onRefresh}
      />
    </>
  )
}

function PipelineColumn({ stage, leads, onRefresh }: { stage: string, leads: Lead[], onRefresh: () => void }) {
  const config = stageConfig[stage as keyof typeof stageConfig]
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })
  
  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className={`${config.color} ${config.textColor} px-4 py-3 rounded-lg flex items-center justify-between`}>
          <h3 className="font-semibold">{config.title}</h3>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {leads.length}
          </Badge>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`min-h-96 bg-muted/30 rounded-lg p-3 transition-colors ${
          isOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
        }`}
      >
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <SortableLeadCard key={lead.id} lead={lead} onRefresh={onRefresh} />
          ))}
        </SortableContext>
        
        <div className="mt-3">
          <LeadForm onLeadCreated={onRefresh} />
        </div>
      </div>
    </div>
  )
}

export function PipelineBoard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchLeads = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Erro ao carregar leads",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setLeads(data || [])
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os leads.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [user])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as string

    // Se o lead já está na coluna correta, não fazer nada
    const currentLead = leads.find(lead => lead.id === leadId)
    if (currentLead?.status === newStatus) return

    // Atualizar localmente primeiro para feedback visual imediato
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    )

    // Atualizar no banco de dados
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId)

      if (error) {
        // Reverter a mudança se houve erro
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, status: currentLead?.status || 'novo' } : lead
          )
        )
        toast({
          title: "Erro ao mover lead",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Lead movido com sucesso!",
          description: `Lead movido para ${stageConfig[newStatus as keyof typeof stageConfig]?.title}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível mover o lead.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const leadsByStatus = Object.keys(stageConfig).reduce((acc, status) => {
    acc[status] = leads.filter(lead => lead.status === status)
    return acc
  }, {} as Record<string, Lead[]>)

  const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funil de Vendas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus leads através do processo comercial
          </p>
        </div>
        <LeadForm onLeadCreated={fetchLeads} />
      </div>

      {/* Pipeline Board */}
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ minWidth: '1200px' }}>
            {Object.entries(stageConfig).map(([stage]) => (
              <div key={stage} className="flex-1 min-w-80">
                <PipelineColumn 
                  stage={stage} 
                  leads={leadsByStatus[stage] || []} 
                  onRefresh={fetchLeads}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeLead && (
            <Card className="border-border/40 shadow-lg bg-card rotate-3 opacity-90">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {activeLead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{activeLead.name}</h4>
                    <p className="text-xs text-muted-foreground">{activeLead.source || 'Sem origem'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}