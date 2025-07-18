import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus } from "lucide-react"

type Property = {
  id: string
  title: string
  location: string
  price: number
}

interface CampaignFormProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCampaignCreated: () => void
}

export function CampaignForm({ open, onOpenChange, onCampaignCreated }: CampaignFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_id: '',
    status: 'active'
  })

  const fetchProperties = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, price')
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Erro ao carregar imóveis",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setProperties(data || [])
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os imóveis.",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (open) {
      fetchProperties()
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          title: formData.title,
          description: formData.description || null,
          property_id: formData.property_id || null,
          status: formData.status,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        toast({
          title: "Erro ao criar campanha",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      // Create default actions for the campaign
      const defaultActions = [
        // Captação
        { stage: 'captacao', title: 'Fotos Profissionais', description: 'Contratar fotógrafo profissional para o imóvel', icon: 'camera' },
        { stage: 'captacao', title: 'Tour Virtual', description: 'Criar tour virtual 360° do imóvel', icon: 'video' },
        { stage: 'captacao', title: 'Planta Baixa', description: 'Criar ou digitalizar planta baixa do imóvel', icon: 'map' },
        
        // Atração
        { stage: 'atracao', title: 'Post Instagram', description: 'Criar post atrativo para Instagram', icon: 'instagram' },
        { stage: 'atracao', title: 'Anúncio Facebook', description: 'Configurar anúncio pago no Facebook', icon: 'facebook' },
        { stage: 'atracao', title: 'Portal Imobiliário', description: 'Publicar em portais como ZAP, Viva Real', icon: 'globe' },
        
        // Engajamento
        { stage: 'engajamento', title: 'Stories Interativos', description: 'Criar stories com enquetes e perguntas', icon: 'message-circle' },
        { stage: 'engajamento', title: 'WhatsApp Business', description: 'Configurar mensagens automáticas', icon: 'phone' },
        { stage: 'engajamento', title: 'E-mail Marketing', description: 'Enviar newsletter para leads interessados', icon: 'mail' },
        
        // Conversão
        { stage: 'conversao', title: 'Agendamento de Visitas', description: 'Facilitar agendamento online de visitas', icon: 'calendar' },
        { stage: 'conversao', title: 'Proposta Comercial', description: 'Preparar proposta personalizada', icon: 'file-text' },
        { stage: 'conversao', title: 'Negociação', description: 'Conduzir processo de negociação', icon: 'handshake' },
        
        // Pós-venda
        { stage: 'pos_venda', title: 'Documentação', description: 'Organizar documentação para fechamento', icon: 'folder' },
        { stage: 'pos_venda', title: 'Testemunho', description: 'Coletar depoimento do cliente satisfeito', icon: 'star' },
        { stage: 'pos_venda', title: 'Indicações', description: 'Solicitar indicações de novos clientes', icon: 'users' }
      ]

      const actionsToInsert = defaultActions.map(action => ({
        campaign_id: campaign.id,
        stage: action.stage,
        title: action.title,
        description: action.description,
        icon: action.icon,
        user_id: user.id
      }))

      const { error: actionsError } = await supabase
        .from('campaign_actions')
        .insert(actionsToInsert)

      if (actionsError) {
        console.error('Error creating default actions:', actionsError)
        // Don't fail the campaign creation if actions fail
      }

      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha foi criada com ações padrão."
      })

      setFormData({
        title: '',
        description: '',
        property_id: '',
        status: 'active'
      })

      onCampaignCreated()
      onOpenChange?.(false)

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar a campanha.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const DialogComponent = onOpenChange ? Dialog : 'div'
  const TriggerComponent = onOpenChange ? DialogTrigger : 'div'

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      {onOpenChange && (
        <TriggerComponent asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </TriggerComponent>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Campanha de Marketing</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Campanha *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Campanha Apartamento Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os objetivos desta campanha..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property">Imóvel (Opcional)</Label>
            <Select
              value={formData.property_id || "none"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum imóvel específico</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title} - {property.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Campanha"}
            </Button>
            {onOpenChange && (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </DialogComponent>
  )
}