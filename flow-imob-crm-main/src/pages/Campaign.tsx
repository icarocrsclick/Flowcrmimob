import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Settings } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CampaignBoard } from "@/components/CampaignBoard"

type Campaign = {
  id: string
  property_id: string | null
  title: string
  description: string | null
  status: string
  created_at: string
  properties?: {
    title: string
    location: string
    price: number
  }
}

const Campaign = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCampaign = async () => {
    if (!user || !id) return

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          properties (
            title,
            location,
            price
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        toast({
          title: "Erro ao carregar campanha",
          description: error.message,
          variant: "destructive"
        })
        navigate('/campaigns')
      } else {
        setCampaign(data)
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar a campanha.",
        variant: "destructive"
      })
      navigate('/campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaign()
  }, [user, id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'paused': return 'Pausada'
      case 'completed': return 'Concluída'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Campanha não encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              A campanha que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => navigate('/campaigns')}>
              Voltar para Campanhas
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{campaign.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                {getStatusText(campaign.status)}
              </Badge>
              {campaign.properties && (
                <span className="text-muted-foreground">
                  {campaign.properties.title} - {campaign.properties.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </div>

      {campaign.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descrição da Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      <CampaignBoard campaignId={campaign.id} />
    </div>
  )
}

export default Campaign