import React from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
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
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
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