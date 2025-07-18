import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Mail, MapPin, Home, Calendar, Plus, Edit } from "lucide-react"
import { CaptacaoForm } from "@/components/CaptacaoForm"
import { EditCaptacaoDialog } from "@/components/EditCaptacaoDialog"
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

type Captacao = {
  id: string
  owner_name: string
  contact: string | null
  address: string
  property_type: string
  estimated_value: number | null
  documentation_status: string
  last_interaction: string
  notes: string | null
  status: string
  tags: string[]
  created_at: string
  assigned_to: string
}

const stageConfig = {
  "prospeccao": {
    title: "Prospecção / Leads Frios",
    color: "bg-slate-500",
    textColor: "text-white"
  },
  "contato_inicial": {
    title: "Contato Inicial",
    color: "bg-blue-500",
    textColor: "text-white"
  },
  "interesse_confirmado": {
    title: "Interesse Confirmado",
    color: "bg-amber-500",
    textColor: "text-white"
  },
  "documentacao_analise": {
    title: "Documentação em Análise",
    color: "bg-orange-500",
    textColor: "text-white"
  },
  "vistoria_avaliacao": {
    title: "Vistoria / Avaliação",
    color: "bg-purple-500",
    textColor: "text-white"
  },
  "proposta_enviada": {
    title: "Proposta Comercial Enviada",
    color: "bg-indigo-500",
    textColor: "text-white"
  },
  "aguardando_assinatura": {
    title: "Aguardando Assinatura",
    color: "bg-cyan-500",
    textColor: "text-white"
  },
  "captado": {
    title: "Imóvel Captado (Em Estoque)",
    color: "bg-green-500",
    textColor: "text-white"
  },
  "rejeitado": {
    title: "Rejeitado / Sem Interesse",
    color: "bg-red-500",
    textColor: "text-white"
  }
}

function SortableCaptacaoCard({ captacao, onRefresh }: { captacao: Captacao, onRefresh: () => void }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: captacao.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const initials = captacao.owner_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()

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
                  <h4 className="font-semibold text-foreground text-sm">{captacao.owner_name}</h4>
                  <p className="text-xs text-muted-foreground">{captacao.property_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {captacao.estimated_value && (
                  <Badge variant="outline" className="text-xs font-medium">
                    R$ {new Intl.NumberFormat('pt-BR').format(captacao.estimated_value)}
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
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate text-xs">{captacao.address}</span>
              </div>
              {captacao.contact && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{captacao.contact}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(captacao.last_interaction).toLocaleDateString('pt-BR')}</span>
                </div>
                <Badge 
                  variant={captacao.documentation_status === 'completo' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  Doc: {captacao.documentation_status}
                </Badge>
              </div>
              {captacao.tags && captacao.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {captacao.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <EditCaptacaoDialog
        captacao={captacao}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onCaptacaoUpdated={onRefresh}
      />
    </>
  )
}

function CaptacoesColumn({ stage, captacoes, onRefresh }: { stage: string, captacoes: Captacao[], onRefresh: () => void }) {
  const config = stageConfig[stage as keyof typeof stageConfig]
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })
  
  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className={`${config.color} ${config.textColor} px-4 py-3 rounded-lg flex items-center justify-between`}>
          <h3 className="font-semibold text-sm">{config.title}</h3>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {captacoes.length}
          </Badge>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`min-h-96 bg-muted/30 rounded-lg p-3 transition-colors ${
          isOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
        }`}
      >
        <SortableContext items={captacoes.map(captacao => captacao.id)} strategy={verticalListSortingStrategy}>
          {captacoes.map((captacao) => (
            <SortableCaptacaoCard key={captacao.id} captacao={captacao} onRefresh={onRefresh} />
          ))}
        </SortableContext>
        
        <div className="mt-3">
          <CaptacaoForm onCaptacaoCreated={onRefresh} />
        </div>
      </div>
    </div>
  )
}

export function CaptacoesBoard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [captacoes, setCaptacoes] = useState<Captacao[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchCaptacoes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('captacoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Erro ao carregar captações",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setCaptacoes(data || [])
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar as captações.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptacoes()
  }, [user])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const captacaoId = active.id as string
    const newStatus = over.id as string

    const currentCaptacao = captacoes.find(captacao => captacao.id === captacaoId)
    if (currentCaptacao?.status === newStatus) return

    setCaptacoes(prevCaptacoes => 
      prevCaptacoes.map(captacao => 
        captacao.id === captacaoId ? { ...captacao, status: newStatus } : captacao
      )
    )

    try {
      const { error } = await supabase
        .from('captacoes')
        .update({ status: newStatus })
        .eq('id', captacaoId)

      if (error) {
        setCaptacoes(prevCaptacoes => 
          prevCaptacoes.map(captacao => 
            captacao.id === captacaoId ? { ...captacao, status: currentCaptacao?.status || 'prospeccao' } : captacao
          )
        )
        toast({
          title: "Erro ao mover captação",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Captação movida com sucesso!",
          description: `Captação movida para ${stageConfig[newStatus as keyof typeof stageConfig]?.title}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível mover a captação.",
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

  const captacoesByStatus = Object.keys(stageConfig).reduce((acc, status) => {
    acc[status] = captacoes.filter(captacao => captacao.status === status)
    return acc
  }, {} as Record<string, Captacao[]>)

  const activeCaptacao = activeId ? captacoes.find(captacao => captacao.id === activeId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Captações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o processo de captação de imóveis
          </p>
        </div>
        <CaptacaoForm onCaptacaoCreated={fetchCaptacoes} />
      </div>

      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ minWidth: '2400px' }}>
            {Object.entries(stageConfig).map(([stage]) => (
              <div key={stage} className="flex-1 min-w-80">
                <CaptacoesColumn 
                  stage={stage} 
                  captacoes={captacoesByStatus[stage] || []} 
                  onRefresh={fetchCaptacoes}
                />
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeCaptacao && (
            <Card className="border-border/40 shadow-lg bg-card rotate-3 opacity-90">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {activeCaptacao.owner_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{activeCaptacao.owner_name}</h4>
                    <p className="text-xs text-muted-foreground">{activeCaptacao.property_type}</p>
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