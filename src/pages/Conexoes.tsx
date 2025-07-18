import React from 'react';
import { X } from 'lucide-react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LeadNode } from "@/components/canvas/LeadNode";
import { PropertyNode } from "@/components/canvas/PropertyNode";
import { useCanvasData } from "@/hooks/useCanvasData";

const nodeTypes = {
  lead: LeadNode,
  property: PropertyNode,
};

// Edge customizado com botão de exclusão, tipado para React Flow
const DeletableEdge: React.FC<EdgeProps> = ({ id, sourceX, sourceY, targetX, targetY, selected, data }) => {
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;
  return (
    <g>
      <path
        d={`M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`}
        stroke="#0ff"
        strokeWidth={2}
        fill="none"
      />
      <foreignObject x={centerX - 12} y={centerY - 12} width={24} height={24} style={{ overflow: 'visible' }}>
        <button
          onClick={e => {
            e.stopPropagation();
            if (data && data.onDelete) data.onDelete(id);
          }}
          style={{
            background: '#fff',
            border: '1px solid #0ff',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: selected ? '0 0 0 2px #0ff' : undefined,
          }}
        >
          <X size={16} color="#0ff" />
        </button>
      </foreignObject>
    </g>
  );
};

const edgeTypes = {
  deletable: DeletableEdge,
};

export default function Conexoes() {
  const {
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
  } = useCanvasData();

  // Adiciona função de deletar edge ao clicar no botão
  const handleDeleteEdge = React.useCallback(
    (id: string) => {
      const edge = edges.find(e => e.id === id);
      if (edge) {
        onEdgesDelete([edge]);
      }
    },
    [edges, onEdgesDelete]
  );

  // Adiciona data.onDelete em cada edge
  const edgesWithDelete = React.useMemo(() => edges.map(edge => ({
    ...edge,
    type: 'deletable',
    data: { ...(edge.data || {}), onDelete: handleDeleteEdge },
  })), [edges, handleDeleteEdge]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Conexões</h1>
          <p className="text-muted-foreground">
            Conecte leads a imóveis visualmente
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={autoLayout} variant="outline">
            Auto Layout
          </Button>
          <Button onClick={loadData} variant="outline">
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex-1" style={{ height: 'calc(100vh - 140px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edgesWithDelete}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-background"
        >
          <Controls />
          <MiniMap 
            nodeStrokeColor="#374151"
            nodeColor="#f3f4f6"
            nodeBorderRadius={8}
          />
          <Background color="#e5e7eb" gap={20} />
        </ReactFlow>
      </div>
    </div>
  );
}