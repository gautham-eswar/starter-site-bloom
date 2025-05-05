export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      enhanced_resumes: {
        Row: {
          analysis_data: Json | null
          created_at: string
          enhanced_data: Json | null
          job_description_text: string | null
          resume_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          enhanced_data?: Json | null
          job_description_text?: string | null
          resume_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          enhanced_data?: Json | null
          job_description_text?: string | null
          resume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_resume"
            columns: ["resume_id"]
            isOneToOne: true
            referencedRelation: "resumes_new"
            referencedColumns: ["id"]
          },
        ]
      }
      job_descriptions: {
        Row: {
          created_at: string | null
          description: string
          id: string
          requirements: Json | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id: string
          requirements?: Json | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          requirements?: Json | null
          title?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          current_stage: string | null
          duration: string | null
          id: string
          status: string
          timestamp: string
          type: string
        }
        Insert: {
          current_stage?: string | null
          duration?: string | null
          id: string
          status: string
          timestamp?: string
          type: string
        }
        Update: {
          current_stage?: string | null
          duration?: string | null
          id?: string
          status?: string
          timestamp?: string
          type?: string
        }
        Relationships: []
      }
      openai_usage: {
        Row: {
          cost: number
          created_at: string
          id: string
          job_id: string
          model: string
          tokens_completion: number
          tokens_prompt: number
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          job_id: string
          model: string
          tokens_completion: number
          tokens_prompt: number
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          job_id?: string
          model?: string
          tokens_completion?: number
          tokens_prompt?: number
        }
        Relationships: []
      }
      optimization_jobs: {
        Row: {
          created_at: string
          id: string
          job_description: string
          keywords_extracted: Json | null
          match_details: Json | null
          matches: number | null
          modifications: Json | null
          resume_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_description: string
          keywords_extracted?: Json | null
          match_details?: Json | null
          matches?: number | null
          modifications?: Json | null
          resume_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          job_description?: string
          keywords_extracted?: Json | null
          match_details?: Json | null
          matches?: number | null
          modifications?: Json | null
          resume_id?: string
          status?: string
        }
        Relationships: []
      }
      resume_optimizer_errors: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          job_description: string | null
          keywords: Json | null
          pipeline_step: string | null
          resume_bullet_points: Json | null
          resume_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id: string
          job_description?: string | null
          keywords?: Json | null
          pipeline_step?: string | null
          resume_bullet_points?: Json | null
          resume_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          job_description?: string | null
          keywords?: Json | null
          pipeline_step?: string | null
          resume_bullet_points?: Json | null
          resume_id?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          data: Json | null
          enhancement_id: string | null
          file_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          enhancement_id?: string | null
          file_name: string
          id: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          enhancement_id?: string | null
          file_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes_enhanced: {
        Row: {
          content_type: string
          created_at: string | null
          data: Json
          enhanced_data: Json | null
          id: string
          original_filename: string
          updated_at: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          data: Json
          enhanced_data?: Json | null
          id: string
          original_filename: string
          updated_at?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          data?: Json
          enhanced_data?: Json | null
          id?: string
          original_filename?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resumes_new: {
        Row: {
          created_at: string
          id: string
          original_filename: string | null
          parsed_data: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          original_filename?: string | null
          parsed_data?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          original_filename?: string | null
          parsed_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          completed_at: string | null
          duration: number | null
          endpoint: string
          error: string | null
          id: string
          method: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          duration?: number | null
          endpoint: string
          error?: string | null
          id: string
          method: string
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          duration?: number | null
          endpoint?: string
          error?: string | null
          id?: string
          method?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
