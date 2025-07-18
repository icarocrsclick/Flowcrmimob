import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Upload, ExternalLink, FileText } from "lucide-react"

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

interface ActionUploadModalProps {
  action: CampaignAction
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionUpdated: () => void
}

export function ActionUploadModal({ action, open, onOpenChange, onActionUpdated }: ActionUploadModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    notes: action.notes || '',
    external_link: action.external_link || '',
    file_url: action.file_url || ''
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${action.id}-${Date.now()}.${fileExt}`
      const filePath = `campaign-files/${fileName}`

      // Try to upload to storage, fallback to base64 if storage bucket doesn't exist
      let publicUrl = ''
      
      try {
        const { error: uploadError } = await supabase.storage
          .from('campaign-files')
          .upload(filePath, file)

        if (uploadError) {
          // If storage bucket doesn't exist, convert to base64 for now
          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            setFormData(prev => ({ ...prev, file_url: base64 }))
            toast({
              title: "Arquivo anexado!",
              description: "O arquivo foi convertido e anexado à ação."
            })
          }
          reader.readAsDataURL(file)
          return
        }

        const { data: { publicUrl: url } } = supabase.storage
          .from('campaign-files')
          .getPublicUrl(filePath)
        
        publicUrl = url
        setFormData(prev => ({ ...prev, file_url: publicUrl }))
      } catch (storageError) {
        // Fallback to base64 if storage is not available
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result as string
          setFormData(prev => ({ ...prev, file_url: base64 }))
          toast({
            title: "Arquivo anexado!",
            description: "O arquivo foi convertido e anexado à ação."
          })
        }
        reader.readAsDataURL(file)
        return
      }

      toast({
        title: "Arquivo enviado com sucesso!",
        description: "O arquivo foi anexado à ação."
      })

    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível fazer upload do arquivo.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('campaign_actions')
        .update({
          notes: formData.notes || null,
          external_link: formData.external_link || null,
          file_url: formData.file_url || null
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
          title: "Ação atualizada com sucesso!",
          description: "As informações foram salvas."
        })
        onActionUpdated()
        onOpenChange(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ação: {action.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Adicione observações sobre esta ação..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_link">Link Externo</Label>
            <div className="flex gap-2">
              <ExternalLink className="w-4 h-4 text-muted-foreground mt-3" />
              <Input
                id="external_link"
                type="url"
                value={formData.external_link}
                onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                placeholder="https://instagram.com/p/..."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Link para post no Instagram, Facebook, ou outro conteúdo relacionado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                {uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </div>
              {formData.file_url && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <a 
                    href={formData.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline truncate"
                  >
                    Arquivo anexado
                  </a>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Imagens, vídeos, PDFs ou documentos relacionados à ação
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || uploading} className="flex-1">
              {loading ? "Salvando..." : "Salvar"}
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