export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          short_name: string;
          primary_color: string;
          secondary_color: string;
          crest_template_id: string;
          created_at: string;
          first_match_completed_at: string | null;
          cash_balance: number;
          transfer_window_open: boolean;
          last_training_on: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          short_name: string;
          primary_color?: string;
          secondary_color?: string;
          crest_template_id?: string;
          created_at?: string;
          first_match_completed_at?: string | null;
          cash_balance?: number;
          transfer_window_open?: boolean;
          last_training_on?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          short_name?: string;
          primary_color?: string;
          secondary_color?: string;
          crest_template_id?: string;
          created_at?: string;
          first_match_completed_at?: string | null;
          cash_balance?: number;
          transfer_window_open?: boolean;
          last_training_on?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          shirt_number: number;
          pos: string;
          role: string;
          starter: boolean;
          captain: boolean;
          age: number;
          skill: number;
          status: string;
          nationality: string;
          version: number;
          created_at: string;
          departed_at: string | null;
          transfer_listed_at: string | null;
        };
        Insert: {
          id: string;
          club_id: string;
          name: string;
          shirt_number: number;
          pos: string;
          role: string;
          starter?: boolean;
          captain?: boolean;
          age: number;
          skill: number;
          status?: string;
          nationality?: string;
          version?: number;
          created_at?: string;
          departed_at?: string | null;
          transfer_listed_at?: string | null;
        };
        Update: {
          id?: string;
          club_id?: string;
          name?: string;
          shirt_number?: number;
          pos?: string;
          role?: string;
          starter?: boolean;
          captain?: boolean;
          age?: number;
          skill?: number;
          status?: string;
          nationality?: string;
          version?: number;
          created_at?: string;
          departed_at?: string | null;
          transfer_listed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'players_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      transfer_deals: {
        Row: {
          id: string;
          club_id: string;
          kind: string;
          player_id: string;
          market_id: string | null;
          amount: number;
          idempotency_key: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          kind: string;
          player_id: string;
          market_id?: string | null;
          amount: number;
          idempotency_key: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          kind?: string;
          player_id?: string;
          market_id?: string | null;
          amount?: number;
          idempotency_key?: string;
          completed_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transfer_deals_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      finance_movements: {
        Row: {
          id: string;
          club_id: string;
          category: string;
          label: string;
          amount: number;
          fixture_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          category: string;
          label: string;
          amount: number;
          fixture_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          category?: string;
          label?: string;
          amount?: number;
          fixture_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'finance_movements_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'finance_movements_fixture_id_fkey';
            columns: ['fixture_id'];
            isOneToOne: false;
            referencedRelation: 'fixtures';
            referencedColumns: ['id'];
          },
        ];
      };
      fixtures: {
        Row: {
          id: string;
          club_id: string;
          matchday: number;
          competition: string;
          opponent_club_id: string;
          is_home: boolean;
          status: string;
          home_score: number | null;
          away_score: number | null;
          played_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          club_id: string;
          matchday: number;
          competition?: string;
          opponent_club_id: string;
          is_home?: boolean;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          played_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          club_id?: string;
          matchday?: number;
          competition?: string;
          opponent_club_id?: string;
          is_home?: boolean;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          played_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fixtures_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      infra_meta: {
        Row: {
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      list_live_transfer_listings: {
        Args: { p_exclude_club_id: string };
        Returns: {
          player_id: string;
          player_name: string;
          pos: string;
          role: string;
          age: number;
          skill: number;
          shirt_number: number;
          seller_club_id: string;
          seller_club_name: string;
          seller_short_name: string;
          seller_window_open: boolean;
        }[];
      };
      complete_live_h2h_transfer: {
        Args: {
          p_buyer_club_id: string;
          p_seller_club_id: string;
          p_player_id: string;
          p_ask_snapshot: number;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
