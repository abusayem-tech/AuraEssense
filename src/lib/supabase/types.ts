/**
 * Supabase schema type. Kept permissive (index-signature tables) so the app
 * compiles without a live DB; strongly-typed domain models live in
 * `src/types/index.ts` and are used at the application layer.
 *
 * Regenerate precise types later with:
 *   supabase gen types typescript --project-id <ref> > src/lib/supabase/types.gen.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GenericTable = {
  Row: Record<string, Json | undefined | unknown>;
  Insert: Record<string, Json | undefined | unknown>;
  Update: Record<string, Json | undefined | unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      [key: string]: GenericTable;
    };
    Views: {
      [key: string]: { Row: Record<string, Json | undefined | unknown> };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: Record<string, unknown>;
    };
  };
};
