import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

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

interface EditCaptacaoDialogProps {
  captacao: Captacao
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaptacaoUpdated: () => void
}

export function EditCaptacaoDialog({ captacao, open, onOpenChange, onCaptacaoUpdated }: EditCaptacaoDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    owner_name: captacao.owner_name,
    contact: captacao.contact || "",
    address: captacao.address,
    property_type: captacao.property_type,
    estimated_value: captacao.estimated_value || 0,
    documentation_status: captacao.documentation_status,
    notes: captacao.notes || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validações básicas
      if (!formData.owner_name.trim()) {
        toast({
          title: "Erro de validação",
          description: "Nome do proprietário é obrigatório",
          variant: "destructive"
        })
        return
      }

      if (!formData.address.trim()) {
        toast({
          title: "Erro de validação",
          description: "Endereço é obrigatório",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('captacoes')
        .update({
          owner_name: formData.owner_name.trim(),
          contact: formData.contact.trim() || null,
          address: formData.address.trim(),
          property_type: formData.property_type,
          estimated_value: formData.estimated_value || null,
          documentation_status: formData.documentation_status,
          notes: formData.notes.trim() || null,
          last_interaction: new Date().toISOString()
        })
        .eq('id', captacao.id)

      if (error) {
        toast({
          title: "Erro ao atualizar captação",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Captação atualizada com sucesso!",
          description: "As informações foram salvas."
        })
        onCaptacaoUpdated()
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar a captação.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Resetar formulário ao cancelar
    setFormData({
      owner_name: captacao.owner_name,
      contact: captacao.contact || "",
      address: captacao.address,
      property_type: captacao.property_type,
      estimated_value: captacao.estimated_value || 0,
      documentation_status: captacao.documentation_status,
      notes: captacao.notes || ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Captação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner_name">Nome do Proprietário *</Label>
            <Input
              id="owner_name"
              value={formData.owner_name}
              onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
              placeholder="Nome do proprietário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contato</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              placeholder="Telefone ou e-mail"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço Completo *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Endereço completo do imóvel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_type">Tipo de Imóvel</Label>
            <Select value={formData.property_type} onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="apartamento">Apartamento</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="chacara">Chácara</SelectItem>
                <SelectItem value="sitio">Sítio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_value">Valor Estimado (R$)</Label>
            <Input
              id="estimated_value"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimated_value}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentation_status">Status da Documentação</Label>
            <Select value={formData.documentation_status} onValueChange={(value) => setFormData(prev => ({ ...prev, documentation_status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status da documentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completo">Completo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações sobre a captação..."
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