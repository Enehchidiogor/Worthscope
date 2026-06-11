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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      jobs_curated: {
        Row: {
          apply_url: string
          career_paths: string[]
          company: string
          company_logo_url: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          is_active: boolean
          job_type: string
          location: string
          posted_at: string
          requirements: string[]
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          apply_url: string
          career_paths?: string[]
          company: string
          company_logo_url?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type: string
          location: string
          posted_at?: string
          requirements?: string[]
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string
          career_paths?: string[]
          company?: string
          company_logo_url?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          job_type?: string
          location?: string
          posted_at?: string
          requirements?: string[]
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      koko_roadmaps: {
        Row: {
          career: string | null
          created_at: string
          id: string
          roadmap_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          career?: string | null
          created_at?: string
          id?: string
          roadmap_json: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          career?: string | null
          created_at?: string
          id?: string
          roadmap_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_lessons: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          learning_signal: string
          lesson_md: string | null
          mission_id: string
          mission_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          learning_signal?: string
          lesson_md?: string | null
          mission_id: string
          mission_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          learning_signal?: string
          lesson_md?: string | null
          mission_id?: string
          mission_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_projects: {
        Row: {
          assessment_md: string | null
          brief_md: string | null
          created_at: string
          id: string
          mission_id: string
          submission: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_md?: string | null
          brief_md?: string | null
          created_at?: string
          id?: string
          mission_id: string
          submission?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_md?: string | null
          brief_md?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          submission?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          icon: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_viewed_at: string | null
          parent_email: string | null
          parent_label: string | null
          revoked_at: string | null
          student_user_id: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          last_viewed_at?: string | null
          parent_email?: string | null
          parent_label?: string | null
          revoked_at?: string | null
          student_user_id: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_viewed_at?: string | null
          parent_email?: string | null
          parent_label?: string | null
          revoked_at?: string | null
          student_user_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_invites_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          career_path: string | null
          created_at: string
          education_level: string | null
          id: string
          koko_avatar: string
          name: string | null
          onboarding_tour_completed: boolean
          overall_progress: number
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          career_path?: string | null
          created_at?: string
          education_level?: string | null
          id: string
          koko_avatar?: string
          name?: string | null
          onboarding_tour_completed?: boolean
          overall_progress?: number
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          career_path?: string | null
          created_at?: string
          education_level?: string | null
          id?: string
          koko_avatar?: string
          name?: string | null
          onboarding_tour_completed?: boolean
          overall_progress?: number
          updated_at?: string
        }
        Relationships: []
      }
      student_state: {
        Row: {
          active_career_module: string | null
          assessment_results: Json | null
          chosen_career: Json | null
          completed_missions: Json
          created_at: string
          current_streak: number
          last_visit_date: string | null
          roadmap_done: Json
          signup_date: string | null
          skills: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          active_career_module?: string | null
          assessment_results?: Json | null
          chosen_career?: Json | null
          completed_missions?: Json
          created_at?: string
          current_streak?: number
          last_visit_date?: string | null
          roadmap_done?: Json
          signup_date?: string | null
          skills?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          active_career_module?: string | null
          assessment_results?: Json | null
          chosen_career?: Json | null
          completed_missions?: Json
          created_at?: string
          current_streak?: number
          last_visit_date?: string | null
          roadmap_done?: Json
          signup_date?: string | null
          skills?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
