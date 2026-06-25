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
      ingestion_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          signals_in: number
          signals_kept: number
          source_id: string
          started_at: string
          status: string
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          signals_in?: number
          signals_kept?: number
          source_id: string
          started_at?: string
          status?: string
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          signals_in?: number
          signals_kept?: number
          source_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "trend_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          created_at: string
          id: string
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journeys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jtbd: {
        Row: {
          created_at: string
          description: string | null
          family: string
          id: string
          statement: string
          status: Database["public"]["Enums"]["node_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          family: string
          id?: string
          statement: string
          status?: Database["public"]["Enums"]["node_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          family?: string
          id?: string
          statement?: string
          status?: Database["public"]["Enums"]["node_status"]
        }
        Relationships: []
      }
      mission_profiles: {
        Row: {
          created_at: string
          derived_from: Json | null
          embedding: string | null
          geo_focus: string[]
          id: string
          keywords: string[]
          need_weights: Json
          sector_weights: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          derived_from?: Json | null
          embedding?: string | null
          geo_focus?: string[]
          id?: string
          keywords?: string[]
          need_weights?: Json
          sector_weights?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          derived_from?: Json | null
          embedding?: string | null
          geo_focus?: string[]
          id?: string
          keywords?: string[]
          need_weights?: Json
          sector_weights?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      raw_signals: {
        Row: {
          access_policy_snapshot: Database["public"]["Enums"]["access_policy"]
          dedupe_key: string
          external_id: string | null
          fetched_at: string
          id: string
          payload: Json | null
          published_at: string | null
          snippet: string | null
          source_id: string
          title: string | null
          url: string | null
        }
        Insert: {
          access_policy_snapshot: Database["public"]["Enums"]["access_policy"]
          dedupe_key: string
          external_id?: string | null
          fetched_at?: string
          id?: string
          payload?: Json | null
          published_at?: string | null
          snippet?: string | null
          source_id: string
          title?: string | null
          url?: string | null
        }
        Update: {
          access_policy_snapshot?: Database["public"]["Enums"]["access_policy"]
          dedupe_key?: string
          external_id?: string | null
          fetched_at?: string
          id?: string
          payload?: Json | null
          published_at?: string | null
          snippet?: string | null
          source_id?: string
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "trend_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_trends: {
        Row: {
          created_at: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["saved_status"]
          trend_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["saved_status"]
          trend_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["saved_status"]
          trend_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_trends_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_trends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          created_at: string
          embedding: string | null
          entities: string[]
          geo_hint: string | null
          id: string
          keywords: string[]
          metric_unit: string | null
          metric_value: number | null
          observed_at: string | null
          raw_signal_id: string | null
          signal_type: Database["public"]["Enums"]["signal_type"]
          source_id: string
          summary: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          entities?: string[]
          geo_hint?: string | null
          id?: string
          keywords?: string[]
          metric_unit?: string | null
          metric_value?: number | null
          observed_at?: string | null
          raw_signal_id?: string | null
          signal_type: Database["public"]["Enums"]["signal_type"]
          source_id: string
          summary?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          embedding?: string | null
          entities?: string[]
          geo_hint?: string | null
          id?: string
          keywords?: string[]
          metric_unit?: string | null
          metric_value?: number | null
          observed_at?: string | null
          raw_signal_id?: string | null
          signal_type?: Database["public"]["Enums"]["signal_type"]
          source_id?: string
          summary?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_raw_signal_id_fkey"
            columns: ["raw_signal_id"]
            isOneToOne: true
            referencedRelation: "raw_signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "trend_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      taxonomy_nodes: {
        Row: {
          created_at: string
          description: string | null
          facet: Database["public"]["Enums"]["taxonomy_facet"]
          id: string
          key: string
          label: string
          parent_id: string | null
          status: Database["public"]["Enums"]["node_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          facet: Database["public"]["Enums"]["taxonomy_facet"]
          id?: string
          key: string
          label: string
          parent_id?: string | null
          status?: Database["public"]["Enums"]["node_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          facet?: Database["public"]["Enums"]["taxonomy_facet"]
          id?: string
          key?: string
          label?: string
          parent_id?: string | null
          status?: Database["public"]["Enums"]["node_status"]
        }
        Relationships: [
          {
            foreignKeyName: "taxonomy_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_jtbd: {
        Row: {
          confidence: number
          jtbd_id: string
          trend_id: string
        }
        Insert: {
          confidence?: number
          jtbd_id: string
          trend_id: string
        }
        Update: {
          confidence?: number
          jtbd_id?: string
          trend_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_jtbd_jtbd_id_fkey"
            columns: ["jtbd_id"]
            isOneToOne: false
            referencedRelation: "jtbd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trend_jtbd_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_scores: {
        Row: {
          computed_at: string
          evidence_score: number
          id: string
          momentum_score: number
          trend_id: string
        }
        Insert: {
          computed_at?: string
          evidence_score: number
          id?: string
          momentum_score: number
          trend_id: string
        }
        Update: {
          computed_at?: string
          evidence_score?: number
          id?: string
          momentum_score?: number
          trend_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_scores_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_signals: {
        Row: {
          is_primary: boolean
          signal_id: string
          trend_id: string
          weight: number
        }
        Insert: {
          is_primary?: boolean
          signal_id: string
          trend_id: string
          weight?: number
        }
        Update: {
          is_primary?: boolean
          signal_id?: string
          trend_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "trend_signals_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trend_signals_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trend_sources: {
        Row: {
          access_policy: Database["public"]["Enums"]["access_policy"]
          base_url: string | null
          created_at: string
          enabled: boolean
          id: string
          kind: Database["public"]["Enums"]["source_kind"]
          license_note: string | null
          name: string
          rate_limit_per_min: number
          robots_respected: boolean
        }
        Insert: {
          access_policy: Database["public"]["Enums"]["access_policy"]
          base_url?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          kind: Database["public"]["Enums"]["source_kind"]
          license_note?: string | null
          name: string
          rate_limit_per_min?: number
          robots_respected?: boolean
        }
        Update: {
          access_policy?: Database["public"]["Enums"]["access_policy"]
          base_url?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["source_kind"]
          license_note?: string | null
          name?: string
          rate_limit_per_min?: number
          robots_respected?: boolean
        }
        Relationships: []
      }
      trend_taxonomy: {
        Row: {
          confidence: number
          node_id: string
          source: Database["public"]["Enums"]["classification_source"]
          trend_id: string
        }
        Insert: {
          confidence?: number
          node_id: string
          source?: Database["public"]["Enums"]["classification_source"]
          trend_id: string
        }
        Update: {
          confidence?: number
          node_id?: string
          source?: Database["public"]["Enums"]["classification_source"]
          trend_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trend_taxonomy_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trend_taxonomy_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trends: {
        Row: {
          created_at: string
          description: string | null
          embedding: string | null
          enrichment_version: string | null
          evidence_score: number
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          maturity_stage: Database["public"]["Enums"]["maturity_stage"]
          momentum_score: number
          opportunity_score: number
          signal_count: number
          slug: string
          status: Database["public"]["Enums"]["trend_status"]
          thesis: string | null
          title: string
          trend_type: Database["public"]["Enums"]["trend_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          embedding?: string | null
          enrichment_version?: string | null
          evidence_score?: number
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          maturity_stage?: Database["public"]["Enums"]["maturity_stage"]
          momentum_score?: number
          opportunity_score?: number
          signal_count?: number
          slug: string
          status?: Database["public"]["Enums"]["trend_status"]
          thesis?: string | null
          title: string
          trend_type: Database["public"]["Enums"]["trend_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          embedding?: string | null
          enrichment_version?: string | null
          evidence_score?: number
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          maturity_stage?: Database["public"]["Enums"]["maturity_stage"]
          momentum_score?: number
          opportunity_score?: number
          signal_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["trend_status"]
          thesis?: string | null
          title?: string
          trend_type?: Database["public"]["Enums"]["trend_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ranked_trends_for_me: {
        Args: {
          max_rows?: number
          w_evidence?: number
          w_momentum?: number
          w_opportunity?: number
          w_relevance?: number
        }
        Returns: {
          evidence_score: number
          match_score: number
          maturity_stage: Database["public"]["Enums"]["maturity_stage"]
          momentum_score: number
          opportunity_score: number
          relevance_score: number
          thesis: string
          title: string
          trend_id: string
          trend_type: Database["public"]["Enums"]["trend_type"]
        }[]
      }
      schedule_trend_enrichment: {
        Args: { ingest_secret: string; supabase_url: string }
        Returns: string
      }
      schedule_trend_ingestion: {
        Args: { ingest_secret: string; supabase_url: string }
        Returns: string
      }
    }
    Enums: {
      access_policy:
        | "api_licensed"
        | "api_public"
        | "rss"
        | "light_meta"
        | "manual"
        | "blocked"
      classification_source: "llm" | "human"
      maturity_stage:
        | "weak-signal"
        | "emerging"
        | "scaling"
        | "mainstream"
        | "mature"
        | "declining"
      node_status: "proposed" | "approved"
      saved_status: "watching" | "exploring" | "acting" | "dismissed"
      signal_type:
        | "search_interest"
        | "news_volume"
        | "social_velocity"
        | "launch"
        | "funding"
        | "repo_velocity"
        | "review_shift"
        | "ad_volume"
        | "curated_pick"
      source_kind:
        | "search"
        | "news"
        | "social"
        | "video"
        | "funding"
        | "launch"
        | "repo"
        | "reviews"
        | "ads"
        | "curated"
        | "dataset"
      taxonomy_facet: "sector" | "need" | "geo"
      trend_status: "candidate" | "published" | "archived"
      trend_type:
        | "consumer"
        | "startup"
        | "innovation"
        | "content"
        | "product"
        | "macro"
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
      access_policy: [
        "api_licensed",
        "api_public",
        "rss",
        "light_meta",
        "manual",
        "blocked",
      ],
      classification_source: ["llm", "human"],
      maturity_stage: [
        "weak-signal",
        "emerging",
        "scaling",
        "mainstream",
        "mature",
        "declining",
      ],
      node_status: ["proposed", "approved"],
      saved_status: ["watching", "exploring", "acting", "dismissed"],
      signal_type: [
        "search_interest",
        "news_volume",
        "social_velocity",
        "launch",
        "funding",
        "repo_velocity",
        "review_shift",
        "ad_volume",
        "curated_pick",
      ],
      source_kind: [
        "search",
        "news",
        "social",
        "video",
        "funding",
        "launch",
        "repo",
        "reviews",
        "ads",
        "curated",
        "dataset",
      ],
      taxonomy_facet: ["sector", "need", "geo"],
      trend_status: ["candidate", "published", "archived"],
      trend_type: [
        "consumer",
        "startup",
        "innovation",
        "content",
        "product",
        "macro",
      ],
    },
  },
} as const
