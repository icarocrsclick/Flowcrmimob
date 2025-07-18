import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface LeadNodeProps {
  data: {
    name: string;
    email?: string;
    phone?: string;
    status: string;
    value?: number;
  };
}

export const LeadNode = ({ data }: LeadNodeProps) => (
  <Card className="min-w-[200px] bg-card shadow-lg border-l-4 border-l-accent">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        <Users className="w-4 h-4" />
        {data.name}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-1 text-xs">
        {data.email && <p className="text-muted-foreground">{data.email}</p>}
        {data.phone && <p className="text-muted-foreground">{data.phone}</p>}
        <Badge variant="outline" className="text-xs">
          {data.status}
        </Badge>
        {data.value && (
          <p className="font-medium text-primary">
            R$ {Number(data.value).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);