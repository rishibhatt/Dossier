export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PlanId = "free" | "starter" | "pro"

export type ReferralStatus = "signed_up" | "qualified" | "rejected"

export type CreditReason =
  | "referral_referrer"
  | "referral_referee"
  | "spend_shuffle_pack"
  | "spend_starter_unlock"
  | "admin_adjustment"

export type CancelReason = "got_job" | "too_expensive" | "missing_feature" | "hard_to_use" | "only_once" | "other"

export type CancelOutcome = "kept_plan" | "accepted_offer" | "downgraded" | "feedback_only"

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          username: string | null
          plan: PlanId
          plan_expires_at: string | null
          starter_unlocked_via_credits: boolean
          signup_ip_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          plan?: PlanId
          plan_expires_at?: string | null
          starter_unlocked_via_credits?: boolean
          signup_ip_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          plan?: PlanId
          plan_expires_at?: string | null
          starter_unlocked_via_credits?: boolean
          signup_ip_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          id: number
          subject: string
          user_id: string | null
          kind: string
          created_at: string
        }
        Insert: {
          id?: number
          subject: string
          user_id?: string | null
          kind: string
          created_at?: string
        }
        Update: {
          id?: number
          subject?: string
          user_id?: string | null
          kind?: string
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_subscription_id: string | null
          plan: "starter" | "pro"
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_subscription_id?: string | null
          plan: "starter" | "pro"
          status: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_subscription_id?: string | null
          plan?: "starter" | "pro"
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          id: string
          provider: string
          provider_event_id: string
          payload: Json
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          provider_event_id: string
          payload: Json
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          provider_event_id?: string
          payload?: Json
          processed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      dossiers: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          dossier_id: string
          user_id: string
          name: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dossier_id: string
          user_id: string
          name: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dossier_id?: string
          user_id?: string
          name?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          entity_type: string
          entity_id: string
          action: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entity_type: string
          entity_id: string
          action: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entity_type?: string
          entity_id?: string
          action?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      published_portfolios: {
        Row: {
          id: string
          slug: string
          payload: Json
          user_id: string | null
          indexable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          payload: Json
          user_id?: string | null
          indexable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          payload?: Json
          user_id?: string | null
          indexable?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          user_id: string
          code: string
          created_at: string
        }
        Insert: {
          user_id: string
          code: string
          created_at?: string
        }
        Update: {
          user_id?: string
          code?: string
          created_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          code: string
          status: ReferralStatus
          reject_reason: string | null
          clicked_at: string | null
          referee_ip_hash: string | null
          created_at: string
          qualified_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_id: string
          code: string
          status?: ReferralStatus
          reject_reason?: string | null
          clicked_at?: string | null
          referee_ip_hash?: string | null
          created_at?: string
          qualified_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_id?: string
          code?: string
          status?: ReferralStatus
          reject_reason?: string | null
          clicked_at?: string | null
          referee_ip_hash?: string | null
          created_at?: string
          qualified_at?: string | null
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          id: number
          user_id: string
          delta: number
          reason: CreditReason
          referral_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          delta: number
          reason: CreditReason
          referral_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          delta?: number
          reason?: CreditReason
          referral_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cancellation_feedback: {
        Row: {
          id: string
          user_id: string
          plan: string
          reason: CancelReason
          details: string | null
          offer: string | null
          outcome: CancelOutcome
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          reason: CancelReason
          details?: string | null
          offer?: string | null
          outcome: CancelOutcome
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          reason?: CancelReason
          details?: string | null
          offer?: string | null
          outcome?: CancelOutcome
          created_at?: string
        }
        Relationships: []
      }
      email_log: {
        Row: { id: number; user_id: string; kind: string; created_at: string }
        Insert: { id?: number; user_id: string; kind: string; created_at?: string }
        Update: { id?: number; user_id?: string; kind?: string; created_at?: string }
        Relationships: []
      }
      contact_messages: {
        Row: { id: string; name: string; email: string; message: string; user_id: string | null; ip_hash: string | null; status: "new" | "handled"; created_at: string }
        Insert: { id?: string; name: string; email: string; message: string; user_id?: string | null; ip_hash?: string | null; status?: "new" | "handled"; created_at?: string }
        Update: { id?: string; name?: string; email?: string; message?: string; user_id?: string | null; ip_hash?: string | null; status?: "new" | "handled"; created_at?: string }
        Relationships: []
      }
      admin_audit: {
        Row: { id: number; admin_id: string; action: string; target_user: string | null; details: Json; created_at: string }
        Insert: { id?: number; admin_id: string; action: string; target_user?: string | null; details?: Json; created_at?: string }
        Update: { id?: number; admin_id?: string; action?: string; target_user?: string | null; details?: Json; created_at?: string }
        Relationships: []
      }
    }
    Views: {
      credit_balances: {
        Row: {
          user_id: string
          balance: number
        }
        Relationships: []
      }
    }
    Functions: {
      qualify_referral: {
        Args: { p_referee: string }
        Returns: string
      }
      spend_credits: {
        Args: { p_user: string; p_item: string }
        Returns: Json
      }
      admin_overview: {
        Args: { p_days?: number }
        Returns: Json
      }
      prune_usage_events: {
        Args: { older_than?: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
