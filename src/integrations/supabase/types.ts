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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          founded_year: number | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          size_range: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          size_range?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size_range?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string | null
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string | null
          notes: string | null
          portfolio_url: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_id?: string | null
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string | null
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string | null
          company_id: string | null
          created_at: string
          description: string
          experience_level: Database["public"]["Enums"]["experience_level"]
          expires_at: string | null
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          location_type: Database["public"]["Enums"]["job_location_type"]
          posted_by: string | null
          requirements: string | null
          requires_wallet: boolean | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          title: string
          token_amount: number | null
          token_compensation: string | null
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          company_id?: string | null
          created_at?: string
          description: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          location_type?: Database["public"]["Enums"]["job_location_type"]
          posted_by?: string | null
          requirements?: string | null
          requires_wallet?: boolean | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          title: string
          token_amount?: number | null
          token_compensation?: string | null
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          company_id?: string | null
          created_at?: string
          description?: string
          experience_level?: Database["public"]["Enums"]["experience_level"]
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          location_type?: Database["public"]["Enums"]["job_location_type"]
          posted_by?: string | null
          requirements?: string | null
          requires_wallet?: boolean | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          title?: string
          token_amount?: number | null
          token_compensation?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          updated_at: string
          user_id: string
          username: string | null
          wallet_address: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string | null
          saved_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          saved_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          saved_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      application_status:
        | "pending"
        | "reviewed"
        | "interview"
        | "accepted"
        | "rejected"
      experience_level: "entry" | "mid" | "senior" | "lead" | "executive"
      job_location_type: "remote" | "on_site" | "hybrid"
      job_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship"
        | "freelance"
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
      app_role: ["admin", "moderator", "user"],
      application_status: [
        "pending",
        "reviewed",
        "interview",
        "accepted",
        "rejected",
      ],
      experience_level: ["entry", "mid", "senior", "lead", "executive"],
      job_location_type: ["remote", "on_site", "hybrid"],
      job_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "freelance",
      ],
    },
  },
} as const
