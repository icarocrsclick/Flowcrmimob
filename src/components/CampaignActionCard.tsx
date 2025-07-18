import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Upload, 
  ExternalLink, 
  MessageSquare, 
  Calendar, 
  CheckCircle2,
  Camera,
  Video,
  Map,
  Instagram,
  Facebook,
  Globe,
  Phone,
  Mail,
  FileText,
  Handshake,
  Folder,
  Star,
  Users,
  Edit,
  Trash2
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ActionUploadModal } from "@/components/ActionUploadModal"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface CampaignActionCardProps {
  action: CampaignAction
  onRefresh: () => void
}

const iconMap = {
  camera: Camera,
  video: Video,
  map: Map,
  instagram: Instagram,
  facebook: Facebook,
  globe: Globe,
  'message-circle': MessageSquare,
  phone: Phone,
  mail: Mail,
  calendar: Calendar,
  'file-text': FileText,
  handshake: Handshake,
  folder: Folder,
  star: Star,
  users: Users,
  upload: Upload,
  'external-link': ExternalLink,
  'check-circle-2': CheckCircle2
}

export function CampaignActionCard({ action, onRefresh }: CampaignActionCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const IconComponent = iconMap[action.icon as keyof typeof iconMap] || CheckCircle2

  const handleToggleComplete = async (completed: boolean) => {
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('campaign_actions')
        .update({ 
          completed,
          completion_date: completed ? new Date().toISOString() : null
        })
        .eq('id', action.id)

      if (error) {
        toast({
          title: "Erro ao atualizar ação",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: completed ? "Ação concluída!" : "Ação marcada como pendente",
          description: action.title
        })
        onRefresh()
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar a ação.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta ação?')) return

    try {
      const { error } = await supabase
        .from('campaign_actions')
        .delete()
        .eq('id', action.id)

      if (error) {
        toast({
          title: "Erro ao excluir ação",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Ação excluída com sucesso!"
        })
        onRefresh()
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir a ação.",
        variant: "destructive"
      })
    }
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
        <Card className={`border-border/40 shadow-card hover:shadow-card-hover cursor-grab active:cursor-grabbing transition-all duration-200 ${
          action.completed ? 'bg-green-50 border-green-200' : 'bg-card'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                checked={action.completed}
                onCheckedChange={handleToggleComplete}
                disabled={loading}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <h4 className={`font-semibold text-sm ${action.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {action.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUploadModal(true)
                      }}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-muted text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete()
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {action.description && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {action.description}
                  </p>
                )}

                <div className="space-y-2">
                  {action.file_url && (
                    <div className="flex items-center gap-2">
                      <Upload className="w-3 h-3 text-blue-500" />
                      <a 
                        href={action.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate"
                      >
                        Arquivo anexado
                      </a>
                    </div>
                  )}

                  {action.external_link && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 text-purple-500" />
                      <a 
                        href={action.external_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-purple-500 hover:underline truncate"
                      >
                        Link externo
                      </a>
                    </div>
                  )}

                  {action.notes && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3 h-3 text-orange-500 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {action.notes}
                      </p>
                    </div>
                  )}

                  {action.completion_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        Concluído em {new Date(action.completion_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {action.completed && (
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    Concluído
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActionUploadModal
        action={action}
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onActionUpdated={onRefresh}
      />
    </>
  )
}