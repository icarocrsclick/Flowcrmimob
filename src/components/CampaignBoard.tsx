import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Upload, ExternalLink, MessageSquare, Calendar, CheckCircle2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CampaignActionCard } from "@/components/CampaignActionCard"
import { ActionUploadModal } from "@/components/ActionUploadModal"
import { AddActionModal } from "@/components/AddActionModal"
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

type CampaignAction = {
  id: string
  campaign_id: string
  stage: string
  title: string
  description: string | null
  icon: string
  completed: boolean
  notes: string | null
  file_url: string | null
  external_link: string | null
  completion_date: string | null
  created_at: string
}

const stageConfig = {
  "captacao": {
    title: "Captação",
    description: "Preparação e documentação do imóvel",
    color: "bg-blue-500",
    textColor: "text-white"
  },
  "atracao": {
    title: "Atração",
    description: "Criação de conteúdo e anúncios",
    color: "bg-purple-500",
    textColor: "text-white"
  },
  "engajamento": {
    title: "Engajamento",
    description: "Interação com leads interessados",
    color: "bg-orange-500",
    textColor: "text-white"
  },
  "conversao": {
    title: "Conversão",
    description: "Transformação de leads em clientes",
    color: "bg-green-500",
    textColor: "text-white"
  },
  "pos_venda": {
    title: "Pós-venda",
    description: "Finalização e fidelização",
    color: "bg-indigo-500",
    textColor: "text-white"
  }
}

interface CampaignBoardProps {
  campaignId: string
}

function CampaignColumn({ 
  stage, 
  actions, 
  campaignId,
  onRefresh 
}: { 
  stage: string
  actions: CampaignAction[]
  campaignId: string
  onRefresh: () => void 
}) {
  const config = stageConfig[stage as keyof typeof stageConfig]
  const [showAddAction, setShowAddAction] = useState(false)
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  })

  const completedActions = actions.filter(action => action.completed).length
  const totalActions = actions.length
  
  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className={`${config.color} ${config.textColor} px-4 py-3 rounded-lg`}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{config.title}</h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {completedActions}/{totalActions}
            </Badge>
          </div>
          <p className="text-xs opacity-90">{config.description}</p>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`min-h-96 bg-muted/30 rounded-lg p-3 transition-colors ${
          isOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
        }`}
      >
        <SortableContext items={actions.map(action => action.id)} strategy={verticalListSortingStrategy}>
          {actions.map((action) => (
            <CampaignActionCard 
              key={action.id} 
              action={action} 
              onRefresh={onRefresh} 
            />
          ))}
        </SortableContext>
        
        <Button
          variant="ghost"
          className="w-full mt-3 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
          onClick={() => setShowAddAction(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ação
        </Button>

        <AddActionModal
          campaignId={campaignId}
          stage={stage}
          open={showAddAction}
          onOpenChange={setShowAddAction}
          onActionCreated={onRefresh}
        />
      </div>
    </div>
  )
}

export function CampaignBoard({ campaignId }: CampaignBoardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [actions, setActions] = useState<CampaignAction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchActions = async () => {
    if (!user || !campaignId) return

    try {
      const { data, error } = await supabase
        .from('campaign_actions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true })

      if (error) {
        toast({
          title: "Erro ao carregar ações",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setActions(data || [])
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar as ações da campanha.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [user, campaignId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const actionId = active.id as string
    const newStage = over.id as string

    const currentAction = actions.find(action => action.id === actionId)
    if (currentAction?.stage === newStage) return

    setActions(prevActions => 
      prevActions.map(action => 
        action.id === actionId ? { ...action, stage: newStage } : action
      )
    )

    try {
      const { error } = await supabase
        .from('campaign_actions')
        .update({ stage: newStage })
        .eq('id', actionId)

      if (error) {
        setActions(prevActions => 
          prevActions.map(action => 
            action.id === actionId ? { ...action, stage: currentAction?.stage || 'captacao' } : action
          )
        )
        toast({
          title: "Erro ao mover ação",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Ação movida com sucesso!",
          description: `Ação movida para ${stageConfig[newStage as keyof typeof stageConfig]?.title}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível mover a ação.",
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

  const actionsByStage = Object.keys(stageConfig).reduce((acc, stage) => {
    acc[stage] = actions.filter(action => action.stage === stage)
    return acc
  }, {} as Record<string, CampaignAction[]>)

  const activeAction = activeId ? actions.find(action => action.id === activeId) : null

  return (
    <div className="space-y-6">
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4" style={{ minWidth: '1600px' }}>
            {Object.entries(stageConfig).map(([stage]) => (
              <CampaignColumn 
                key={stage}
                stage={stage} 
                actions={actionsByStage[stage] || []} 
                campaignId={campaignId}
                onRefresh={fetchActions}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeAction && (
            <Card className="border-border/40 shadow-lg bg-card rotate-3 opacity-90">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={activeAction.completed} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{activeAction.title}</h4>
                    {activeAction.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeAction.description}
                      </p>
                    )}
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