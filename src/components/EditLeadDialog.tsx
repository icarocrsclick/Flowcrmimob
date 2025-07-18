import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

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

interface EditLeadDialogProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadUpdated: () => void
}

export function EditLeadDialog({ lead, open, onOpenChange, onLeadUpdated }: EditLeadDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: lead.name,
    email: lead.email || "",
    phone: lead.phone || "",
    value: lead.value || 0,
    notes: lead.notes || "",
    source: lead.source || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações básicas
      if (!formData.name.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive"
        })
        return
      }

      if (formData.email && !formData.email.includes('@')) {
        toast({
          title: "Erro de validação", 
          description: "E-mail deve ser válido",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('leads')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          value: formData.value || null,
          notes: formData.notes.trim() || null,
          source: formData.source.trim() || null
        })
        .eq('id', lead.id)

      if (error) {
        toast({
          title: "Erro ao atualizar lead",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Lead atualizado com sucesso!",
          description: "As informações foram salvas."
        })
        onLeadUpdated()
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar o lead.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Resetar formulário ao cancelar
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      value: lead.value || 0,
      notes: lead.notes || "",
      source: lead.source || ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do lead"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor de Interesse (R$)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Origem</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              placeholder="Website, indicação, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre o lead..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}