import { useCallback, useEffect, useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const useCanvasData = () => {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  // Load data from Supabase
  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load leads and properties
      const [leadsResponse, propertiesResponse, canvasNodesResponse, connectionsResponse] = await Promise.all([
        supabase.from('leads').select('*').eq('assigned_to', user.id),
        supabase.from('properties').select('*').eq('created_by', user.id),
        supabase.from('canvas_nodes').select('*').eq('user_id', user.id),
        supabase.from('lead_properties').select('*')
      ]);

      if (leadsResponse.error) throw leadsResponse.error;
      if (propertiesResponse.error) throw propertiesResponse.error;
      if (canvasNodesResponse.error) throw canvasNodesResponse.error;
      if (connectionsResponse.error) throw connectionsResponse.error;

      setLeads(leadsResponse.data || []);
      setProperties(propertiesResponse.data || []);

      // Create nodes from canvas positions or default positions
      const canvasNodes = canvasNodesResponse.data || [];
      const newNodes: Node[] = [];

      // Add lead nodes
      leadsResponse.data?.forEach((lead, index) => {
        const canvasNode = canvasNodes.find(n => n.node_type === 'lead' && n.node_id === lead.id);
        newNodes.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          position: canvasNode ? 
            { x: Number(canvasNode.position_x), y: Number(canvasNode.position_y) } :
            { x: 100, y: 100 + index * 120 },
          data: lead,
        });
      });

      // Add property nodes
      propertiesResponse.data?.forEach((property, index) => {
        const canvasNode = canvasNodes.find(n => n.node_type === 'property' && n.node_id === property.id);
        newNodes.push({
          id: `property-${property.id}`,
          type: 'property',
          position: canvasNode ? 
            { x: Number(canvasNode.position_x), y: Number(canvasNode.position_y) } :
            { x: 400, y: 100 + index * 120 },
          data: property,
        });
      });

      // Create edges from connections
      const newEdges: Edge[] = connectionsResponse.data?.map(connection => ({
        id: `edge-${connection.lead_id}-${connection.property_id}`,
        source: `lead-${connection.lead_id}`,
        target: `property-${connection.property_id}`,
        type: 'smoothstep',
        animated: true,
      })) || [];

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do canvas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save node position when moved
  const handleNodeDragStop = useCallback(async (event: any, node: Node) => {
    if (!user) return;

    const [nodeType, nodeId] = node.id.split('-');
    
    try {
      const { error } = await supabase
        .from('canvas_nodes')
        .upsert({
          user_id: user.id,
          node_type: nodeType,
          node_id: nodeId,
          position_x: node.position.x,
          position_y: node.position.y,
        }, {
          onConflict: 'user_id,node_type,node_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving node position:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar posição do card",
        variant: "destructive",
      });
    }
  }, [user]);

  // Handle connection creation
  const onConnect = useCallback(async (params: Connection) => {
    if (!user || !params.source || !params.target) return;

    // Extract IDs from node IDs
    const sourceId = params.source.split('-')[1];
    const targetId = params.target.split('-')[1];
    
    // Determine which is lead and which is property
    const isSourceLead = params.source.startsWith('lead-');
    const leadId = isSourceLead ? sourceId : targetId;
    const propertyId = isSourceLead ? targetId : sourceId;

    // Check if connection already exists
    const existingConnection = edges.find(edge => 
      edge.id === `edge-${leadId}-${propertyId}`
    );
    
    if (existingConnection) {
      toast({
        title: "Aviso",
        description: "Esta conexão já existe",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lead_properties')
        .insert({
          lead_id: leadId,
          property_id: propertyId,
        });

      if (error) throw error;

      // Add edge to UI
      setEdges((eds) => addEdge({
        ...params,
        id: `edge-${leadId}-${propertyId}`,
        type: 'smoothstep',
        animated: true,
      }, eds));

      toast({
        title: "Sucesso",
        description: "Conexão criada com sucesso",
      });
    } catch (error) {
      console.error('Error creating connection:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conexão",
        variant: "destructive",
      });
    }
  }, [user, setEdges, edges]);

  // Handle edge deletion
  const onEdgesDelete = useCallback(async (edgesToDelete: Edge[]) => {
    if (!user) return;

    for (const edge of edgesToDelete) {
      const leadId = edge.source.split('-')[1];
      const propertyId = edge.target.split('-')[1];

      try {
        const { error } = await supabase
          .from('lead_properties')
          .delete()
          .eq('lead_id', leadId)
          .eq('property_id', propertyId);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting connection:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar conexão",
          variant: "destructive",
        });
      }
    }
  }, [user]);

  // Auto-layout function
  const autoLayout = useCallback(() => {
    const leadNodes = nodes.filter(n => n.type === 'lead');
    const propertyNodes = nodes.filter(n => n.type === 'property');

    const newNodes = nodes.map(node => {
      if (node.type === 'lead') {
        const index = leadNodes.findIndex(n => n.id === node.id);
        return {
          ...node,
          position: { x: 100, y: 100 + index * 150 },
        };
      } else {
        const index = propertyNodes.findIndex(n => n.id === node.id);
        return {
          ...node,
          position: { x: 500, y: 100 + index * 150 },
        };
      }
    });

    setNodes(newNodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeDragStop,
    onEdgesDelete,
    autoLayout,
    loadData,
    isLoading,
    leads,
    properties,
  };
};