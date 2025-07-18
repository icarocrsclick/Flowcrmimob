import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Building, User, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface Captacao {
  id: string
  address: string
  owner_name: string
  property_type: string
  status: string
  created_at: string
}

export default function DocumentacaoIndex() {
  const [captacoes, setCaptacoes] = useState<Captacao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadCaptacoes()
    }
  }, [user])

  const loadCaptacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('captacoes')
        .select('id, address, owner_name, property_type, status, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCaptacoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar captações:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar captações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCaptacoes = captacoes.filter(captacao =>
    captacao.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    captacao.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ativo': 'bg-green-100 text-green-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'concluido': 'bg-blue-100 text-blue-800',
      'cancelado': 'bg-red-100 text-red-800'
    }
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Documentação de Imóveis</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Documentação de Imóveis</h2>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por endereço ou proprietário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCaptacoes.map((captacao) => (
          <Card key={captacao.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-5 h-5" />
                {captacao.property_type}
              </CardTitle>
              <CardDescription>{captacao.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>{captacao.owner_name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(captacao.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusBadge(captacao.status)}>
                    {captacao.status}
                  </Badge>
                  <Button 
                    onClick={() => navigate(`/documentacao-imovel/${captacao.id}`)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Ver Documentação
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCaptacoes.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma captação encontrada</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Tente refinar sua busca' : 'Ainda não há captações cadastradas'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}