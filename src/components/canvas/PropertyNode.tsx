import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface PropertyNodeProps {
  data: {
    title: string;
    location: string;
    bedrooms?: number;
    bathrooms?: number;
    price: number;
  };
}

export const PropertyNode = ({ data }: PropertyNodeProps) => (
  <div style={{ position: 'relative' }}>
    <Handle type="target" position={Position.Left} style={{ background: '#0ff' }} />
    <Card className="min-w-[200px] bg-card shadow-lg border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building className="w-4 h-4" />
          {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground">{data.location}</p>
          <div className="flex gap-2">
            {data.bedrooms && <Badge variant="secondary">{data.bedrooms} qtos</Badge>}
            {data.bathrooms && <Badge variant="secondary">{data.bathrooms} banh</Badge>}
          </div>
          <p className="font-medium text-primary">
            R$ {Number(data.price).toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
    <Handle type="source" position={Position.Right} style={{ background: '#0ff' }} />
  </div>
);