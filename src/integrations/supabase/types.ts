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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["application_status"] | null
          notes: string | null
          previous_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          target_id: string
          target_table: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["application_status"] | null
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          target_id: string
          target_table: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["application_status"] | null
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          target_id?: string
          target_table?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          address: string
          application_id: string
          application_type: Database["public"]["Enums"]["application_type"]
          approved_amount: number | null
          audit_approval: boolean | null
          audit_approved_at: string | null
          audit_approved_by: string | null
          bank_account_number: string
          bank_name: string
          bvn: string
          coo_approval: boolean | null
          coo_approved_at: string | null
          coo_approved_by: string | null
          created_at: string
          created_by_admin: string | null
          credit_approval: boolean | null
          credit_approved_at: string | null
          credit_approved_by: string | null
          current_step: number | null
          decline_reason: string | null
          employee_id: string
          full_name: string
          id: string
          is_draft: boolean | null
          loan_amount_range: Database["public"]["Enums"]["loan_amount_range"]
          ministry_department: string
          nin: string
          nin_document_url: string
          notes: string | null
          passport_photo_url: string
          payment_slip_url: string
          phone_number: string
          product_type: Database["public"]["Enums"]["loan_product_type"]
          repayment_period_months: number
          signature_url: string
          specific_amount: number
          status: Database["public"]["Enums"]["application_status"] | null
          terms_accepted: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          application_id: string
          application_type: Database["public"]["Enums"]["application_type"]
          approved_amount?: number | null
          audit_approval?: boolean | null
          audit_approved_at?: string | null
          audit_approved_by?: string | null
          bank_account_number: string
          bank_name: string
          bvn: string
          coo_approval?: boolean | null
          coo_approved_at?: string | null
          coo_approved_by?: string | null
          created_at?: string
          created_by_admin?: string | null
          credit_approval?: boolean | null
          credit_approved_at?: string | null
          credit_approved_by?: string | null
          current_step?: number | null
          decline_reason?: string | null
          employee_id: string
          full_name: string
          id?: string
          is_draft?: boolean | null
          loan_amount_range: Database["public"]["Enums"]["loan_amount_range"]
          ministry_department: string
          nin: string
          nin_document_url: string
          notes?: string | null
          passport_photo_url: string
          payment_slip_url: string
          phone_number: string
          product_type: Database["public"]["Enums"]["loan_product_type"]
          repayment_period_months: number
          signature_url: string
          specific_amount: number
          status?: Database["public"]["Enums"]["application_status"] | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          application_id?: string
          application_type?: Database["public"]["Enums"]["application_type"]
          approved_amount?: number | null
          audit_approval?: boolean | null
          audit_approved_at?: string | null
          audit_approved_by?: string | null
          bank_account_number?: string
          bank_name?: string
          bvn?: string
          coo_approval?: boolean | null
          coo_approved_at?: string | null
          coo_approved_by?: string | null
          created_at?: string
          created_by_admin?: string | null
          credit_approval?: boolean | null
          credit_approved_at?: string | null
          credit_approved_by?: string | null
          current_step?: number | null
          decline_reason?: string | null
          employee_id?: string
          full_name?: string
          id?: string
          is_draft?: boolean | null
          loan_amount_range?: Database["public"]["Enums"]["loan_amount_range"]
          ministry_department?: string
          nin?: string
          nin_document_url?: string
          notes?: string | null
          passport_photo_url?: string
          payment_slip_url?: string
          phone_number?: string
          product_type?: Database["public"]["Enums"]["loan_product_type"]
          repayment_period_months?: number
          signature_url?: string
          specific_amount?: number
          status?: Database["public"]["Enums"]["application_status"] | null
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_profile_id: string
          accessor_role: string
          accessor_user_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          access_type?: string
          accessed_at?: string
          accessed_profile_id: string
          accessor_role: string
          accessor_user_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_profile_id?: string
          accessor_role?: string
          accessor_user_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          has_bank_account: boolean | null
          id: string
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          has_bank_account?: boolean | null
          id?: string
          phone_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          has_bank_account?: boolean | null
          id?: string
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          failed_login_attempts: number | null
          id: string
          is_active: boolean | null
          locked_until: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_login_attempts?: number | null
          id?: string
          is_active?: boolean | null
          locked_until?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          failed_login_attempts?: number | null
          id?: string
          is_active?: boolean | null
          locked_until?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_application_id: { Args: { prefix: string }; Returns: string }
      get_profile_with_audit: {
        Args: { profile_user_id: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          has_bank_account: boolean | null
          id: string
          phone_number: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_storage_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "credit" | "audit" | "coo" | "managing_director"
      application_status:
        | "pending"
        | "under_review"
        | "approved"
        | "declined"
        | "flagged"
      application_type: "internal" | "external"
      loan_amount_range: "100k_300k" | "300k_600k" | "600k_1m" | "above_1m"
      loan_product_type: "short_term" | "long_term"
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
    Enums: {
      app_role: ["credit", "audit", "coo", "managing_director"],
      application_status: [
        "pending",
        "under_review",
        "approved",
        "declined",
        "flagged",
      ],
      application_type: ["internal", "external"],
      loan_amount_range: ["100k_300k", "300k_600k", "600k_1m", "above_1m"],
      loan_product_type: ["short_term", "long_term"],
    },
  },
} as const
