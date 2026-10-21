export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          avatar_url: string | null
          city: string | null
          company: string | null
          company_id: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string
          default_vat: number
          email: string | null
          id: string
          ifu: string | null
          invoice_prefix: string
          logo_url: string | null
          momo_number: string | null
          name: string
          payment_terms: number
          phone: string | null
          rccm: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_vat?: number
          email?: string | null
          id?: string
          ifu?: string | null
          invoice_prefix?: string
          logo_url?: string | null
          momo_number?: string | null
          name?: string
          payment_terms?: number
          phone?: string | null
          rccm?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_vat?: number
          email?: string | null
          id?: string
          ifu?: string | null
          invoice_prefix?: string
          logo_url?: string | null
          momo_number?: string | null
          name?: string
          payment_terms?: number
          phone?: string | null
          rccm?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          invoice_id: string | null
          label: string
          percentage: number
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          invoice_id?: string | null
          label: string
          percentage: number
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_id?: string | null
          label?: string
          percentage?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_installments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_pct: number
          id: string
          invoice_id: string | null
          quantity: number
          sort_order: number
          total: number
          unit_price: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_pct?: number
          id?: string
          invoice_id?: string | null
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_pct?: number
          id?: string
          invoice_id?: string | null
          quantity?: number
          sort_order?: number
          total?: number
          unit_price?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          client_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          discount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          recurrence_config: Json | null
          status: string
          subtotal: number
          total: number
          type: string
          updated_at: string
          vat_amount: number
        }
        Insert: {
          amount_paid?: number
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          discount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          recurrence_config?: Json | null
          status?: string
          subtotal?: number
          total?: number
          type?: string
          updated_at?: string
          vat_amount?: number
        }
        Update: {
          amount_paid?: number
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          discount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          recurrence_config?: Json | null
          status?: string
          subtotal?: number
          total?: number
          type?: string
          updated_at?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          payment_date: string
          reference: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          company_id: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          price: number
          unit: string
          updated_at: string
          vat_rate: number
        }
        Insert: {
          category?: string
          company_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          price?: number
          unit?: string
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          category?: string
          company_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          unit?: string
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
