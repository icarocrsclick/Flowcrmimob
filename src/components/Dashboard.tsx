import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Building2, Users, TrendingUp, Target, Calendar, Plus } from "lucide-react"
import { LeadForm } from "./LeadForm"

export const Dashboard = () => {
  const { user, isManager, profile } = useAuth()
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    inProgress: 0,
    converted: 0
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, isManager])

  const fetchDashboardData = async () => {
    try {
      // Fetch leads based on user role
      let leadsQuery = supabase.from('leads').select('*')
      
      if (!isManager) {
        leadsQuery = leadsQuery.eq('assigned_to', user?.id)
      }

      const { data: leads } = await leadsQuery

      if (leads) {
        // Calculate stats
        const totalLeads = leads.length
        const newLeads = leads.filter(lead => lead.status === 'novo').length
        const inProgress = leads.filter(lead => ['qualificado', 'visita', 'proposta'].includes(lead.status)).length
        const converted = leads.filter(lead => lead.status === 'fechado').length

        setStats({
          totalLeads,
          newLeads,
          inProgress,
          converted
        })

        // Get recent leads (last 5)
        const recent = leads
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        
        setRecentLeads(recent)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "novo": return "bg-lead-new text-white"
      case "qualificado": return "bg-lead-qualified text-white"
      case "visita": return "bg-lead-visit text-white"  
      case "proposta": return "bg-lead-proposal text-white"
      case "fechado": return "bg-lead-won text-white"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      novo: 'Novo Lead',
      qualificado: 'Qualificado', 
      visita: 'Visita',
      proposta: 'Proposta',
      fechado: 'Fechado',
      perdido: 'Perdido'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Olá, {profile?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {isManager ? 'Visão geral de todos os leads' : 'Gerencie seus leads e oportunidades'}
          </p>
        </div>
        <LeadForm onLeadCreated={fetchDashboardData} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalLeads}</div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lead-new/10">
                <Plus className="w-5 h-5 text-lead-new" />
              </div>
              <div>
                <div className="text-2xl font-bold text-lead-new">{stats.newLeads}</div>
                <p className="text-sm text-muted-foreground">Novos Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lead-visit/10">
                <TrendingUp className="w-5 h-5 text-lead-visit" />
              </div>
              <div>
                <div className="text-2xl font-bold text-lead-visit">{stats.inProgress}</div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lead-won/10">
                <Target className="w-5 h-5 text-lead-won" />
              </div>
              <div>
                <div className="text-2xl font-bold text-lead-won">{stats.converted}</div>
                <p className="text-sm text-muted-foreground">Convertidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="border-border/40 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Leads Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length > 0 ? (
            <div className="space-y-4">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border-b border-border/40 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {lead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(lead.status)} px-2 py-1 text-xs`}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lead encontrado</p>
              <p className="text-sm">Crie seu primeiro lead para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}