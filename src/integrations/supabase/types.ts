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
      account_applications: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          address: string
          application_id: string
          bvn: string
          created_at: string
          full_name: string
          id: string
          nin: string
          nin_document_url: string
          notes: string | null
          passport_photo_url: string
          phone_number: string
          referee1_address: string
          referee1_name: string
          referee1_phone: string
          referee2_address: string
          referee2_name: string
          referee2_phone: string
          signature_url: string
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          address: string
          application_id: string
          bvn: string
          created_at?: string
          full_name: string
          id?: string
          nin: string
          nin_document_url: string
          notes?: string | null
          passport_photo_url: string
          phone_number: string
          referee1_address: string
          referee1_name: string
          referee1_phone: string
          referee2_address: string
          referee2_name: string
          referee2_phone: string
          signature_url: string
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address?: string
          application_id?: string
          bvn?: string
          created_at?: string
          full_name?: string
          id?: string
          nin?: string
          nin_document_url?: string
          notes?: string | null
          passport_photo_url?: string
          phone_number?: string
          referee1_address?: string
          referee1_name?: string
          referee1_phone?: string
          referee2_address?: string
          referee2_name?: string
          referee2_phone?: string
          signature_url?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      guarantors: {
        Row: {
          acknowledged: boolean | null
          address: string
          allowances: number | null
          bvn: string
          created_at: string
          employee_id: string
          full_name: string
          id: string
          loan_application_id: string
          organization: string
          other_income: number | null
          phone_number: string
          position: string
          salary: number
          signature_url: string
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean | null
          address: string
          allowances?: number | null
          bvn: string
          created_at?: string
          employee_id: string
          full_name: string
          id?: string
          loan_application_id: string
          organization: string
          other_income?: number | null
          phone_number: string
          position: string
          salary: number
          signature_url: string
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean | null
          address?: string
          allowances?: number | null
          bvn?: string
          created_at?: string
          employee_id?: string
          full_name?: string
          id?: string
          loan_application_id?: string
          organization?: string
          other_income?: number | null
          phone_number?: string
          position?: string
          salary?: number
          signature_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guarantors_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_applications: {
        Row: {
          address: string
          application_id: string
          application_type: Database["public"]["Enums"]["application_type"]
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
      account_applications_masked: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"] | null
          address: string | null
          application_id: string | null
          bvn: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          nin: string | null
          nin_document_url: string | null
          notes: string | null
          passport_photo_url: string | null
          phone_number: string | null
          referee1_address: string | null
          referee1_name: string | null
          referee1_phone: string | null
          referee2_address: string | null
          referee2_name: string | null
          referee2_phone: string | null
          signature_url: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: never
          application_id?: string | null
          bvn?: never
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          nin?: never
          nin_document_url?: never
          notes?: string | null
          passport_photo_url?: never
          phone_number?: never
          referee1_address?: never
          referee1_name?: never
          referee1_phone?: never
          referee2_address?: never
          referee2_name?: never
          referee2_phone?: never
          signature_url?: never
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"] | null
          address?: never
          application_id?: string | null
          bvn?: never
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          nin?: never
          nin_document_url?: never
          notes?: string | null
          passport_photo_url?: never
          phone_number?: never
          referee1_address?: never
          referee1_name?: never
          referee1_phone?: never
          referee2_address?: never
          referee2_name?: never
          referee2_phone?: never
          signature_url?: never
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_application_id: { Args: { prefix: string }; Returns: string }
      get_account_applications_for_operations: {
        Args: never
        Returns: {
          account_type: string
          address: string
          application_id: string
          bvn: string
          created_at: string
          full_name: string
          id: string
          nin: string
          notes: string
          phone_number: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_all_full_account_applications: {
        Args: never
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          address: string
          application_id: string
          bvn: string
          created_at: string
          full_name: string
          id: string
          nin: string
          nin_document_url: string
          notes: string | null
          passport_photo_url: string
          phone_number: string
          referee1_address: string
          referee1_name: string
          referee1_phone: string
          referee2_address: string
          referee2_name: string
          referee2_phone: string
          signature_url: string
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "account_applications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_full_account_application: {
        Args: { app_id: string }
        Returns: {
          account_type: Database["public"]["Enums"]["account_type"]
          address: string
          application_id: string
          bvn: string
          created_at: string
          full_name: string
          id: string
          nin: string
          nin_document_url: string
          notes: string | null
          passport_photo_url: string
          phone_number: string
          referee1_address: string
          referee1_name: string
          referee1_phone: string
          referee2_address: string
          referee2_name: string
          referee2_phone: string
          signature_url: string
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "account_applications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
      account_type: "savings" | "current" | "corporate"
      app_role: "credit" | "audit" | "coo" | "operations" | "managing_director"
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
      account_type: ["savings", "current", "corporate"],
      app_role: ["credit", "audit", "coo", "operations", "managing_director"],
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
