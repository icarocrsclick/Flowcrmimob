import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Eye, Edit, Trash2, MapPin, Home } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CampaignForm } from "@/components/CampaignForm"
import { useNavigate } from "react-router-dom"

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
  _count?: {
    total_actions: number
    completed_actions: number
  }
}

const Campaigns = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchCampaigns = async () => {
    if (!user) return

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
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Erro ao carregar campanhas",
          description: error.message,
          variant: "destructive"
        })
      } else {
        // Fetch action counts for each campaign
        const campaignsWithCounts = await Promise.all(
          (data || []).map(async (campaign) => {
            const { data: actions } = await supabase
              .from('campaign_actions')
              .select('completed')
              .eq('campaign_id', campaign.id)

            const totalActions = actions?.length || 0
            const completedActions = actions?.filter(action => action.completed).length || 0

            return {
              ...campaign,
              _count: {
                total_actions: totalActions,
                completed_actions: completedActions
              }
            }
          })
        )
        setCampaigns(campaignsWithCounts)
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar as campanhas.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [user])

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta campanha?')) return

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) {
        toast({
          title: "Erro ao excluir campanha",
          description: error.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Campanha excluída com sucesso!",
        })
        fetchCampaigns()
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir a campanha.",
        variant: "destructive"
      })
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas de Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas campanhas de marketing imobiliário
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie sua primeira campanha de marketing para começar a promover seus imóveis.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = campaign._count?.total_actions 
              ? (campaign._count.completed_actions / campaign._count.total_actions) * 100 
              : 0

            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{campaign.title}</CardTitle>
                      <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                        {getStatusText(campaign.status)}
                      </Badge>
                    </div>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {campaign.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaign.properties && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{campaign.properties.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{campaign.properties.location}</span>
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        R$ {new Intl.NumberFormat('pt-BR').format(campaign.properties.price)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{campaign._count?.completed_actions || 0}/{campaign._count?.total_actions || 0} ações</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewCampaign(campaign.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <CampaignForm 
        open={showForm}
        onOpenChange={setShowForm}
        onCampaignCreated={fetchCampaigns}
      />
    </div>
  )
}

export default Campaigns