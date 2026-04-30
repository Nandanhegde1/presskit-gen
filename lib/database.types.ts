export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      press_kits: {
        Row: {
          id: string
          user_id: string
          slug: string
          game_name: string
          tagline: string | null
          description: string | null
          release_date: string | null
          platforms: string[]
          website_url: string | null
          template_id: string
          is_premium: boolean
          custom_domain: string | null
          is_published: boolean
          view_count: number
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          game_name: string
          tagline?: string | null
          description?: string | null
          release_date?: string | null
          platforms?: string[]
          website_url?: string | null
          template_id?: string
          is_premium?: boolean
          custom_domain?: string | null
          is_published?: boolean
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          game_name?: string
          tagline?: string | null
          description?: string | null
          release_date?: string | null
          platforms?: string[]
          website_url?: string | null
          template_id?: string
          is_premium?: boolean
          custom_domain?: string | null
          is_published?: boolean
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      press_kit_assets: {
        Row: {
          id: string
          press_kit_id: string
          type: 'logo' | 'header' | 'screenshot' | 'trailer' | 'other'
          url: string
          filename: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          press_kit_id: string
          type: 'logo' | 'header' | 'screenshot' | 'trailer' | 'other'
          url: string
          filename: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          press_kit_id?: string
          type?: 'logo' | 'header' | 'screenshot' | 'trailer' | 'other'
          url?: string
          filename?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          display_order?: number
          created_at?: string
        }
      }
      press_kit_links: {
        Row: {
          id: string
          press_kit_id: string
          label: string
          url: string
          type: 'steam' | 'itch' | 'epic' | 'gog' | 'twitter' | 'youtube' | 'discord' | 'other' | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          press_kit_id: string
          label: string
          url: string
          type?: 'steam' | 'itch' | 'epic' | 'gog' | 'twitter' | 'youtube' | 'discord' | 'other' | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          press_kit_id?: string
          label?: string
          url?: string
          type?: 'steam' | 'itch' | 'epic' | 'gog' | 'twitter' | 'youtube' | 'discord' | 'other' | null
          display_order?: number
          created_at?: string
        }
      }
      press_kit_contacts: {
        Row: {
          id: string
          press_kit_id: string
          name: string
          role: string | null
          email: string | null
          phone: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          press_kit_id: string
          name: string
          role?: string | null
          email?: string | null
          phone?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          press_kit_id?: string
          name?: string
          role?: string | null
          email?: string | null
          phone?: string | null
          display_order?: number
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          is_premium: boolean
          price: number
          preview_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          is_premium?: boolean
          price?: number
          preview_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_premium?: boolean
          price?: number
          preview_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | null
          plan_type: 'custom_domain' | 'analytics' | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | null
          plan_type?: 'custom_domain' | 'analytics' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | null
          plan_type?: 'custom_domain' | 'analytics' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          press_kit_id: string
          event_type: 'view' | 'download' | 'asset_download'
          asset_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          country: string | null
          created_at: string
        }
        Insert: {
          id?: string
          press_kit_id: string
          event_type: 'view' | 'download' | 'asset_download'
          asset_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          press_kit_id?: string
          event_type?: 'view' | 'download' | 'asset_download'
          asset_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          country?: string | null
          created_at?: string
        }
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
  }
}
