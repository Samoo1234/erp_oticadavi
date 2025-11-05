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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: Json | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          last_purchase: string | null
          loyalty_points: number | null
          name: string
          notes: string | null
          phone: string
          total_purchases: number | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_purchase?: string | null
          loyalty_points?: number | null
          name: string
          notes?: string | null
          phone: string
          total_purchases?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_purchase?: string | null
          loyalty_points?: number | null
          name?: string
          notes?: string | null
          phone?: string
          total_purchases?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          average_cost: number | null
          cost_price: number | null
          created_at: string | null
          current_stock: number
          id: string
          is_active: boolean | null
          last_count_date: string | null
          last_updated: string | null
          location: string
          max_stock: number | null
          min_stock: number | null
          product_id: string
          reserved_stock: number | null
          updated_at: string | null
        }
        Insert: {
          average_cost?: number | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number
          id?: string
          is_active?: boolean | null
          last_count_date?: string | null
          last_updated?: string | null
          location: string
          max_stock?: number | null
          min_stock?: number | null
          product_id: string
          reserved_stock?: number | null
          updated_at?: string | null
        }
        Update: {
          average_cost?: number | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number
          id?: string
          is_active?: boolean | null
          last_count_date?: string | null
          last_updated?: string | null
          location?: string
          max_stock?: number | null
          min_stock?: number | null
          product_id?: string
          reserved_stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          id: string
          inventory_id: string
          movement_date: string | null
          movement_type: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reason: string | null
          reference: string | null
          reference_id: string | null
          total_cost: number | null
          unit_cost: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_id: string
          movement_date?: string | null
          movement_type: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          product_id: string
          quantity: number
          reason?: string | null
          reference?: string | null
          reference_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_id?: string
          movement_date?: string | null
          movement_type?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          product_id?: string
          quantity?: number
          reason?: string | null
          reference?: string | null
          reference_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          client_id: string
          created_at: string | null
          doctor_crm: string | null
          doctor_name: string
          doctor_phone: string | null
          expiration_date: string | null
          id: string
          left_eye: Json
          lens_type: string | null
          medical_notes: string | null
          optician_notes: string | null
          prescription_date: string
          prescription_file: string | null
          pupillary_distance: number | null
          right_eye: Json
          sale_id: string | null
          status: string | null
          treatments: Json | null
          updated_at: string | null
          used_date: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          doctor_crm?: string | null
          doctor_name: string
          doctor_phone?: string | null
          expiration_date?: string | null
          id?: string
          left_eye: Json
          lens_type?: string | null
          medical_notes?: string | null
          optician_notes?: string | null
          prescription_date: string
          prescription_file?: string | null
          pupillary_distance?: number | null
          right_eye: Json
          sale_id?: string | null
          status?: string | null
          treatments?: Json | null
          updated_at?: string | null
          used_date?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          doctor_crm?: string | null
          doctor_name?: string
          doctor_phone?: string | null
          expiration_date?: string | null
          id?: string
          left_eye?: Json
          lens_type?: string | null
          medical_notes?: string | null
          optician_notes?: string | null
          prescription_date?: string
          prescription_file?: string | null
          pupillary_distance?: number | null
          right_eye?: Json
          sale_id?: string | null
          status?: string | null
          treatments?: Json | null
          updated_at?: string | null
          used_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          gender: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_prescription_required: boolean | null
          material: string | null
          max_stock: number | null
          min_stock: number | null
          model: string | null
          name: string
          price: number
          profit_margin: number | null
          sku: string
          specifications: Json | null
          subcategory: string | null
          supplier_id: string | null
          tags: Json | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          gender?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          material?: string | null
          max_stock?: number | null
          min_stock?: number | null
          model?: string | null
          name: string
          price: number
          profit_margin?: number | null
          sku: string
          specifications?: Json | null
          subcategory?: string | null
          supplier_id?: string | null
          tags?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          gender?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          material?: string | null
          max_stock?: number | null
          min_stock?: number | null
          model?: string | null
          name?: string
          price?: number
          profit_margin?: number | null
          sku?: string
          specifications?: Json | null
          subcategory?: string | null
          supplier_id?: string | null
          tags?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          actual_delivery: string | null
          created_at: string | null
          discount_amount: number | null
          discount_percentage: number | null
          estimated_delivery: string | null
          id: string
          lens_specifications: Json | null
          notes: string | null
          prescription_data: Json | null
          product_id: string
          production_status: string | null
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          estimated_delivery?: string | null
          id?: string
          lens_specifications?: Json | null
          notes?: string | null
          prescription_data?: Json | null
          product_id: string
          production_status?: string | null
          quantity?: number
          sale_id: string
          subtotal: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          estimated_delivery?: string | null
          id?: string
          lens_specifications?: Json | null
          notes?: string | null
          prescription_data?: Json | null
          product_id?: string
          production_status?: string | null
          quantity?: number
          sale_id?: string
          subtotal?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_id: string
          created_at: string | null
          delivery_address: Json | null
          delivery_date: string | null
          discount_amount: number | null
          discount_percentage: number | null
          gift_message: string | null
          id: string
          installments: number | null
          internal_notes: string | null
          is_gift: boolean | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          prescription_id: string | null
          sale_date: string | null
          sale_number: string
          status: string | null
          subtotal: number
          tax_amount: number | null
          total: number
          updated_at: string | null
          user_id: string
          warranty_expiry: string | null
          warranty_period: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          gift_message?: string | null
          id?: string
          installments?: number | null
          internal_notes?: string | null
          is_gift?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          prescription_id?: string | null
          sale_date?: string | null
          sale_number: string
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string | null
          user_id: string
          warranty_expiry?: string | null
          warranty_period?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          gift_message?: string | null
          id?: string
          installments?: number | null
          internal_notes?: string | null
          is_gift?: boolean | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          prescription_id?: string | null
          sale_date?: string | null
          sale_number?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string
          warranty_expiry?: string | null
          warranty_period?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string
          password: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name: string
          password: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string
          password?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
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



