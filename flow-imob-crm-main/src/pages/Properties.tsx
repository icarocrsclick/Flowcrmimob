import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin, MoreHorizontal, Building2, Bed, Bath, Square } from "lucide-react"
import { PropertyForm } from "@/components/PropertyForm"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface Property {
  id: string
  title: string
  location: string
  price: number
  description?: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  created_at: string
  created_by: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Disponível": return "bg-accent text-accent-foreground"
    case "Vendido": return "bg-lead-won text-white"
    case "Reservado": return "bg-lead-qualified text-white"
    case "Em Negociação": return "bg-lead-proposal text-white"
    default: return "bg-muted text-muted-foreground"
  }
}

function PropertyRow({ property }: { property: Property }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/40 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-foreground">{property.title}</h4>
            <Badge className="bg-accent text-accent-foreground px-2 py-1 text-xs font-medium">
              Disponível
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {property.location}
            </span>
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                {property.bedrooms}q
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="w-3 h-3" />
                {property.bathrooms}b
              </span>
            )}
            {property.area && (
              <span className="flex items-center gap-1">
                <Square className="w-3 h-3" />
                {property.area}m²
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right hidden md:block">
          <p className="font-bold text-lg text-foreground">{formatPrice(property.price)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(property.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties(data || [])
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar imóveis",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyCreated = () => {
    fetchProperties()
  }

  const totalProperties = properties.length
  const availableProperties = properties.length // Por enquanto todos são disponíveis
  const avgPrice = properties.length > 0 
    ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imóveis</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os seus imóveis em um só lugar
          </p>
        </div>
        <PropertyForm onPropertyCreated={handlePropertyCreated} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar imóveis..." 
            className="pl-10 border-border/60 focus:border-primary"
          />
        </div>
        <Button variant="outline" className="shrink-0">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{totalProperties}</div>
            <p className="text-sm text-muted-foreground">Total de Imóveis</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent">{availableProperties}</div>
            <p className="text-sm text-muted-foreground">Disponíveis</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(avgPrice)}
            </div>
            <p className="text-sm text-muted-foreground">Preço Médio</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-lead-won">0</div>
            <p className="text-sm text-muted-foreground">Vendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <Card className="border-border/40 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Todos os Imóveis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando imóveis...
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum imóvel cadastrado ainda.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {properties.map((property) => (
                <PropertyRow key={property.id} property={property} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Properties