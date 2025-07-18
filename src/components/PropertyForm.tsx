import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const propertyTypes = [
  "Casa",
  "Apartamento", 
  "Cobertura",
  "Studio",
  "Comercial",
  "Terreno"
]

const propertyStatuses = [
  "Disponível",
  "Vendido",
  "Reservado",
  "Em Negociação"
]

interface PropertyFormProps {
  onPropertyCreated?: () => void
}

export function PropertyForm({ onPropertyCreated }: PropertyFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { profile } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    type: "",
    status: "Disponível"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar imóveis",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          location: formData.location,
          price: parseFloat(formData.price.replace(/[^\d,]/g, '').replace(',', '.')),
          description: formData.description || null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.area ? parseFloat(formData.area) : null,
          created_by: profile.id
        })

      if (error) throw error

      toast({
        title: "Sucesso!",
        description: "Imóvel cadastrado com sucesso"
      })

      setFormData({
        title: "",
        location: "",
        price: "",
        description: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        type: "",
        status: "Disponível"
      })
      setOpen(false)
      onPropertyCreated?.()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar imóvel",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          Novo Imóvel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Cadastrar Novo Imóvel</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ex: Casa 3 quartos no Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Endereço*</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ex: Rua das Flores, 123 - Centro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Valor*</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Ex: 450000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área (m²)</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="Ex: 120"
                type="number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                value={formData.bedrooms}
                onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                placeholder="Ex: 3"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input
                id="bathrooms"
                value={formData.bathrooms}
                onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                placeholder="Ex: 2"
                type="number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva as características do imóvel..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-hover"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}