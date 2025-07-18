import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AddActionModalProps {
  campaignId: string
  stage: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionCreated: () => void
}

const iconOptions = [
  { value: 'camera', label: 'Câmera' },
  { value: 'video', label: 'Vídeo' },
  { value: 'map', label: 'Mapa' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'globe', label: 'Website' },
  { value: 'message-circle', label: 'Mensagem' },
  { value: 'phone', label: 'Telefone' },
  { value: 'mail', label: 'Email' },
  { value: 'calendar', label: 'Calendário' },
  { value: 'file-text', label: 'Documento' },
  { value: 'handshake', label: 'Negociação' },
  { value: 'folder', label: 'Pasta' },
  { value: 'star', label: 'Estrela' },
  { value: 'users', label: 'Usuários' },
  { value: 'upload', label: 'Upload' },
  { value: 'external-link', label: 'Link Externo' },
  { value: 'check-circle-2', label: 'Check' }
]

export function AddActionModal({ campaignId, stage, open, onOpenChange, onActionCreated }: AddActionModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'check-circle-2'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !campaignId) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('campaign_actions')
        .insert({
          campaign_id: campaignId,
          stage: stage,
          title: formData.title,
          description: formData.description || null,
          icon: formData.icon,
          user_id: user.id
        })

      if (error) {
        toast({
          title: "Erro ao criar ação",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Ação criada com sucesso!",
          description: "A nova ação foi adicionada à campanha."
        })

        setFormData({
          title: '',
          description: '',
          icon: 'check-circle-2'
        })

        onActionCreated()
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar a ação.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Ação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Ação *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Criar post no Instagram"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que precisa ser feito..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Ícone</Label>
            <Select
              value={formData.icon || 'check-circle-2'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Ação"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}