export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      canvas_nodes: {
        Row: {
          created_at: string
          id: string
          node_id: string
          node_type: string
          position_x: number
          position_y: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          node_id: string
          node_type: string
          position_x?: number
          position_y?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          node_id?: string
          node_type?: string
          position_x?: number
          position_y?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      captacoes: {
        Row: {
          address: string
          assigned_to: string
          contact: string | null
          created_at: string
          documentation_status: string
          estimated_value: number | null
          id: string
          last_interaction: string | null
          notes: string | null
          owner_name: string
          property_type: string
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address: string
          assigned_to: string
          contact?: string | null
          created_at?: string
          documentation_status?: string
          estimated_value?: number | null
          id?: string
          last_interaction?: string | null
          notes?: string | null
          owner_name: string
          property_type: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string
          assigned_to?: string
          contact?: string | null
          created_at?: string
          documentation_status?: string
          estimated_value?: number | null
          id?: string
          last_interaction?: string | null
          notes?: string | null
          owner_name?: string
          property_type?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      documentos_checklist: {
        Row: {
          created_at: string
          data_marcado: string | null
          id: string
          imovel_id: string
          marcado: boolean
          tipo_documento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_marcado?: string | null
          id?: string
          imovel_id: string
          marcado?: boolean
          tipo_documento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_marcado?: string | null
          id?: string
          imovel_id?: string
          marcado?: boolean
          tipo_documento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documentos_imovel: {
        Row: {
          created_at: string
          data_upload: string
          id: string
          imovel_id: string
          nome_arquivo: string
          tipo_documento: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_upload?: string
          id?: string
          imovel_id: string
          nome_arquivo: string
          tipo_documento: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_upload?: string
          id?: string
          imovel_id?: string
          nome_arquivo?: string
          tipo_documento?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_properties: {
        Row: {
          created_at: string
          lead_id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          lead_id: string
          property_id: string
        }
        Update: {
          created_at?: string
          lead_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_properties_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position_x: number | null
          position_y: number | null
          source: string | null
          status: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position_x?: number | null
          position_y?: number | null
          source?: string | null
          status?: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position_x?: number | null
          position_y?: number | null
          source?: string | null
          status?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          location: string
          photos: string[] | null
          position_x: number | null
          position_y: number | null
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          location: string
          photos?: string[] | null
          position_x?: number | null
          position_y?: number | null
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          area?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          location?: string
          photos?: string[] | null
          position_x?: number | null
          position_y?: number | null
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_manager: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
