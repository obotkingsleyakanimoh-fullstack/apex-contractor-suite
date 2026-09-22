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
      admin_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity: string | null
          entity_id: string | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          label: string
          open_time: string | null
          sort_order: number
        }
        Insert: {
          close_time?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          label: string
          open_time?: string | null
          sort_order?: number
        }
        Update: {
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          label?: string
          open_time?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          copyright_text: string | null
          country: string | null
          created_at: string
          currency: string
          currency_symbol: string
          default_og_image: string | null
          description: string | null
          email: string | null
          emergency_contact: string | null
          favicon_url: string | null
          footer_description: string | null
          id: string
          logo_url: string | null
          max_upload_mb: number
          phone: string | null
          phone_secondary: string | null
          rc_number: string | null
          site_description: string | null
          site_title: string | null
          state: string | null
          tagline: string | null
          updated_at: string
          whatsapp: string | null
          whatsapp_default_message: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string
          copyright_text?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          currency_symbol?: string
          default_og_image?: string | null
          description?: string | null
          email?: string | null
          emergency_contact?: string | null
          favicon_url?: string | null
          footer_description?: string | null
          id?: string
          logo_url?: string | null
          max_upload_mb?: number
          phone?: string | null
          phone_secondary?: string | null
          rc_number?: string | null
          site_description?: string | null
          site_title?: string | null
          state?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_default_message?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          copyright_text?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          currency_symbol?: string
          default_og_image?: string | null
          description?: string | null
          email?: string | null
          emergency_contact?: string | null
          favicon_url?: string | null
          footer_description?: string | null
          id?: string
          logo_url?: string | null
          max_upload_mb?: number
          phone?: string | null
          phone_secondary?: string | null
          rc_number?: string | null
          site_description?: string | null
          site_title?: string | null
          state?: string | null
          tagline?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_default_message?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          project_id: string | null
          published: boolean
          question: string
          service_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          published?: boolean
          question: string
          service_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          project_id?: string | null
          published?: boolean
          question?: string
          service_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_links: {
        Row: {
          created_at: string
          id: string
          is_external: boolean
          label: string
          section: string
          sort_order: number
          url: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_external?: boolean
          label: string
          section: string
          sort_order?: number
          url: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_external?: boolean
          label?: string
          section?: string
          sort_order?: number
          url?: string
          visible?: boolean
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          public_url: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          public_url: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          public_url?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          id: string
          is_external: boolean
          label: string
          protected: boolean
          sort_order: number
          updated_at: string
          url: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_external?: boolean
          label: string
          protected?: boolean
          sort_order?: number
          updated_at?: string
          url: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_external?: boolean
          label?: string
          protected?: boolean
          sort_order?: number
          updated_at?: string
          url?: string
          visible?: boolean
        }
        Relationships: []
      }
      office_locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          google_maps_url: string | null
          id: string
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          name: string
          published: boolean
          service_radius_km: number
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          published?: boolean
          service_radius_km?: number
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          google_maps_url?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          published?: boolean
          service_radius_km?: number
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          category_id: string | null
          city: string | null
          client_type: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          featured: boolean
          gallery: Json
          hero_image_url: string | null
          id: string
          location: string | null
          og_image_url: string | null
          outcome: string | null
          project_date: string | null
          published: boolean
          scope_of_work: string | null
          seo_description: string | null
          seo_title: string | null
          services_provided: Json
          slug: string
          sort_order: number
          state: string | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          category_id?: string | null
          city?: string | null
          client_type?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          location?: string | null
          og_image_url?: string | null
          outcome?: string | null
          project_date?: string | null
          published?: boolean
          scope_of_work?: string | null
          seo_description?: string | null
          seo_title?: string | null
          services_provided?: Json
          slug: string
          sort_order?: number
          state?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          category_id?: string | null
          city?: string | null
          client_type?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          location?: string | null
          og_image_url?: string | null
          outcome?: string | null
          project_date?: string | null
          published?: boolean
          scope_of_work?: string | null
          seo_description?: string | null
          seo_title?: string | null
          services_provided?: Json
          slug?: string
          sort_order?: number
          state?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request_files: {
        Row: {
          created_at: string
          file_name: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          quote_request_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          quote_request_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          quote_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_files_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          additional_requirements: string | null
          assigned_to: string | null
          budget_range: string | null
          company_name: string | null
          consent: boolean
          created_at: string
          customer_name: string
          customer_notes: string | null
          email: string | null
          estimated_value: number | null
          follow_up_date: string | null
          id: string
          internal_notes: string | null
          phone: string
          preferred_contact: string | null
          preferred_date: string | null
          project_description: string
          project_location: string | null
          property_type: string | null
          service_id: string | null
          service_label: string | null
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
        }
        Insert: {
          additional_requirements?: string | null
          assigned_to?: string | null
          budget_range?: string | null
          company_name?: string | null
          consent?: boolean
          created_at?: string
          customer_name: string
          customer_notes?: string | null
          email?: string | null
          estimated_value?: number | null
          follow_up_date?: string | null
          id?: string
          internal_notes?: string | null
          phone: string
          preferred_contact?: string | null
          preferred_date?: string | null
          project_description: string
          project_location?: string | null
          property_type?: string | null
          service_id?: string | null
          service_label?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Update: {
          additional_requirements?: string | null
          assigned_to?: string | null
          budget_range?: string | null
          company_name?: string | null
          consent?: boolean
          created_at?: string
          customer_name?: string
          customer_notes?: string | null
          email?: string | null
          estimated_value?: number | null
          follow_up_date?: string | null
          id?: string
          internal_notes?: string | null
          phone?: string
          preferred_contact?: string | null
          preferred_date?: string | null
          project_description?: string
          project_location?: string | null
          property_type?: string | null
          service_id?: string | null
          service_label?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          area: string | null
          available: boolean
          city: string
          created_at: string
          description: string | null
          id: string
          priority: number
          published: boolean
          state: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          available?: boolean
          city: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: number
          published?: boolean
          state?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          available?: boolean
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: number
          published?: boolean
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          published?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          benefits: Json
          category_id: string | null
          created_at: string
          cta_text: string | null
          featured: boolean
          features: Json
          full_description: string | null
          gallery: Json
          hero_image_url: string | null
          id: string
          og_image_url: string | null
          process_steps: Json
          published: boolean
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          show_price: boolean
          slug: string
          sort_order: number
          starting_price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: Json
          category_id?: string | null
          created_at?: string
          cta_text?: string | null
          featured?: boolean
          features?: Json
          full_description?: string | null
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          og_image_url?: string | null
          process_steps?: Json
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          show_price?: boolean
          slug: string
          sort_order?: number
          starting_price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: Json
          category_id?: string | null
          created_at?: string
          cta_text?: string | null
          featured?: boolean
          features?: Json
          full_description?: string | null
          gallery?: Json
          hero_image_url?: string | null
          id?: string
          og_image_url?: string | null
          process_steps?: Json
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          show_price?: boolean
          slug?: string
          sort_order?: number
          starting_price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          platform: string
          sort_order: number
          url: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          sort_order?: number
          url: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          sort_order?: number
          url?: string
          visible?: boolean
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          customer_company: string | null
          customer_location: string | null
          customer_name: string
          customer_photo_url: string | null
          featured: boolean
          id: string
          is_demo: boolean
          published: boolean
          rating: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_company?: string | null
          customer_location?: string | null
          customer_name: string
          customer_photo_url?: string | null
          featured?: boolean
          id?: string
          is_demo?: boolean
          published?: boolean
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_company?: string | null
          customer_location?: string | null
          customer_name?: string
          customer_photo_url?: string | null
          featured?: boolean
          id?: string
          is_demo?: boolean
          published?: boolean
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      website_settings: {
        Row: {
          accent_color: string
          accent_font: string
          background_color: string
          body_font: string
          body_font_size: number
          body_font_weight: number
          border_color: string
          button_font_size: number
          button_font_weight: number
          footer_background: string
          h1_font_size: number
          h2_font_size: number
          h3_font_size: number
          h4_font_size: number
          heading_color: string
          heading_font: string
          heading_font_weight: number
          hero_overlay_color: string
          hero_overlay_opacity: number
          id: string
          muted_text_color: string
          navbar_background: string
          nav_font_size: number
          nav_font_weight: number
          primary_color: string
          secondary_color: string
          site_name: string
          singleton: boolean
          small_text_size: number
          surface_color: string
          text_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          accent_font?: string
          background_color?: string
          body_font?: string
          body_font_size?: number
          body_font_weight?: number
          border_color?: string
          button_font_size?: number
          button_font_weight?: number
          footer_background?: string
          h1_font_size?: number
          h2_font_size?: number
          h3_font_size?: number
          h4_font_size?: number
          heading_color?: string
          heading_font?: string
          heading_font_weight?: number
          hero_overlay_color?: string
          hero_overlay_opacity?: number
          id?: string
          muted_text_color?: string
          navbar_background?: string
          nav_font_size?: number
          nav_font_weight?: number
          primary_color?: string
          secondary_color?: string
          site_name?: string
          singleton?: boolean
          small_text_size?: number
          surface_color?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          accent_font?: string
          background_color?: string
          body_font?: string
          body_font_size?: number
          body_font_weight?: number
          border_color?: string
          button_font_size?: number
          button_font_weight?: number
          footer_background?: string
          h1_font_size?: number
          h2_font_size?: number
          h3_font_size?: number
          h4_font_size?: number
          heading_color?: string
          heading_font?: string
          heading_font_weight?: number
          hero_overlay_color?: string
          hero_overlay_opacity?: number
          id?: string
          muted_text_color?: string
          navbar_background?: string
          nav_font_size?: number
          nav_font_weight?: number
          primary_color?: string
          secondary_color?: string
          site_name?: string
          singleton?: boolean
          small_text_size?: number
          surface_color?: string
          text_color?: string
          updated_at?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"] | null
          target_user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      message_status: "unread" | "read" | "responded" | "closed"
      quote_status:
        | "new"
        | "contacted"
        | "inspection_required"
        | "quote_prepared"
        | "negotiation"
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled"
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
    Enums: {
      app_role: ["super_admin", "admin", "editor"],
      message_status: ["unread", "read", "responded", "closed"],
      quote_status: [
        "new",
        "contacted",
        "inspection_required",
        "quote_prepared",
        "negotiation",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
